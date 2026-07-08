---
name: okraj-add-song
description: Add or update songs in the okrajmusic-player project. Use when the user asks to add a song, hidden song, album, recommendation copy, R2 audio filename, music platform mappings, CSS album cover art, shelf/random-library behavior, or song metadata for okrajmusic-player.
---

# Okraj Add Song

Use this skill to change the song library for `okrajmusic-player` without rediscovering the project conventions each time.

## First Read

Read `references/project-map.md` before editing. It contains the current file map, track schema, cover-art rules, and verification checklist.

## Workflow

1. Locate the repo, normally `D:\G老师\okrajmusic-player`.
2. Inspect the current relevant sections in `public/index.html` before editing:
   - `const tracks = [...]`
   - external link maps: `appleMusicLinks`, `qqMusicLinks`, `neteaseMusicLinks`
   - CSS cover classes near the handmade cover block
   - hidden-library logic if the song is a hidden or afterword track.
3. Decide the song type:
   - **Normal song**: appears in the random pool and album shelf.
   - **Hidden song**: set `hidden: true`; do not appear until its unlock condition is satisfied.
   - **Metadata/copy-only update**: preserve audio, cover, ordering, and mappings unless the user explicitly changes them.
4. Add or update one track object. Preserve the existing schema and field order as much as possible.
5. Add or update audio mapping:
   - Prefer `audioFile` for R2 object filenames that are not `track-XX.mp3`.
   - Use `audioUrl` only when the user provides a full URL or an exceptional source.
   - For regular numbered local audio, ensure track ordering still matches `trackNumber()` and R2 `track-XX.mp3`.
6. Add platform mappings when available:
   - Apple Music, QQ Music, and NetEase Cloud Music maps are keyed by `artist||song`.
   - If exact direct links are unknown and the user did not provide them, leave the fallback search behavior intact.
7. Create or adjust a pure CSS cover class:
   - Use only CSS gradients, pseudo-elements, borders, shadows, and shapes.
   - Do not add image assets unless the user explicitly requests real artwork.
   - Keep the low-saturation Okraj visual tone: sage, cream, charcoal, night blue-gray, muted accent colors.
   - Verify the cover works in album shelf, player card, queue, share card, and afterword/hidden contexts if applicable.
8. Preserve library behavior:
   - Normal tracks should enter shelf and random pool automatically.
   - Hidden tracks should remain hidden until unlocked, then join shelf/random/player library according to the existing hidden logic.
9. Verify with lightweight checks:
   - Extract and compile `<script>` from `public/index.html` with Node.
   - Run `git diff --check`.
   - If the change touches CSS layout or a new cover, visually test locally when practical.
10. If the user asks to push or the thread convention clearly expects it, commit and push. Use concise commit messages.

## Style Rules

- Keep recommendation copy exactly as provided unless asked to polish it.
- Preserve Japanese titles and artist names exactly, including punctuation and spacing.
- Do not put the song title inside the recommendation copy unless the user explicitly wants that.
- For hidden/final songs, keep the interaction quiet and non-gamey unless the user asks otherwise.
- Avoid broad refactors while adding songs. This project is hand-tuned; small, deliberate edits age better here.

## Common Requests

- "Add this song": ask only for missing essentials that cannot be inferred: artist, song, album, audio filename/URL, and recommendation copy.
- "The audio is already uploaded to Cloudflare": use the given object name as `audioFile` and encode via existing `localAudioUrl()`.
- "Do not put it into shelf/random library": mark it hidden or follow the existing exclusion pattern; confirm whether it should become unlockable later.
- "Draw the album cover": add a CSS class and assign it in `cover`.
- "Only change the copy": edit only the `note` field.
