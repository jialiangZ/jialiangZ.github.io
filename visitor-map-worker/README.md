# Self-hosted Visitor Map

访客地图的自建实现：Cloudflare Worker 记录分国家/城市访问量（D1），前端为 globe.gl 3D 地球
（three.js，已 vendor、零外部 CDN；纹理为压缩 WebP）。每日快照由**仓库里的 GitHub Actions
工作流**从 Worker 拉取（`/stats/full`）并 commit 回 `public/data/visitor-map.json`
—— Worker 侧**不保存任何 GitHub 凭据**，数据历史永久留在你自己的 git 里。

隐私：只记录国家/城市级聚合计数（来自边缘节点 IP 归属地）、UTC 日期、referrer 域名
（粗粒度 host，不含完整 URL），不存 IP、不存 User-Agent、不存任何个人标识；
已知爬虫（Googlebot/GPTBot 等）不计数。

## 一次性部署（约 10 分钟）

前置：一个免费 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)、本机装有 Node.js。

```bash
npm install -g wrangler
wrangler login        # 会打开浏览器授权

# 1. 创建 D1 数据库，输出里的 database_id 填进 wrangler.toml
wrangler d1 create visitor-map

# 2. 建表（在 visitor-map-worker 目录下执行）
wrangler d1 execute visitor-map --remote --file=schema.sql

# 3. 部署
wrangler deploy

# 4. 设置共享口令（快照端点的保护密码，自定义一串随机字符即可）
wrangler secret put SNAPSHOT_SECRET
```

部署成功后 wrangler 会输出 `https://visitor-map.<你的子域>.workers.dev`：

1. 把这个 URL 填到 **`src/config.ts` 的 `VISITOR_MAP.workerUrl`**（保持 `enabled: true`）
2. 把刚才设置的口令原样添加到仓库 **Settings → Secrets and variables → Actions**，
   名称 `SNAPSHOT_SECRET`（每日快照工作流用它调用 Worker）
3. 提交推送，网站上线即开始计数；验证：`curl https://visitor-map.<子域>.workers.dev/stats` 应返回 JSON

> 不想要访客地图？不用部署任何东西——把 `src/config.ts` 里 `VISITOR_MAP.enabled`
> 设为 `false` 即可，区块、脚本、计数上报全部消失。

## 数据落盘到仓库

- `.github/workflows/visitor-map-snapshot.yml` 每天定时（UTC 20:00 ≈ 北京时间凌晨 4 点）
  从 Worker 拉取全量数据并 commit 成 `public/data/visitor-map.json`，用的是内置
  GITHUB_TOKEN —— **全程无 PAT**
- 快照包含：终身累计（`counts`）、近 180 天每日分国家明细（`daily`）、每日 referrer 分布（`referrers`）、
  城市明细（`cities`）；180 天以上的历史由每日 git 快照天然留存
- 手动触发：Actions 页面运行 "Visitor Map Snapshot"，或
  `curl -H "X-Snapshot-Secret: <口令>" https://visitor-map.<子域>.workers.dev/stats/full`
- Worker 挂了也不怕：前端自动降级读取仓库里的 `public/data/visitor-map.json`（标注 "cached"）；
  重建时用 `wrangler d1 execute visitor-map --remote --command="..."` 把 JSON 灌回 D1 即可恢复

## 已知限制

- `*.workers.dev` 默认域名在中国大陆时常不可达（此时地图显示仓库缓存数据，不计数）。
  受众主要在大陆的话，给 Worker 绑定一个自定义域名可解决
- 免费额度：Worker 10 万请求/天、D1 10 万写入/天，个人主页远远用不完
- 底图为 Natural Earth 110m（公有领域），部分小国不在 110m 精度内，访问量会计数但不画点
