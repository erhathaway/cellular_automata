# Migration: Semantic Cell State Roles + Trail Config

## Overview

Replace the numeric `number` field on `CellStateEntry` with a semantic string `role` field (`"dead"`, `"alive"`, `"trail"`). Promote trail from a hardcoded viewer effect to a first-class configurable state with trail size and a step function for color fading.

### Current format
```json
[
  { "number": 0, "color": { "h": 360, "s": 1, "l": 1, "a": 1 } },
  { "number": 1, "color": { "h": 0, "s": 0, "l": 0, "a": 1 } }
]
```

### New format
```json
{
  "states": [
    { "role": "dead", "color": { "h": 360, "s": 1, "l": 1, "a": 1 } },
    { "role": "alive", "color": { "h": 0, "s": 0, "l": 0, "a": 1 } }
  ],
  "trail": {
    "color": { "h": 180, "s": 1, "l": 0.65, "a": 1 },
    "size": 40,
    "stepFn": "linear"
  }
}
```

Future multi-alive states: `"alive"`, `"alive 2"`, `"alive 3"`, etc.

### Trail config fields
- **`color`** — base trail hue (currently computed as complementary of alive)
- **`size`** — number of generations to keep in the trail (currently hardcoded: 40 in 2D-in-2D, 60 in 2D-in-3D)
- **`stepFn`** — how trail color fades per step. Options: `"linear"` (current behavior), `"exponential"`, `"none"` (solid trail color). The step function interpolates from trail color → dead color over `size` steps.

---

## Touch Points

### 1. Type Definitions

**`app/src/lib/stores/automata.svelte.ts:12-15`** — `CellStateEntry` interface
- Change `number: number` → `role: string`
- Add new `TrailConfig` interface: `{ color: HSLColor; size: number; stepFn: string }`
- Add new `CellStatesData` wrapper: `{ states: CellStateEntry[]; trail: TrailConfig }`

**`lib/viewer/base/index.ts:12-15`** — `CellState` interface
- Same change: `number: number` → `role: string`

### 2. Store — Default Values & State

**`app/src/lib/stores/automata.svelte.ts`**

| Location | What | Change |
|---|---|---|
| `:59-66` `defaultCellStates()` | Creates `{ number: 0 }` / `{ number: 1 }` | Use `role: "dead"` / `role: "alive"` + return `CellStatesData` with default trail |
| `:102-105` initial `cellStates` | Hardcoded `{ number: 0 }` / `{ number: 1 }` | Same role change |
| `:219-225` `_enforceLivingBlack()` | Checks `s.number === 1` | Check `s.role === "alive"` |
| `:303-314` `setCellStateColor(stateNumber, color)` | Matches on `s.number === stateNumber` | Change signature to `setCellStateColor(role: string, color)`, match on `s.role === role` |
| `:211-213` `cellStatesForViewer` getter | Returns `this.cellStates` | Return `this.cellStatesData.states` (or keep flat depending on viewer needs) |
| History maps (`:186, 199, 310, 806`) | Store/restore `CellStateEntry[]` | Store/restore `CellStatesData` (states + trail config) |
| `:791-793` `exportForSave()` | `JSON.stringify(this.cellStates)` | `JSON.stringify(this.cellStatesData)` — new wrapper format |

Also add:
- `trailConfig` getter/setter (reads from `cellStatesData.trail`)
- `setTrailSize(size: number)` method
- `setTrailStepFn(fn: string)` method
- `setTrailColor(color: HSLColor)` method

### 3. URL Persistence

**`app/src/lib/stores/persistence.ts`**

| Location | What | Change |
|---|---|---|
| `:114-116` `buildURLParams()` | `params.set(\`c${cs.number}\`, ...)` | Use `params.set(\`c.dead\`, ...)`, `params.set(\`c.alive\`, ...)` etc. by role name |
| `:180-188` `parseURLParams()` | Loops `i = 0..9`, reads `c0`, `c1` | Read `c.dead`, `c.alive`, `c.alive2` etc. |
| New | Trail URL params | Add `ts` (trail size), `tc` (trail color), `tf` (trail stepFn) params |

### 4. Database Schema + Migration

**`app/src/lib/server/db/schema.ts:44,88`** — `cell_states` TEXT column on both `generationRun` and `cellPopulation`

No schema change needed (still TEXT/JSON). But need a **data migration script** to transform existing rows:

```sql
-- Pseudocode: for each row, parse JSON, transform, write back
UPDATE generation_run SET cell_states = transform(cell_states);
UPDATE cell_population SET cell_states = transform(cell_states);
```

Transform logic:
```
old: [{ number: 0, color: {...} }, { number: 1, color: {...} }]
new: { states: [{ role: "dead", color: {...} }, { role: "alive", color: {...} }], trail: { color: computed, size: 40, stepFn: "linear" } }
```

Where `number: 0` → `role: "dead"`, `number: 1` → `role: "alive"`, `number: N (N>1)` → `role: "alive N"`.
Trail color computed from alive state: `{ h: (alive.h + 180) % 360, s: 1, l: 0.65, a: 1 }`.

### 5. API Routes (pass-through — minimal changes)

These routes just shuttle JSON strings between client and DB. They don't inspect the `number` field, so they work transparently with the new format. **No code changes needed** unless we add validation:

