# Astro Academic Homepage

English | [简体中文](README_zh.md)

A modern academic personal homepage template: **go live by editing one config file**, with automatic citation tracking, an optional self-hosted visitor map, and zero third-party CDN dependencies.

Visually based on [acad-homepage](https://github.com/RayeRen/acad-homepage.github.io) (the Minimal Mistakes theme), rebuilt with [Astro](https://astro.build) — 2.5s builds, componentized, centrally configured.

<img width="2469" height="1420" alt="image" src="https://github.com/user-attachments/assets/99d1009e-97be-43bc-8ff2-67be5f5389be" />


## Quick Start (5 minutes)

1. Click the green **Use this template** button and name the repo `your-username.github.io`
2. Edit **`src/config.ts`** — the only file you need to touch: name, affiliation, bio, social links, navigation, and publication list all live here
3. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**
4. (Optional) Replace the assets in `images/` — `avatar.webp`, `og-card.png`, and `papers/`; update `.github/FUNDING.yml` with your own sponsorship account or delete it

GitHub Actions builds and deploys automatically on every push.

## Advanced (optional features)

### Automatic citation tracking (recommended)

Citation badges on the homepage and per-paper citation counts update automatically (Mondays and Thursdays):

1. (Recommended) Sign up for a free [SerpAPI](https://serpapi.com) account (250 searches/month; this site uses about 9) and get an API key
2. Go to **Settings → Secrets and variables → Actions → New repository secret** and add two secrets:
   - `SERPAPI_KEY` = your SerpAPI key (exact Google Scholar data)
   - `GOOGLE_SCHOLAR_ID` = the ID after `user=` in your Google Scholar profile URL
3. That's it. The publication list is parsed from the build output — add a paper with an arXiv link to `PAPERS` in `src/config.ts` and its citation count will be tracked automatically

> No secrets configured? It gracefully falls back to OpenAlex data (a more conservative counting method, and the page labels the source).

### Visitor map (optional)

A self-hosted 3D globe visitor map (Cloudflare Worker + D1, no third-party analytics — the data lives in your own git history). Takes about 10 minutes to deploy, see **[`visitor-map-worker/README.md`](visitor-map-worker/README.md)**. To disable it, set `VISITOR_MAP.enabled` to `false` in `src/config.ts`.

## Features

- **Zero external CDNs**: FontAwesome is compiled into the main CSS, jQuery/globe.gl are self-hosted — no broken images from mainland China
- **SEO**: Open Graph / Twitter Card / JSON-LD (schema.org/Person) / sitemap / robots.txt
- **Three-tier citation data fallback**: same-origin data → jsdelivr CDN → raw.githubusercontent
- **Two-layer visitor map failover**: live Worker data → daily repo snapshot (automatically degrades when the Worker is unreachable)
- **CI**: build assertions on every push; weekly full-site external link health check every Monday
- **Privacy**: the visitor map stores only country/city-level aggregate counts — no IPs, user agents, or personal identifiers; known bots are not counted

## Repository Structure

| Path | Description |
|---|---|
| `src/config.ts` | **All personalization config** (site / author / navigation / papers / visitor map toggle) |
| `src/pages/` | Pages (index.astro / 404.astro) |
| `src/components/` | Components (SeoHead / Masthead / AuthorProfile / PaperBox) |
| `src/styles/` | SCSS (theme tree `sass/` + custom `sass/custom.scss`) |
| `public/` | Static assets published as-is (images/, data/, vendored libs, robots.txt) |
| `visitor-map-worker/` | Visitor map Worker source (optional module) |
| `citation-crawler/` | Citation stats crawler (run by GitHub Actions) |

## Local Development

```sh
npm install
npm run dev      # http://localhost:4321
```

## Credits

- Design template: [acad-homepage](https://github.com/RayeRen/acad-homepage.github.io) by RayeRen
- Theme: [Minimal Mistakes](https://mademistakes.com/work/jekyll-themes/minimal-mistakes/) by Michael Rose
- Globe texture: NASA Blue Marble (public domain)