// Self-hosted visitor map worker.
// Records per-country and per-city pageviews in D1 and serves aggregated stats.
// The daily repo snapshot is pulled from /stats/full by a GitHub Actions
// workflow — the Worker itself holds no GitHub credentials.
//
// Recorded fields (aggregates only, no personal data):
//   visits(country, count)              lifetime totals per country
//   visits_daily(day, country, count)   UTC daily breakdown
//   referrers_daily(day, host, count)   UTC daily breakdown of coarse referrer hosts
//   city_visits(country, city, lat, lon, count)  city-level aggregates from edge IP geolocation
// Known bots/crawlers are not counted. No IPs / UAs / identifiers are stored.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const BOT_RE = /bot|crawl|spider|slurp|headless|curl|wget|python-requests|go-http-client|libwww-perl|java\/|okhttp|scrapy|facebookexternalhit|pingdom|uptime|bytespider|gptbot|claudebot/i;

const MULTI_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "com.cn", "net.cn", "org.cn", "gov.cn", "edu.cn", "ac.cn",
  "com.au", "net.au", "co.jp", "or.jp", "ne.jp", "com.br", "com.hk", "com.tw",
  "edu.tw", "com.sg", "com.my",
]);

// Client sends just the hostname of document.referrer (never a full URL with query strings).
function sanitizeHost(raw) {
  if (!raw || typeof raw !== "string") return "direct";
  const h = raw.toLowerCase().trim().replace(/^www\./, "");
  if (!/^[a-z0-9.-]+$/.test(h) || h.length > 60) return "direct";
  const parts = h.split(".");
  if (parts.length < 2) return "direct";
  const take = MULTI_PART_SUFFIXES.has(parts.slice(-2).join(".")) ? 3 : 2;
  return parts.slice(-take).join(".");
}

