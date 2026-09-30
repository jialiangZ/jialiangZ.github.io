// Self-hosted visitor map worker.
// Records per-country pageviews in D1, serves aggregated stats,
// and commits a daily snapshot to the GitHub repo (data lives in your git history).
//
// Recorded fields (aggregates only, no personal data):
//   visits(country, count)              lifetime totals per country
//   visits_daily(day, country, count)   UTC daily breakdown
//   referrers_daily(day, host, count)   UTC daily breakdown of coarse referrer hosts
// Known bots/crawlers are not counted.

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

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

// Light payload for the frontend widget.
async function getStats(env) {
  const { results } = await env.DB.prepare(
    "SELECT country, SUM(count) AS c FROM visits GROUP BY country"
  ).all();
  const counts = {};
  let total = 0;
  for (const row of results) {
    counts[row.country] = row.c;
    total += row.c;
  }
  return { total, counts, updated: new Date().toISOString() };
}

// Rich payload for repo snapshots (last 180 days; older history lives in git).
async function getFullStats(env) {
  const [countryRes, dailyRes, refRes] = await env.DB.batch([
    env.DB.prepare("SELECT country, SUM(count) AS c FROM visits GROUP BY country"),
    env.DB.prepare("SELECT day, country, count AS c FROM visits_daily WHERE day >= date('now','-180 day')"),
    env.DB.prepare("SELECT day, host, count AS c FROM referrers_daily WHERE day >= date('now','-180 day')"),
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
  return { total, counts, daily, referrers, updated: new Date().toISOString() };
}

async function recordVisit(env, country, refHost) {
  const day = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  await env.DB.batch([
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
  ]);
}

async function commitSnapshotToGitHub(env) {
  const stats = await getFullStats(env);
  const path = env.STATS_FILE_PATH;
  const branch = env.STATS_BRANCH;
  const api = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`;

  const headers = {
    Authorization: `Bearer ${env.GITHUB_PAT}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "visitor-map-worker",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const current = await fetch(`${api}?ref=${branch}`, { headers });
  let sha = null;
  if (current.status === 200) {
    sha = (await current.json()).sha;
  } else if (current.status !== 404) {
    throw new Error(`GitHub GET ${path} failed: ${current.status}`);
  }

  const content = btoa(
    String.fromCharCode(...new TextEncoder().encode(JSON.stringify(stats, null, 2) + "\n"))
  );

  const put = await fetch(api, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: "chore(visitor-map): daily stats snapshot [skip ci]",
      content,
      sha,
      branch,
    }),
  });
  if (!put.ok) throw new Error(`GitHub PUT ${path} failed: ${put.status} ${await put.text()}`);
  return stats;
}

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

      let refHost = "direct";
      try {
        const body = await request.json();
        refHost = sanitizeHost(body && body.referrer);
      } catch (e) {
        // empty/invalid body is fine -> direct
      }

      await recordVisit(env, country, refHost);
      return jsonResponse({ ok: true, counted: true, country, referrer: refHost });
    }

    if (url.pathname === "/stats" || url.pathname === "/") {
      return jsonResponse(await getStats(env));
    }

    if (url.pathname === "/snapshot" && request.method === "POST") {
      // Manual trigger, protected by a shared secret (cron calls run regardless)
      if (env.SNAPSHOT_SECRET && request.headers.get("X-Snapshot-Secret") !== env.SNAPSHOT_SECRET) {
        return jsonResponse({ ok: false, reason: "unauthorized" }, 401);
      }
      await commitSnapshotToGitHub(env);
      return jsonResponse({ ok: true });
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },

  async scheduled(event, env) {
    await commitSnapshotToGitHub(env);
  },
};
