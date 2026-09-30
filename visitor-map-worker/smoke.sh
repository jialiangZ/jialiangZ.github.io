#!/usr/bin/env bash
# Smoke test for the deployed visitor-map worker.
# Usage: ./smoke.sh [worker-url]   (default: the production URL)
set -euo pipefail
BASE="${1:-https://visitor-map.1690608011qq.workers.dev}"

echo "== GET /stats =="
curl -fsS -D - -o /tmp/stats.json "$BASE/stats" | grep -iE "^HTTP|cache-control|access-control-allow-origin"
python3 -c "import json;d=json.load(open('/tmp/stats.json'));print('total:',d['total'],'countries:',len(d['counts']))"

echo "== POST /visit (bot UA must NOT count) =="
curl -fsS -H 'User-Agent: python-requests/2.31' -d '{"referrer":"test"}' "$BASE/visit"

echo "== POST /visit (normal UA) =="
curl -fsS -H 'User-Agent: Mozilla/5.0' -d '{"referrer":"github.com"}' "$BASE/visit"

echo "== POST /snapshot without secret must 401 =="
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/snapshot")
[ "$code" = "401" ] && echo "401 OK" || { echo "FAIL: got $code"; exit 1; }
