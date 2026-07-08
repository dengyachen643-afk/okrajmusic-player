# okrajmusic-player Song Map

## Main Files

- Main app: `public/index.html`
- Optional afterword fallback page: `public/afterword.html`
- Message wall page: `public/wall.html`
- Cloudflare Worker for notes: `worker/notes-worker.js`

Most song-library work happens in `public/index.html`.

## Track Schema

Track objects live in `const tracks = [...]`.

Common fields:

```js
{
  artist: "Artist",
  song: "Song Title",
  album: "Album Title",
  tags: ["night", "city"],
  mood: ["night", "quiet", "afterglow"],
  note: "Recommendation copy.",
  cover: "css-cover-class",
  audioFile: "Artist - Song.mp3",
  hidden: true
}
```

Rules:

- `artist`, `song`, and `album` are displayed and used for keys.
- `trackKey(t)` is `${artist}||${song}`. Platform maps must use that exact key.
- `tags` drive shelf filters. Existing important tags include `city`, `night`, `afterglow`, `math`, `anime`, `groove`, `rock`.
- `mood` appears as small labels and feeds search/filter text.
- `note` is the recommendation/share text.
- `cover` must match a CSS class.
- `audioFile` is appended to the R2 base and `encodeURIComponent` is applied by `localAudioUrl()`.
- `audioUrl` may be used for a full URL, but prefer `audioFile` for R2.
- `hidden: true` excludes the song until `hiddenLibraryUnlocked()` returns true.

## Audio

Current R2 base:

```js
const audioCdnBase = "https://pub-d122a10e688a46009a5b289155ba5cab.r2.dev";
```

If a song uses the numbered audio convention, `localAudioUrl()` maps its track index to:

```text
track-01.mp3
track-02.mp3
...
```

If the user provides a specific uploaded filename, add it exactly:

```js
audioFile: "<uploaded R2 object name>.mp3"
```

Do not rename the user's R2 object in code. Match it exactly, including spaces and punctuation.

## Platform Links

Maps in `public/index.html`:

- `appleMusicLinks`
- `qqMusicLinks`
- `neteaseMusicLinks`

Keys use:

```js
"Artist||Song": "https://..."
```

If no direct link is present, the app falls back to search URLs. Adding exact mappings is optional unless the user asks.

## CSS Cover Art

CSS covers are pure CSS classes used by `.cover`.

Pattern:

```css
.newcover{background:...}
.newcover:before{content:"";position:absolute;...}
.newcover:after{content:"";position:absolute;...}
```

Constraints:

- No bitmap image assets by default.
- Use gradients, pseudo-elements, geometric forms, shadows, and restrained colors.
- Make it legible at multiple sizes: shelf, player, queue thumbnail, share image.
- Avoid dominant red unless the album/song strongly calls for it; the site favors low-saturation sage, cream, charcoal, and night blue-gray.
- Ensure text-like pseudo-content does not overwhelm share cards.

## Hidden Song Behavior

Hidden tracks use:

```js
hidden: true
```

Current library helpers:

- `isHiddenTrack(t)`
- `hiddenLibraryUnlocked()`
- `libraryTracks()`
- `buildAlbums()`

Expected behavior:

- Before unlock: hidden tracks do not appear in random pool or shelf.
- After unlock: hidden tracks join the player library and shelf.
- Hidden albums currently sort before normal albums once unlocked.

Do not accidentally add hidden tracks to normal `drawRandom()` behavior before unlock.

## Verification Commands

Use bundled Node if `node` is not on PATH:

```powershell
& 'C:\Users\asus\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -e "const fs=require('fs'); const html=fs.readFileSync('public/index.html','utf8'); const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n'); new Function(scripts); console.log('index ok');"
git diff --check
git status --short
```

If pushing:

```powershell
git add public/index.html
git commit -m "Add <song or feature summary>"
git push
```

## Done Checklist

- Track object added/updated with exact artist/song/album.
- `note` matches the user's intended text.
- `cover` class exists and renders as a square.
- R2 audio filename/URL is correct.
- Platform mappings are added if provided or requested.
- Hidden/normal behavior matches the request.
- Script syntax and diff checks pass.
- Commit/push only when requested or when the thread convention asks for deployment.