function sanitizeCity(raw) {
  if (typeof raw !== "string") return null;
  const c = raw.trim().replace(/[^\w .,'\-()]/g, "").slice(0, 60);
  return c || null;
}

// City-level geo from the edge; returns null when unusable (missing, invalid, or 0/0 middle-of-nowhere).
function edgeGeo(cf) {
  if (!cf) return null;
  const lat = Number(cf.latitude);
  const lon = Number(cf.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  if (lat === 0 && lon === 0) return null;
  const city = sanitizeCity(cf.city) || sanitizeCity(cf.region) || "Unknown";
  return { city, lat, lon };
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

// Light payload for the frontend globe (cached at the edge for 5 min).
async function getStats(env) {
  const [countryRes, cityRes] = await env.DB.batch([
    env.DB.prepare("SELECT country, SUM(count) AS c FROM visits GROUP BY country"),
    env.DB.prepare("SELECT country, city, lat, lon, count FROM city_visits ORDER BY count DESC LIMIT 1000"),
  ]);
  const counts = {};
  let total = 0;
  for (const r of countryRes.results) {
    counts[r.country] = r.c;
    total += r.c;
  }
  return { total, counts, cities: cityRes.results, updated: new Date().toISOString() };
}

// Constant-time-ish string compare (avoids early-exit timing leaks).
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Cheap per-isolate rate limit: cap writes per country per minute. Not a hard
// guarantee across isolates, but stops trivial scripts from inflating counts.
const RATE_LIMIT_PER_MIN = 60;
const rateBuckets = new Map(); // country -> { minute, count }
function rateLimited(country) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const b = rateBuckets.get(country);
  if (!b || b.minute !== minute) {
    rateBuckets.set(country, { minute, count: 1 });
    if (rateBuckets.size > 500) rateBuckets.clear(); // crude memory bound
    return false;
  }
  b.count += 1;
  return b.count > RATE_LIMIT_PER_MIN;
}

// Rich payload for repo snapshots (last 180 days of time series; older history lives in git).
async function getFullStats(env) {
  const [countryRes, dailyRes, refRes, cityRes] = await env.DB.batch([
    env.DB.prepare("SELECT country, SUM(count) AS c FROM visits GROUP BY country"),
    env.DB.prepare("SELECT day, country, count AS c FROM visits_daily WHERE day >= date('now','-180 day')"),
    env.DB.prepare("SELECT day, host, count AS c FROM referrers_daily WHERE day >= date('now','-180 day')"),
    env.DB.prepare("SELECT country, city, lat, lon, count FROM city_visits ORDER BY count DESC LIMIT 2000"),
  ]);

  const counts = {};
  let total = 0;
  for (const r of countryRes.results) {
    counts[r.country] = r.c;
    total += r.c;
  }
  const daily = {};
  for (const r of dailyRes.results) {
    (daily[r.day] = daily[r.day] || {})[r.country] = r.c;
  }
  const referrers = {};
  for (const r of refRes.results) {
    (referrers[r.day] = referrers[r.day] || {})[r.host] = r.c;
  }
  return { total, counts, daily, referrers, cities: cityRes.results, updated: new Date().toISOString() };
}

async function recordVisit(env, country, refHost, geo) {
  const day = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  const stmts = [
    env.DB.prepare(
      `INSERT INTO visits (country, count, updated_at) VALUES (?1, 1, strftime('%s','now'))
       ON CONFLICT(country) DO UPDATE SET count = count + 1, updated_at = strftime('%s','now')`
    ).bind(country),
    env.DB.prepare(
      `INSERT INTO visits_daily (day, country, count) VALUES (?1, ?2, 1)
       ON CONFLICT(day, country) DO UPDATE SET count = count + 1`
    ).bind(day, country),
    env.DB.prepare(
      `INSERT INTO referrers_daily (day, host, count) VALUES (?1, ?2, 1)
       ON CONFLICT(day, host) DO UPDATE SET count = count + 1`
    ).bind(day, refHost),
  ];
  if (geo) {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO city_visits (country, city, lat, lon, count, updated_at)
         VALUES (?1, ?2, ?3, ?4, 1, strftime('%s','now'))
         ON CONFLICT(country, city) DO UPDATE SET count = count + 1, updated_at = strftime('%s','now')`
      ).bind(country, geo.city, geo.lat, geo.lon)
    );
  }
  await env.DB.batch(stmts);
}

// Full stats snapshot, consumed by the repo's GitHub Actions workflow
// (.github/workflows/visitor-map-snapshot.yml) which commits it to the repo.
// The workflow authenticates with the shared SNAPSHOT_SECRET, so the Worker
// holds no GitHub credentials at all.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === "/visit") {
      const ua = request.headers.get("User-Agent") || "";
      if (BOT_RE.test(ua)) {
        return jsonResponse({ ok: true, counted: false }); // silently ignore known bots
      }
      const country = request.cf && request.cf.country;
      if (!country) {
        return jsonResponse({ ok: false, reason: "country unavailable" });
      }
      if (rateLimited(country)) {
        return jsonResponse({ ok: true, counted: false, reason: "rate limited" }); // pretend success, don't record
      }

      let refHost = "direct";
      try {
        const body = await request.json();
        refHost = sanitizeHost(body && body.referrer);
      } catch (e) {
        // empty/invalid body is fine -> direct
      }

      const geo = edgeGeo(request.cf);
      await recordVisit(env, country, refHost, geo);
      return jsonResponse({ ok: true, counted: true, country, city: geo ? geo.city : null });
    }

    if (url.pathname === "/stats" || url.pathname === "/") {
      const body = JSON.stringify(await getStats(env));
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300", // spare D1 a read on every page view
          ...CORS,
        },
      });
    }

    if (url.pathname === "/stats/full") {
      // Snapshot payload for the GitHub Actions workflow, protected by the
      // shared secret. Served pretty-printed so the workflow can commit it
      // verbatim.
      if (env.SNAPSHOT_SECRET && !safeEqual(request.headers.get("X-Snapshot-Secret") || "", env.SNAPSHOT_SECRET)) {
        return jsonResponse({ ok: false, reason: "unauthorized" }, 401);
      }
      const body = JSON.stringify(await getFullStats(env), null, 2) + "\n";
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          ...CORS,
        },
      });
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
};
