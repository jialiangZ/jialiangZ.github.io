# Jialiang Zhang's Homepage

Source of **[jialiangz.github.io](https://jialiangz.github.io/)** — built with **[Astro](https://astro.build)** + GitHub Pages（由 Jekyll 迁移而来）。

基于 [acad-homepage](https://github.com/RayeRen/acad-homepage.github.io)（Minimal Mistakes 主题）的视觉设计，在其之上做了以下自建扩展。

## Features

- **自动引用统计**：`citation-crawler/` 由 GitHub Actions 每周一/四运行；数据层为 SerpAPI（Google Scholar 精确数据，需在仓库 secret 配置 `SERPAPI_KEY`，免费额度足够）→ OpenAlex 标题匹配兜底（免密钥、来源透明标注）。论文列表自动从构建产物解析，新增论文零配置；数据落盘 `public/data/scholar-stats/` 同源服务，徽章由 shields.io 渲染。
- **访客地图**：自建 Cloudflare Worker + D1 方案（`visitor-map-worker/`），无任何第三方统计服务。globe.gl 3D 地球（已 vendor，零外部 CDN）、城市级定位、爬虫过滤、每国限流；每日快照自动 commit 回 `public/data/visitor-map.json`，数据历史永久保存在 git 里。
- **零外部 CDN**：FontAwesome 编译进主 CSS、jQuery 自托管，正文资源全部同源。
- **CI**：Astro 构建 + 断言校验（`.github/workflows/ci.yml`）、每周外链健康检查（`links.yml`）。

## Local Development

```sh
npm install
npm run dev      # http://localhost:4321
```

## Repository Layout

| 路径 | 说明 |
|---|---|
| `src/pages/` | 页面（index.astro / 404.astro） |
| `src/components/` | 组件（SeoHead / Masthead / AuthorProfile / PaperBox） |
| `src/styles/` | SCSS（主题树 `sass/` + 自定义 `sass/custom.scss`） |
| `src/config.ts` | 站点/作者/导航/论文的单一配置源 |
| `public/` | 原样发布的静态资产（images/、data/、vendored 库、robots.txt） |
| `visitor-map-worker/` | Cloudflare Worker 源码（部署说明见其 README） |
| `citation-crawler/` | 引用统计爬虫（GitHub Actions 运行） |

## Credits

- 设计模板：[acad-homepage](https://github.com/RayeRen/acad-homepage.github.io) by RayeRen
- 主题：[Minimal Mistakes](https://mademistakes.com/work/jekyll-themes/minimal-mistakes/) by Michael Rose
- 地球纹理：NASA Blue Marble
