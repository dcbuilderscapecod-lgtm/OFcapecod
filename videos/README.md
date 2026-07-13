# Site Videos

## Animated logo (already in place)

`dc-builders-logo.mp4` — the animated DC Builders logo, shown looping in the
header of every page and on the splash screen. The players start playback at
1.9s (skipping the black/blank lead-in) and loop back there just before the
end, so the black opening frame never shows. If a device blocks autoplay
(e.g. iPhone Low Power Mode), the fully-formed logo frame (6.5s) is shown as
a still. Replace this file to update the logo animation everywhere.

## Splash background footage (already in place)

`splash-bg.mp4` — silent b-roll (audio track stripped) that plays full-screen,
dimmed, behind Dave's intro on the splash. Starts and restarts in sync with
Dave's video and cuts to the animated-logo phase the moment his intro ends.
Trimmed to the same 15.04s duration as dave-intro.mp4.

# Dave's Avatar Videos

Drop the two finished clips into this folder with EXACTLY these filenames — the
site switches from the placeholder cards to the real videos automatically, no
code changes needed:

| File | Where it plays | Content |
|------|----------------|---------|
| `dave-intro.mp4` | Full-screen splash intro on the homepage (every visit) | Dave introduces himself and DC Builders (~15 sec) |
| `dave-chat-intro.mp4` | Ask Dave section on the homepage (above the reviews) | Dave introduces the chat assistant (~15 sec) |
| `dave-services.mp4` | *(no section on the site right now — the Meet Dave block was removed from Construction Services at the owner's request; re-add section + file together if a new avatar cut is ever wanted)* | Dave on what we offer and our building technology (~15 sec) |
| `dc-builders-promo.mp4` | "Learn More About DC Builders" play button on the homepage and Construction Services (opens in a pop-up player) | The original 30-sec site promo montage of finished jobs, with whistling background music. Rescued July 13 2026 from Hibu's video CDN (videos.hibustudio.com/2023/dc-builders-7002658649.mp4) after the Duda export shipped only a broken popup link (assets/def7797e7ba3.bin). Now self-hosted. |

## Format guidance
- **MP4 (H.264 + AAC)** — plays everywhere.
- Keep each file **under 25 MB** (Cloudflare Pages per-file limit). A 15-second
  1080p clip at a normal bitrate is typically 5–15 MB.
- Landscape (16:9) fits the layout best, but portrait/square also works — the
  players letterbox automatically.
- The splash video auto-plays **muted** (browser rule); visitors tap
  "Play with sound" to hear Dave. Consider burned-in captions so the muted
  first play still lands.
