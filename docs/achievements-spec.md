# Achievements System Specification

## Overview

A progression system that rewards users for exploration, mining, and curation of cellular automata. Achievements are defined in code config, tracked in the database, and displayed in the "My Chest" page. Newly earned achievements trigger animated notifications.

## Database Schema

### `user_achievement`
Tracks which achievements a user has earned.

| Column | Type | Description |
|---|---|---|
| id | text PK | UUID |
| user_id | text FK | References user.id (cascade delete) |
| achievement_id | text | Config key matching AchievementDef.id |
| earned_at | integer (timestamp) | When the achievement was earned |
| seen | integer (boolean) | Whether the notification has been dismissed |

**Indexes:** unique(user_id, achievement_id), index(user_id)

### `user_generation_view`
Tracks unique automata configurations a user has viewed (lattice + rule + dimension + radius). Does NOT include seed or snapshot — only the configuration parameters.

| Column | Type | Description |
|---|---|---|
| id | text PK | UUID |
| user_id | text FK | References user.id (cascade delete) |
| lattice_type | text nullable | Lattice type string |
| rule_definition | text | Serialized rule (e.g. "B3S2,3" or "W110") |
| dimension | integer | 1, 2, or 3 |
| neighborhood_radius | integer | Default 1 |
| viewed_at | integer (timestamp) | Last viewed timestamp (updated on re-view) |

**Indexes:** unique(user_id, lattice_type, rule_definition, dimension, neighborhood_radius), index(user_id)

## Achievement Config

File: `app/src/lib/achievements/config.ts`

Shared between server and client. Each achievement has:
- `id` — unique string key
- `name` — display name
- `description` — human-readable unlock condition
- `category` — one of: taste, mining_rank, work_ethic, operator
- `order` — sort order within category
- `revocable` — whether the achievement can be taken away if conditions no longer met
- `icon` — icon key for AchievementIcon component

## Categories & Achievements

### Taste (revocable)
- `miner_with_taste` — <10% of viewed automata liked, min 10 views
- `aspiring_artist` — <5% of viewed automata liked, min 20 views

### Mining Rank (non-revocable)
- `starting_miner` — Has claim in top 90% (>= P10 of all like counts)
- `amateur_miner` — Top 50% (>= P50)
- `intermediate_miner` — Top 25% (>= P75)
- `skilled_miner` — Top 10% (>= P90)
- `expert_miner` — Top 5% (>= P95)

### Work Ethic (non-revocable)
- `slow_and_steady` — 30+ generation_run rows
- `workaholic` — 100+ generation_run rows
- `obsessive_employee` — 1000+ generation_run rows

### Operator (revocable)
- `smooth_operator` — <50% of weekly views claimed, min 10 views
- `advanced_operator` — <10% of weekly views claimed, min 20 views
- `skilled_operator` — <5% of weekly views claimed, min 50 views

## Calculation Details

### Taste
- `totalViewed` = COUNT of user_generation_view WHERE userId
- `totalLiked` = COUNT of like WHERE userId
- ratio = totalLiked / totalViewed
- Minimum view thresholds prevent trivial earning

### Mining Rank
- Fetch all claim like_counts across ALL users (generation_run + cell_population)
- Sort ascending, compute percentile thresholds
- "Top 90%" means user's best claim >= P10 value
- "Top 5%" means user's best claim >= P95 value

### Work Ethic
- COUNT of generation_run WHERE userId
- Simple threshold comparison

### Operator
- weeklyViews = COUNT of user_generation_view WHERE userId AND viewedAt >= 7 days ago
- weeklyClaims = COUNT of generation_run WHERE userId AND createdAt >= 7 days ago
- ratio = weeklyClaims / weeklyViews

## API Endpoints

### GET /api/achievements
Returns all achievements with earned/seen status for authenticated user.

Response: `{ achievements: [...], unseenCount: number }`

### POST /api/achievements/check/[achievementId]
Checks one achievement, updates DB, returns result.

Response: `{ achievementId, earned, newlyEarned, revoked }`

### POST /api/achievements/seen
Marks achievements as seen (notification dismissed).

Body: `{ achievementIds: string[] }`

### POST /api/generation-views
Upserts a view record for the authenticated user.

Body: `{ latticeType, ruleDefinition, dimension, neighborhoodRadius }`

## Client Polling Flow

1. User navigates to My Chest > Achievements tab
2. `AchievementGrid` mounts, calls `achievementsStore.fetch()` (GET /api/achievements)
3. User clicks "Check for updates"
4. `achievementsStore.checkAll()` iterates through all achievement IDs sequentially
5. Each iteration: POST /api/achievements/check/[id], updates local state
6. Progress bar shows current/total
7. After all checks: newly earned achievements trigger notification
8. Notification auto-dismisses after 8s or manual dismiss calls POST /api/achievements/seen

## Generation View Tracking

ViewPlayer.svelte tracks views with a 2-second debounce after `initViewer()`. Each new configuration the user dwells on for 2+ seconds counts as "seen." Only fires for signed-in users (unauthenticated requests return 401 silently).

## UI Components

### AchievementCard
- Corner brackets and nail decorations matching CompactCard cyberpunk aesthetic
- Locked: dimmed with padlock overlay
- Unlocked: gold accent icon, name, earned date
- Unseen: pulsing gold glow border animation

### AchievementGrid
- Groups achievements by category with headers
- "Check for updates" button with progress bar during check
- Fetches achievement state on mount

### AchievementNotification
- Fixed position bottom-right (z-index 100)
- Single: icon + name + "Achievement unlocked!"
- Multiple: count + compact list
- Links to My Chest achievements tab
- Auto-dismiss after 8s
- Dismissing marks as seen via API

### AchievementIcon
- SVG icons per category (star for taste, gem for rank, pickaxe for work, sun for operator)
- Locked state: grayscale + dimmed

## Edge Cases

- **Revocable achievements:** Taste and Operator achievements can be revoked if the user's ratio changes. Non-revocable achievements (Mining Rank, Work Ethic) are never removed once earned.
- **Multiple unlocks:** The notification component handles both single and multiple newly earned achievements with different layouts.
- **Race conditions:** Each check/[id] endpoint is independent and uses INSERT OR IGNORE for idempotent upserts.
- **No views yet:** Achievements requiring view counts gracefully return false with 0 views.
- **Division by zero:** All ratio calculations check minimum view thresholds before dividing.
