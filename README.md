# 小O的日音播放器

一个静态的日音推荐播放器：可以随机抽歌、按氛围筛选，并跳转到 Apple Music、QQ 音乐或网易云音乐收听。

## 项目结构

- `public/index.html`：网站入口，也是 Netlify 部署文件。
- `data/apple-link-candidates.json`：Apple Music 链接校对记录。
- `data/apple-links-block.txt`：Apple Music 链接表备份。
- `data/platform-link-candidates.json`：QQ 音乐 / 网易云音乐批量查询候选。
- `data/platform-link-trusted.json`：已写入页面的可信直达链接记录。
- `data/platform-link-summary.json`：平台直达链接统计摘要。

## 部署

手动部署到 Netlify Drop 时，拖入这个文件夹：

`public`

Netlify 会自动使用 `public/index.html` 作为首页。

如果用 Netlify 连接 GitHub 仓库，发布目录设置为：

`public`

## 继续修改

当前没有构建步骤，直接编辑 `public/index.html` 即可。改完后重新部署 `public` 文件夹。

封面目前主要是 CSS 抽象封面。人物封面遵循一个约定：不画五官表情，只用发型、衣服、姿态和构图来识别。
