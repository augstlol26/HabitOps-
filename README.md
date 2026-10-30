# HabitCraft — Tactical Habit Engine & Gamified Quests

A brutalist, high-contrast, tactical gamified habit tracking web application designed with Google Stitch design tokens and procedural Web Audio synthesizers.

## Features

1. **Today / Quests View (`Today`)**:
   - **Daily Boss Encounter**: Battle against the *Procrastination Titan* with animated screen shake, slash light beams, sound wave ripples, and boss damage progress.
   - **Linear Level & XP Bar**: Real-time level tracking with level-up thresholds.
   - **Weekly Sequence Strip**: M-S status badges with active day highlights.
   - **Routine Protocols**: Categorized into *Morning Protocol*, *Afternoon Focus*, and *Evening Wind Down*.
   - **Tactical Micro-Interactions**: Floating XP badges (`+25 XP`, `+35 XP`, `+80 XP`), checkmark pop animations, and sound effects.
   - **Trophy Milestone Chest**: Unlocks milestone rewards with audio fanfares.

2. **Habit Quest Details View (`Details`)**:
   - Deep inspection of habit telemetry (e.g. *Deep Workout / Gym*).
   - Milestone progress with tactical diagonal shimmer sweep.
   - **Operational Protocol**: Cadence, standard target, environmental cue triggers, with interactive modal editor.
   - **Strike Ledger**: Accordion drawer expanding detailed historical performance stats (e.g. Deadlift, Lat Pulldown, OHP, Squat sets and RPE).
   - **Interactive Action Hub**: *Check In Strike*, *Edit Protocol*, *Log Notes*, and *Revert / Undo*.

3. **Weekly Review & Reflection (`Review`)**:
   - **Protocol Archive**: Week 42 rollup metrics (88% rate, 6/7 streak, +420 XP gains) with cubic ease-out rollup counters.
   - **Titan Raid Victory Banner**: Animated gradient shimmer sweep.
   - **Interactive Cadence Rhythm Bar Chart**: Tap any day bar to inspect quest clear rate, percentage, and focus level in real time.
   - **Discipline Matrix**: Analyzes key pillars with animated progress bar sweeps.
   - **Field Reflection**: Persistent journaling textarea with instant save feedback.
   - **Interactive Rating Meters**: 1–5 clickable scoring for *Energy*, *Discipline*, and *Recovery*.
   - **Next Week Blueprint**: Commitment CTA locking in upcoming boss encounter (*Distraction Drake*).

4. **Habits Lab (`Habits`)**:
   - Filter protocols by *All*, *Morning*, *Afternoon*, and *Evening*.
   - Add new custom protocols with target zone, XP yield, and Boss Strike multipliers.
   - Decommission or jump directly to protocol detail views.

5. **Profile & Trophy Vault (`Profile`)**:
   - **Hero Identity**: Rank division, Level 14 Pro Rank, and striped barber-pole animated XP bar.
   - **Tactile Metrics Strip**: Interactive count-up blocks for Current Streak, Consistency Accuracy, Quests Cleared, and Bosses Slain.
   - **Buff Matrix**: Live countdown timer for *1.5x Morning Multiplier*, *Titan Crusher* passive perk with warhorn blast, and *Iron Will Mantle* streak freeze shield.
   - **Trophy Vault & Badges**: Inspectable achievements with procedural sound fanfare and lore.
   - **Valkyrie Guild Leaderboard**: Real-time standings showing ranking progression.
   - **System Controls**: Telemetry export to both **JSON** and **CSV**.

6. **Web Audio Synthesizer**:
   - Zero external audio files required! Synthesizes 8-bit / 16-bit retro tactical sounds using browser Web Audio API:
     - Ascending triad chime for quest completion
     - Resonant sub-boom and blade slash for boss strikes
     - Multi-oscillator brass warhorn for boss defeats
     - Arpeggiated crystal triad fanfare with high resonance for trophies
     - Mechanical thud for locked items and cancels
     - Master mute/unmute toggle in header and side drawer

## Running the App

### Option 1: Direct Browser
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Web Server
```bash
npm start
```
or
```bash
npx serve . -l 3000
```
Open `http://localhost:3000` in your browser.

