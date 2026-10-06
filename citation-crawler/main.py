# Citation stats crawler.
#
# Data layers (first that succeeds wins):
#   1. SerpAPI "google_scholar_author" engine  -> exact Google Scholar numbers.
#      Requires the SERPAPI_KEY secret (free tier: 100 searches/month, we use ~9).
#   2. OpenAlex title search -> always-available fallback with conservative
#      counts; labelled as its own source so the page never misrepresents data.
#
# Papers are parsed from ../index.md (paper-title links), so new publications
# added to the homepage are picked up automatically.
#
# Output (results/):
#   gs_data.json            {citedby, publications, source, updated}
#                           publications keyed by Google-Scholar id when known
#                           AND by normalized title (always).
#   gs_data_shieldsio.json  shields.io endpoint badge payload.

import datetime
import difflib
import json
import os
import re
import sys

import httpx

GS_USER = os.environ.get("GOOGLE_SCHOLAR_ID", "").strip()
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "").strip()
HERE = os.path.dirname(os.path.abspath(__file__))


def norm(title):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", title.lower())).strip()


def parse_papers():
    # Works for both the legacy Jekyll source and the Astro build output.
    for candidate in ("../dist/index.html", "../index.md"):
        p = os.path.join(HERE, candidate)
        if os.path.exists(p):
            html = open(p, encoding="utf-8").read()
            return re.findall(
                r'class="paper-title"><a href="https://arxiv\.org/abs/([\d.]+)v?\d*[^"]*">([^<]+)</a>', html
            )
    raise SystemExit("no index source found (expected dist/index.html or index.md)")


def write_output(total, pubs, source):
    os.makedirs(os.path.join(HERE, "results"), exist_ok=True)
    data = {
        "citedby": total,
        "publications": pubs,
        "source": source,
        "updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(os.path.join(HERE, "results", "gs_data.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    shield = {"schemaVersion": 1, "label": "citations", "message": str(total)}
    with open(os.path.join(HERE, "results", "gs_data_shieldsio.json"), "w", encoding="utf-8") as f:
        json.dump(shield, f, ensure_ascii=False)
    print(f"[ok] source={source} total={total} papers={len(pubs)}")


def from_serpapi():
    r = httpx.get(
        "https://serpapi.com/search.json",
        params={
            "engine": "google_scholar_author",
            "author_id": GS_USER,
            "num": 100,
            "api_key": SERPAPI_KEY,
        },
        timeout=60,
    )
    r.raise_for_status()
    d = r.json()
    if "error" in d:
        raise RuntimeError(d["error"])
    total = 0
    try:
        total = int(d["cited_by"]["table"][0]["citations"]["all"])
    except (KeyError, IndexError, TypeError, ValueError):
        pass
    pubs = {}
    for a in d.get("articles", []):
        title = a.get("title", "")
        n = int(a.get("cited_by", {}).get("value", 0) or 0)
        entry = {"title": title, "num_citations": n}
        m = re.search(r"citation_for_view=([\w-]+:[\w-]+)", a.get("link", "") or "")
        if m:
            pubs[m.group(1)] = entry
        pubs[norm(title)] = entry
    if not pubs and not total:
        raise RuntimeError("serpapi returned no data")
    return total, pubs, "google-scholar"


def from_openalex(papers):
    pubs = {}
    total = 0
    with httpx.Client(timeout=30) as c:
        for arxiv_id, title in papers:
            n = 0
            try:
                r = c.get(
                    "https://api.openalex.org/works",
                    params={
                        "filter": f"title.search:{title}",
                        "per-page": 5,
                        "select": "title,cited_by_count",
                        "mailto": "webmaster@jialiangz.github.io",
                    },
                )
                r.raise_for_status()
                for w in r.json().get("results", []):
                    if difflib.SequenceMatcher(
                        None, norm(title), norm(w.get("title", ""))
                    ).ratio() >= 0.75:
                        n = max(n, int(w.get("cited_by_count", 0)))
            except Exception as e:
                print(f"[warn] openalex failed for {arxiv_id}: {e}", file=sys.stderr)
            pubs[norm(title)] = {"title": title, "num_citations": n}
            total += n
    return total, pubs, "openalex"


def main():
    papers = parse_papers()
    print(f"[info] {len(papers)} papers parsed")

    if SERPAPI_KEY and GS_USER:
        try:
            total, pubs, source = from_serpapi()
            return write_output(total, pubs, source)
        except Exception as e:
            print(f"[warn] serpapi failed, falling back to openalex: {e}", file=sys.stderr)
    else:
        print("[info] SERPAPI_KEY/GOOGLE_SCHOLAR_ID not set; skipping Google Scholar source")

    total, pubs, source = from_openalex(papers)
    return write_output(total, pubs, source)


if __name__ == "__main__":
    main()
