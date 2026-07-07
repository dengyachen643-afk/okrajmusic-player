# 小O的日音播放器

一个自用的静态日音播放器。它现在不只是歌单，而是一个可以随机抽歌、按氛围筛选、翻专辑 shelf，并直接播放本地 MP3 的小网页。

线上地址：

https://okrajmusic-player.netlify.app/

## 现在能做什么

- 本地播放 70 首日音 MP3。
- 随机抽一首歌，并自动进入播放器。
- 按标签筛选：城市、夜色、后劲、器乐 / 数摇、动画记忆、律动。
- 用专辑 shelf 浏览音乐：同一张专辑会聚在一起展示。
- 点击专辑后自动播放，并打开专辑详情。
- 播放器支持随机、顺序、单曲循环、上一首、下一首、播放列表、进度条拖动。
- 专辑播放完后会继续随机到全局下一首，避免单曲专辑一直重复。

## 项目结构

- `public/index.html`：网站入口，主要 UI、数据和播放器逻辑都在这里。
- `public/audio/`：本地 MP3 文件，按歌单顺序命名为 `track-01.mp3` 到 `track-70.mp3`。
- `music-download-list.md`：下载与校对用的歌曲清单。
- `range_server.py`：本地预览用的 Range 请求服务器，方便音频进度条拖动。
- `data/`：Apple Music、QQ 音乐、网易云音乐的链接候选和备份数据。

## 本地预览

推荐使用项目里的 Range 服务器：

```bash
python range_server.py 8765 public
```

然后打开：

```text
http://127.0.0.1:8765/
```

如果用普通静态服务器，部分浏览器里 MP3 进度条拖动可能不稳定。

## 部署

当前部署方式是 GitHub 连接 Netlify。只要把改动 push 到 GitHub `main` 分支，Netlify 会自动部署。

Netlify 发布目录：

```text
public
```

手动部署时可以拖入 `public` 文件夹，但当前 `public` 体积约 830MB，Netlify Drop 对大文件夹不太稳定，所以更推荐继续使用 GitHub 自动部署。

## 之后想做

- 抽歌分享页：抽到一首歌后生成一个可分享的页面或链接。
- 分享页需要考虑封面、歌曲文案、播放入口，以及移动端截图观感。

## Credits

- 歌单与整理：Okra & GPT-5.5 / Codex
- 文案协作：GPT-5.5 / Codex
