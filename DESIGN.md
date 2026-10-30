<!-- impeccable:design-schema 2 -->
# HabitOps — Design System & Surface Contract

## 1. Aesthetic Direction: Crisp Daylight Tactical (`name-as-monument`)
HabitOps rejects generic AI-generated dark/neon gradients, glassmorphic cards, decorative `01 / 02 / 03` badges, and monospace kickers. Instead, the commercial web surface adopts **Crisp Daylight Tactical** — a high-contrast architectural daylight aesthetic (`#F3F4F0` warm stone ground, `#111315` deep carbon ink, `#D91E2A` signal vermilion) anchored by monumental typography (`General Sans`) and an interactive **Three.js 3D Tactical Strike Core**.

## 2. Color Tokens
| Token | Value | Role | Contrast vs Ground |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F3F4F0` | Primary Daylight Stone Ground | — |
| `--surface` | `#E6E8E2` | Secondary Architectural Slate-Tint | 1.15:1 tone step (no borders) |
| `--ink` | `#111315` | Primary Carbon Typography & Structure | 15.8:1 (AAA) |
| `--muted` | `#4A4E54` | Supporting Copy & Captions | 6.8:1 (AA+) |
| `--accent` | `#D91E2A` | Signal Crimson / 2.0s Strike Action | 5.1:1 |
| `--accent-ink` | `#F3F4F0` | Text on Signal Crimson | 5.1:1 |
| `--field-1` | `#111315` | Inverted Closing CTA & Monument Footer | 15.8:1 |
| `--field-1-ink` | `#F3F4F0` | Text on Inverted Carbon Field | 15.8:1 |

## 3. Typography & Hierarchy
- **Primary Typeface:** `General Sans` (Fontshare) — weights `400`, `500`, `700`.
- **Numeric Discipline:** All timers (`2.0s`), percentages (`18% HP`), XP values (`+50 XP`), and levels (`Level 100`) use `.nums { font-variant-numeric: tabular-nums; }` inside `General Sans`. Monospace fonts are never used as decorative eyebrows.
- **Strict 5-Size Scale:**
  - `--t-hero`: `clamp(4.25rem, 15.8vw, 15.5rem)` (`0.84` line-height, `-0.045em` letter-spacing)
  - `--t-h2`: `clamp(2.15rem, 4.2vw, 3.6rem)` (`1.04` line-height, `-0.03em` letter-spacing)
  - `--t-h3`: `clamp(1.25rem, 1.8vw, 1.5rem)`
  - `--t-body`: `1.0625rem` (`17px`, `1.55` line-height, max `60ch`)
  - `--t-small`: `0.875rem` (`14px`)

## 4. Layout, Three.js & Surface Separation
- **Hero (`name-as-monument`):** Upper 12-column split pairs concise positioning copy and APK/Web CTAs on the left with an interactive **Three.js 3D Tactical Strike Core** on the right (faceted icosahedron, orbital rings, and kinetic shards that charge over a 2.0-second press-and-hold and shatter on release). The lower hero anchors a full-width `HABITOPS` monument heading.
- **Showcase (`50/50 split`):** Flagship commercial video loop (`assets/habitops-commercial.mp4`) with live custom Google Flow video loader on the left; direct thesis and two flat download/launch cells on the right.
- **Discipline & Field Rules:** Real `[data-ui]` interface proofs (2.0s hold bar, +15% boss regen meter, Tactical EMP streak shield, Level 100 Battle Card) and campaign photography without decorative borders, shadows, or gradients.
- **Creator Separation:** Internal Google Flow video/image prompts and the 9-pad `.WAV` WebAudio exporter live exclusively in [`flow-studio.html`](file:///c:/Users/AUGUSTINE/Documents/Antigrav/proj8-habittracker/flow-studio.html), keeping [`landing.html`](file:///c:/Users/AUGUSTINE/Documents/Antigrav/proj8-habittracker/landing.html) focused on users.

