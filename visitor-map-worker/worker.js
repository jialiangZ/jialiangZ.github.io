// Self-hosted visitor map worker.
// Records per-country pageviews in D1, serves aggregated stats,
// and commits a daily snapshot to the GitHub repo (data lives in your git history).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

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

async function recordVisit(env, country) {
  await env.DB.prepare(
    `INSERT INTO visits (country, count, updated_at) VALUES (?1, 1, strftime('%s','now'))
     ON CONFLICT(country) DO UPDATE SET count = count + 1, updated_at = strftime('%s','now')`
  )
    .bind(country)
    .run();
}

async function commitSnapshotToGitHub(env) {
  const stats = await getStats(env);
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
      const country = request.cf && request.cf.country;
      if (!country) {
        return jsonResponse({ ok: false, reason: "country unavailable" });
      }
      await recordVisit(env, country);
      return jsonResponse({ ok: true, country });
    }

    if (url.pathname === "/stats" || url.pathname === "/") {
      return jsonResponse(await getStats(env));
    }

    if (url.pathname === "/snapshot" && request.method === "POST") {
      // Manual trigger, protected by a shared secret (optional; cron calls run regardless)
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
