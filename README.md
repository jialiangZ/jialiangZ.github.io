# Astro Academic Homepage

一个现代化的学术个人主页模板：**改一个配置文件即可上线**，自动引用统计、可选的自托管访客地图、零第三方 CDN 依赖。

基于 [acad-homepage](https://github.com/RayeRen/acad-homepage.github.io)（Minimal Mistakes 主题）的视觉设计，用 [Astro](https://astro.build) 重建——构建 2.5 秒，组件化，配置集中。

## 快速开始（5 分钟）

1. 点击绿色 **Use this template** 按钮，把仓库命名为 `你的用户名.github.io`
2. 编辑 **`src/config.ts`** —— 这是唯一需要改的文件：姓名、单位、简介、社交链接、导航、论文列表都在这里
3. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**
4. （可选）把 `images/` 里的头像（`avatar.webp`）、分享卡（`og-card.png`）、论文图（`papers/`）换成你的；`.github/FUNDING.yml` 改成你的赞助账号或删除

推送后 GitHub Actions 自动构建部署。

## 进阶（可选功能）

### 自动引用统计（推荐）

主页的引用徽章和逐篇引用数会自动更新（每周一/四）：

1. （推荐）注册 [SerpAPI](https://serpapi.com) 免费账号（每月 100 次搜索，本站只用约 9 次），拿到 API key
2. 仓库 **Settings → Secrets and variables → Actions → New repository secret**，添加两个 secret：
   - `SERPAPI_KEY` = 你的 SerpAPI key（精确 Google Scholar 数据）
   - `GOOGLE_SCHOLAR_ID` = 你的 Google Scholar 主页 URL 里 `user=` 后面的那串 ID
3. 完成。论文列表从构建产物自动解析——在 `src/config.ts` 的 `PAPERS` 里加了带 arXiv 链接的论文，引用数就会自动跟踪

> 不配置 secret 也能用：自动降级到 OpenAlex 数据（计数口径更保守，页面会标注来源）。

### 访客地图（可选）

自托管的 3D 地球访客地图（Cloudflare Worker + D1，无任何第三方统计服务，数据落盘在你自己的 git 历史里）。部署约 10 分钟，见 **`visitor-map-worker/README.md`**。不想要就把 `src/config.ts` 里 `VISITOR_MAP.enabled` 设为 `false`。

## 内置特性

- **零外部 CDN**：FontAwesome 编译进主 CSS、jQuery/globe.gl 自托管——中国大陆访问不裂图
- **SEO**：Open Graph / Twitter Card / JSON-LD (schema.org/Person) / sitemap / robots.txt
- **三层引用数据回退**：同源数据 → jsdelivr CDN → raw.githubusercontent
- **访客地图双层容灾**：Worker 实时数据 → 仓库每日快照（Worker 不可达时自动降级）
- **CI**：每次推送自动构建断言；每周一自动全站外链健康检查
- **隐私**：访客地图只存国家/城市级聚合计数，不存 IP/UA/个人标识；已知爬虫不计数

## 仓库结构

| 路径 | 说明 |
|---|---|
| `src/config.ts` | **所有个性化配置**（站点/作者/导航/论文/访客地图开关） |
| `src/pages/` | 页面（index.astro / 404.astro） |
| `src/components/` | 组件（SeoHead / Masthead / AuthorProfile / PaperBox） |
| `src/styles/` | SCSS（主题树 `sass/` + 自定义 `sass/custom.scss`） |
| `public/` | 原样发布的静态资产（images/、data/、vendored 库、robots.txt） |
| `visitor-map-worker/` | 访客地图 Worker 源码（可选模块） |
| `citation-crawler/` | 引用统计爬虫（GitHub Actions 运行） |

## 本地开发

```sh
npm install
npm run dev      # http://localhost:4321
```

## Credits

- 设计模板：[acad-homepage](https://github.com/RayeRen/acad-homepage.github.io) by RayeRen
- 主题：[Minimal Mistakes](https://mademistakes.com/work/jekyll-themes/minimal-mistakes/) by Michael Rose
- 地球纹理：NASA Blue Marble（公有领域）
