# Jialiang Zhang's Homepage

Source of **[jialiangz.github.io](https://jialiangz.github.io/)** — Jekyll + GitHub Pages.

基于 [acad-homepage](https://github.com/RayeRen/acad-homepage.github.io)（Minimal Mistakes 主题）搭建，并在其之上做了以下自建扩展。

## Features

- **自动引用统计**：`google_scholar_crawler/` 由 GitHub Actions 每周一/四运行；数据层为 SerpAPI（Google Scholar 精确数据，需在仓库 secret 配置 `SERPAPI_KEY`，免费额度足够）→ OpenAlex 标题匹配兜底（免密钥、来源透明标注）。论文列表自动从 `index.md` 解析，新增论文零配置；数据落盘 `data/scholar-stats/` 同源服务，徽章由 shields.io 渲染。
- **访客地图**：自建 Cloudflare Worker + D1 方案（`visitor-map-worker/`），无任何第三方统计服务。globe.gl 3D 地球（已 vendor，零外部 CDN）、城市级定位、爬虫过滤、每国限流；每日快照自动 commit 回 `data/visitor-map.json`，数据历史永久保存在 git 里。
- **零外部 CDN**：FontAwesome 编译进 main.css、jQuery 自托管，正文资源全部同源。
- **CI**：Jekyll 构建校验 + JS 语法检查（`.github/workflows/ci.yml`）。

## Local Development

```sh
bundle install
bundle exec jekyll serve
```

或直接使用 `./run_server.sh`。

## Repository Layout

| 路径 | 说明 |
|---|---|
| `index.md` | 主页内容（引用爬虫按 `paper-title` 链接自动解析论文） |
| `visitor-map-worker/` | Cloudflare Worker 源码（部署说明见其 README，已排除出 Jekyll 构建） |
| `google_scholar_crawler/` | 引用统计爬虫（GitHub Actions 运行） |
| `data/` | 同源数据（scholar 统计、访客地图快照） |
| `assets/vendor/` | 自托管第三方库（globe.gl、jQuery） |

## Credits

- 模板：[acad-homepage](https://github.com/RayeRen/acad-homepage.github.io) by RayeRen
- 主题：[Minimal Mistakes](https://mademistakes.com/work/jekyll-themes/minimal-mistakes/) by Michael Rose
- 地球纹理：NASA Blue Marble