- `app/src/routes/api/generation-runs/+server.ts`
- `app/src/routes/api/cell-populations/+server.ts`
- `app/src/routes/api/explore/+server.ts`
- `app/src/routes/api/top/+server.ts`
- `app/src/routes/api/my-saves/+server.ts`
- `app/src/routes/api/my-chest/+server.ts`

### 6. Viewer Base — State Object Generation

**`lib/viewer/base/index.ts:86-100`**

| Location | What | Change |
|---|---|---|
| `:34-42` `_states` / `_hslStringStates` | Keyed by number (`Record<number, HSLColor>`) | Keep numeric keys internally for renderer perf. Map `"dead"` → 0, `"alive"` → 1 at the boundary. |
| `:95-100` `generateStatesObject()` | Destructures `{ number, color }` | Destructure `{ role, color }`, map role → numeric index |
| `:90-93` `set states()` | Accepts `CellState[]` | Accept `CellStatesData` or `CellStateEntry[]` — also receive trail config |

### 7. Viewer Trail Rendering — Use Trail Config

**`lib/viewer/TwoDimensionInTwoDimensions.ts:282-312`** — `animateUpdateFn()`
- Currently hardcodes trail size `40` (`:263,284`) and computes trail hue as `(h + 180) % 360`
- Change to read `trailConfig.size` for mesh limit and `trailConfig.color` for the base hue
- Apply `trailConfig.stepFn` for color interpolation:
  - `"linear"`: current `lightness = 80 - t * 30` behavior
  - `"exponential"`: `t = (i / (last-1))^2` — fast fade then slow tail
  - `"none"`: solid `trailConfig.color` for all trail generations

**`lib/viewer/TwoDimensionInThreeDimensions.ts:200-227`** — `updateTrailAppearance()`
- Currently hardcodes `generationsToShow = 60` (`:25`) and computes trail hue/opacity gradient
- Same changes: read from trail config, apply step function
- Trail size sets `generationsToShow`

**`lib/viewer/ThreeDimensionInThreeDimensions.ts`** — `generationsToShow = 1`
- 3D viewer only shows 1 generation (no trail). Trail config can be ignored here, or trail size = 1 effectively disables it.

### 8. Svelte Components

**`app/src/lib/components/AutomataDetails.svelte:53-79`** — `labeledColors`
- Currently derives labels from array indices (`colors[0]` = dead, `colors[1]` = alive)
- Change to read `role` field directly from each state
- Trail color: read from `trail.color` in the parsed data instead of computing it

**`app/src/lib/components/MenuPanel.svelte:131-157`** — Color editor
- Displays `cellState.number` and passes it to `setCellStateColor(cellState.number, ...)`
- Change to display role label (`"Dead"`, `"Alive"`) and pass `cellState.role`
- Add trail color/size/stepFn controls

**`app/src/lib/components/AdvancedPanel.svelte:791-800`** — Color pills
- Uses `cs.number === 0 ? 'Dead' : 'Alive'` conditional
- Change to use `cs.role` directly for the label
- Pass `cs.role` to `setCellStateColor()`

**`app/src/lib/components/menu/StatesPopup.svelte:41-102`** — Color editor popup
- Displays `cellState.number`, uses it for toggle/edit state tracking
- Change display to role label, track editing state by role string
- Add trail section: color picker, size slider, stepFn dropdown

**`app/src/lib/components/ViewPlayer.svelte:214`**
- `viewer.states = automataStore.cellStates`
- Change to pass `automataStore.cellStatesData` (states + trail config)

**`app/src/lib/components/ViewControls.svelte:240-241`**
- `cellStates[0]?.color` / `cellStates[1]?.color` — accesses by index
- Change to find by role: `.find(s => s.role === 'dead')?.color`

**`app/src/lib/components/RightDrawerContent.svelte:50-57`**
- Parses cellStates when loading from drawer items
- Handle new `CellStatesData` wrapper format

**`app/src/lib/components/ViewerDescription.svelte:15`**
- Passes `cellStates: automataStore.cellStates` to detailsItem
- Change to pass full `cellStatesData`

### 9. History Store

**`app/src/lib/stores/history.svelte.ts:13`** — `HistoryEntry.cellStates`
- Type changes from `CellStateEntry[]` to `CellStatesData`

**`app/src/routes/(viewer)/+page.svelte:32`** — History loading
- Maps `entry.cellStates` — needs to handle new format

### 10. localStorage Migration

**`app/src/lib/stores/persistence.ts:296-306`** — `loadFromLocalStorage()`
- Existing saved data uses old `{ number, color }[]` format
- Add migration in `loadFromLocalStorage()` similar to `migrateCorruptedRules()`:
  - Detect old format (array with `.number` fields)
  - Transform to new `CellStatesData` wrapper
  - Compute default trail config from alive color

---

## Migration Order

1. **Type definitions** — `CellStateEntry`, `CellState`, new `TrailConfig`, `CellStatesData`
2. **Store internals** — default values, history maps, getters/setters, new trail methods
3. **Persistence** — URL params, localStorage migration
4. **Viewer base** — `generateStatesObject()`, state setter, trail config plumbing
5. **Viewer renderers** — use trail config for size/color/stepFn in all three viewers
6. **Components** — update all UI to use roles + trail controls
7. **AutomataDetails** — read roles from data instead of inferring from indices
8. **DB migration script** — transform existing `cell_states` JSON in both tables
9. **Smoke test** — verify round-trip: mine → save → load from DB → display correct colors/trail
