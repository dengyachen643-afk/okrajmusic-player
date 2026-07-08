# 小O的日音播放器

一个安静、偏私人气质的日音抽歌与播放小站。

它从一份歌单长成了一个可以随机抽歌、翻专辑墙、按氛围筛选、直接播放音频、生成分享图、记录成就、留下纸条的小网页。适合在晚上打开，也适合把一首歌交给随机数。

线上地址：

https://dengyachen643-afk.github.io/okrajmusic-player/

## v1.0 状态

当前版本可以作为 `v1.0` 使用。核心功能已经闭环：

- 有完整的 70 首日音曲目数据。
- 音频托管在 Cloudflare R2，网页部署在 GitHub Pages。
- 留言墙接入 Cloudflare Worker + D1。
- 桌面端和移动端都做了专门适配。
- 分享图、成就、专辑墙、外部平台跳转都已经可以正常使用。

## 功能

### 抽一首

- 点击「抽一首」随机得到一首歌。
- 抽到后会自动载入播放器。
- 抽歌结果有独立的 TODAY'S DRAW 分享图，包含抽取日期、时间、歌曲信息、抽歌签语和二维码。
- 抽歌分享图和普通推荐分享图视觉上区分开：前者是低饱和夜蓝灰抽签卡，后者是更轻的 PICK 推荐卡。

### 本地音乐播放器

- 直接播放托管在 R2 的 MP3 音频。
- 支持播放 / 暂停、上一首、下一首、随机、顺序、单曲循环。
- 支持播放列表、进度条拖动、自动播下一首。
- 点击专辑墙中的专辑会立刻播放对应歌曲。
- 单曲专辑播放完后会回到全局随机下一首，避免一直循环同一首。

### 专辑墙

- 用 shelf 的方式展示专辑封面。
- 同一张专辑的歌曲会聚在一起。
- 桌面端是左右交叠的唱片架视觉，悬停时专辑浮起。
- 移动端按行横向滑动，适配微信 / 手机浏览器窄屏。
- 支持按氛围筛选：城市、夜色、后劲、器乐 / 数摇、动画记忆、律动。
- 支持搜索乐队、专辑、歌名。

### 分享图

- 抽歌结果、播放器当前歌曲、专辑详情里的歌曲都可以生成分享图。
- 分享图包含歌名、歌手、专辑、推荐语 / 抽歌签语、专辑图、站点署名和二维码。
- 推荐语区域使用中文宋体优先的中日兼容衬线字体栈，避免幼态手写感。
- 二维码指向网站主页，方便别人扫码再抽一首。

### 外部打开

- 支持 Apple Music、QQ 音乐、网易云音乐。
- 移动端会优先尝试跳转 App。
- 如果 App 跳转失败，会保留网页搜索或歌曲页兜底。

### 成就墙

- 轻量成就系统，数据保存在浏览器 `localStorage`。
- 包含 6 个成就，其中 1 个是隐藏成就。
- 成就解锁时会弹出成就卡片，需要用户手动关闭。
- 成就图标全部用 CSS 绘制，不依赖图片素材。

### 墙边的纸条

- 独立留言墙页面：`wall.html`。
- 用户可以写昵称和纸条，像便利贴一样贴到墙上。
- 当前已经接入 Cloudflare Worker + D1，所有人能看到同一面墙。
- 管理模式支持删除纸条，但管理口令不提交到仓库。

## 项目结构

```text
public/
  index.html          主页面：播放器、抽歌、专辑墙、分享图、成就系统
  wall.html           墙边的纸条页面
worker/
  notes-worker.js     留言墙 Cloudflare Worker 后端
  schema.sql          D1 建表 SQL
  wrangler.toml       Worker 部署配置
data/                 外部音乐平台链接候选与备份数据
music-download-list.md 下载与校对用歌曲清单
range_server.py       本地预览用 Range 静态服务器
.github/workflows/    GitHub Pages 自动部署
```

音频文件没有放进 Git 仓库。播放器会从 Cloudflare R2 公共地址读取 `track-01.mp3` 到 `track-70.mp3`。

## 本地预览

推荐使用项目里的 Range 服务器，方便测试 MP3 进度条拖动：

```bash
python range_server.py 8765 public
```

然后打开：

```text
http://127.0.0.1:8765/
```

如果只是看静态页面，也可以用任意静态服务器打开 `public` 目录；但部分浏览器里音频 seek 可能不如 Range 服务器稳定。

## 部署

当前部署方式：

- 页面：GitHub Pages
- 音频：Cloudflare R2
- 留言墙：Cloudflare Worker + D1

把改动 push 到 GitHub `main` 分支后，GitHub Actions 会自动发布 `public` 目录。

## 新增歌曲时

新增歌曲需要同步更新几处：

1. 把音频上传到 Cloudflare R2，按现有规则命名为 `track-xx.mp3`。
2. 在 `public/index.html` 中补充歌曲数据、推荐语、专辑、标签、封面类名、平台链接等。
3. 如果需要新的专辑封面视觉，补充对应 CSS cover。
4. 更新 `music-download-list.md`，方便之后校对。
5. 本地预览确认能播放、能分享、能在移动端正常显示。

## 墙边的纸条后端

GitHub Pages 只能托管静态页面，不能直接保存公共留言。留言墙通过 Cloudflare Worker + D1 实现。

当前公开 API：

```text
https://okraj-notes.dengyachen643.workers.dev
```

部署步骤：

1. 创建 D1 数据库，例如 `okraj-notes`。
2. 执行 `worker/schema.sql` 建表。
3. 创建 Worker，代码使用 `worker/notes-worker.js`。
4. 给 Worker 绑定 D1，绑定名必须是 `DB`。
5. 给 Worker 设置环境变量 `ADMIN_TOKEN`，不要提交到 GitHub。
6. 部署 Worker，得到 workers.dev URL。
7. 把 `public/wall.html` 里的 `WALL_API_BASE` 指向 Worker URL。

管理纸条：

- 普通访问：`wall.html`
- 管理访问：`wall.html?admin=你的_ADMIN_TOKEN`

进入管理模式后，每张纸条会出现「移除」按钮。删除请求会由 Worker 校验 `ADMIN_TOKEN`，通过后从 D1 删除对应纸条。

## v1.0 更新摘要

这版相比早期原型，主要完成了这些事情：

- 从外部嵌入播放器转为自托管音频播放，减少平台限制。
- 音频迁移到 Cloudflare R2，减轻 GitHub Pages 仓库压力。
- 完成专辑墙 shelf 视觉和移动端横向滑动体验。
- 完成普通 PICK 分享图和 TODAY'S DRAW 抽歌分享图。
- 完成 Apple Music、QQ 音乐、网易云音乐的平台选择与移动端 App 跳转尝试。
- 完成成就墙，包含 CSS 成就图、隐藏成就和解锁弹窗。
- 完成墙边的纸条，从本机预览升级为公开留言墙。
- 修复移动端播放列表横向露白、平台弹窗误露出、专辑封面裁切、抽歌分享对象错位、进度条与音量键卡顿等问题。
- 重新整理推荐语文案和分享图字体，让整体更像一张克制的音乐签卡。

## Credits

- 歌单与整理：Okra & GPT-5.5 / Codex
- 文案协作：GPT-5.5 / Codex
- 前后端：Codex (GPT-5.5) & Okra
- 小注：由人类耳朵选歌，由机器手指拧紧螺丝。
