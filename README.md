# Cellulose Studio

A social cellular automata generator and generative art platform at [cellulose.studio](https://cellulose.studio).

Generate, visualize, and share 1D, 2D, and 3D cellular automata with customizable shapes, rules, and neighborhoods.

## Project Structure

```
app/   — SvelteKit + Svelte 5 web app (Tailwind, Clerk auth, Drizzle ORM)
lib/   — Framework-agnostic core library
  automata/  — Pure TS automata engine (population, rules, neighborhoods)
  viewer/    — Three.js viewers (1D-in-2D, 2D-in-2D, 2D-in-3D, 3D-in-3D)
```

## Lattices

**2D:** Square, Hexagonal, Triangular, Truncated Square (multi-shape)
**3D:** Cubic, Face-Centered Cubic (FCC), Hexagonal Prism

Multi-shape lattices (triangular, truncated square) support per-shape rules, geometry, and neighborhood configurations.

## Viewers

- **1D in 2D** — 1D automata rendered as a scrolling 2D timeline
- **2D in 2D** — Orthographic top-down view of 2D automata
- **2D in 3D** — 2D generations stacked in 3D space
- **3D in 3D** — Full 3D automata with orbit controls

All viewers support customizable cell states (HSL colors) and trail rendering with linear/exponential decay.

## Social Features

- **Gallery** — Browse and discover community creations
- **Mining** — Claim and curate automata configurations
- **Achievements** — Earn badges through exploration and curation
- **Leaderboard** — Compete on mining rankings
- **Comments & Likes** — Engage with community creations
- **Bookmarks** — Save favorites for later

## Achievements

Users earn achievements through exploration and mining. Achievements are grouped into four categories:

**Taste** — Earned by viewing many automata while liking few (selective taste). Revocable if ratio changes.
- **Miner with Taste** — Like <10% of viewed automata (min 10 views)
- **Aspiring Artist** — Like <5% of viewed automata (min 20 views)

**Mining Rank** — Earned by having highly-liked claims. Non-revocable.
- **Starting Miner** — Claim in top 90% of liked claims
- **Amateur Miner** — Top 50%
- **Intermediate Miner** — Top 25%
- **Skilled Miner** — Top 10%
- **Expert Miner** — Top 5%

**Work Ethic** — Earned by saving generation runs. Non-revocable.
- **Slow and Steady** — 30+ saved runs
- **Workaholic** — 100+ saved runs
- **Obsessive Employee** — 1000+ saved runs

**Operator** — Earned by exploring many configs without claiming most. Revocable.
- **Smooth Operator** — Claim <50% of weekly views (min 10)
- **Advanced Operator** — Claim <10% of weekly views (min 20)
- **Skilled Operator** — Claim <5% of weekly views (min 50)

View achievements in My Chest > Achievements tab. Click "Check for updates" to scan for newly earned achievements.

## Tech Stack

- **SvelteKit 2** / **Svelte 5** (runes)
- **Three.js** for 3D rendering
- **Tailwind CSS 4**
- **Drizzle ORM** + **Turso** (SQLite)
- **Clerk** for authentication
- **Cloudflare Pages** for hosting

## Development

```bash
cd app
bun install
bun run dev
```

## Deploy

```bash
bun run deploy
```
