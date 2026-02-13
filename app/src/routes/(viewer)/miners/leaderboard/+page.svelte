<script lang="ts">
  import { goto } from '$app/navigation';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import RankBadge from '$lib/components/explore/RankBadge.svelte';

  let { data } = $props();

  type Entry = typeof data.leaderboard[number];

  type SortKey = 'rank' | 'name' | 'total' | 'easy' | 'medium' | 'hard' | 'lattice' | 'joined';
  let sortKey: SortKey = $state('rank');
  let sortDir: 'asc' | 'desc' = $state('asc');

  // Keys that default to descending on first click
  const descDefaultKeys: SortKey[] = ['total', 'easy', 'medium', 'hard'];

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = descDefaultKeys.includes(key) ? 'desc' : 'asc';
    }
  }

  function getLevelCounts(entry: Entry) {
    return aggregateByLevel(entry.byRadius);
  }

  function primaryLattice(entry: Entry): string {
    const entries = Object.entries(entry.byLattice);
    if (entries.length === 0) return '';
    entries.sort((a, b) => b[1] - a[1]);
    const type = entries[0][0];
    return (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type;
  }

  let sortedEntries = $derived.by(() => {
    const list = [...data.leaderboard];
    const dir = sortDir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      switch (sortKey) {
        case 'rank':
          return (a.rank - b.rank) * dir;
        case 'name': {
          const an = (a.displayName ?? '').toLowerCase();
          const bn = (b.displayName ?? '').toLowerCase();
          return an < bn ? -dir : an > bn ? dir : 0;
        }
        case 'total':
          return (a.claimCount - b.claimCount) * dir;
        case 'easy':
          return ((getLevelCounts(a).easy ?? 0) - (getLevelCounts(b).easy ?? 0)) * dir;
        case 'medium':
          return ((getLevelCounts(a).medium ?? 0) - (getLevelCounts(b).medium ?? 0)) * dir;
        case 'hard':
          return ((getLevelCounts(a).hard ?? 0) - (getLevelCounts(b).hard ?? 0)) * dir;
        case 'lattice': {
          const al = primaryLattice(a).toLowerCase();
          const bl = primaryLattice(b).toLowerCase();
          return al < bl ? -dir : al > bl ? dir : 0;
        }
        case 'joined': {
          const at = a.createdAt ?? '';
          const bt = b.createdAt ?? '';
          return at < bt ? -dir : at > bt ? dir : 0;
        }
        default:
          return 0;
      }
    });

    return list;
  });

  function arrow(key: SortKey): string {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  }
</script>

<div class="leaderboard-page">
  <div class="mx-auto max-w-5xl px-6 pt-8 pb-16">
    <!-- Header -->
    <a href="/explore" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Gallery
    </a>

    <h1 class="page-title">Leaderboard</h1>
    <p class="page-subtitle">{data.leaderboard.length} explorers</p>

    <!-- Table -->
    <div class="panel">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

      <div class="table-scroll">
        <table class="lb-table">
          <thead>
            <tr>
              <th class="th-rank" onclick={() => toggleSort('rank')}># {arrow('rank')}</th>
              <th class="th-user" onclick={() => toggleSort('name')}>Explorer{arrow('name')}</th>
              <th class="th-count" onclick={() => toggleSort('total')}>Claims{arrow('total')}</th>
              <th class="th-level" onclick={() => toggleSort('easy')}>Easy{arrow('easy')}</th>
              <th class="th-level" onclick={() => toggleSort('medium')}>Medium{arrow('medium')}</th>
              <th class="th-level" onclick={() => toggleSort('hard')}>Hard{arrow('hard')}</th>
              <th class="th-lattice" onclick={() => toggleSort('lattice')}>Top Lattice{arrow('lattice')}</th>
              <th class="th-joined" onclick={() => toggleSort('joined')}>Joined{arrow('joined')}</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedEntries as entry (entry.userId)}
              {@const levels = getLevelCounts(entry)}
              <tr class="lb-row" onclick={() => goto(`/miners/detail/${entry.userId}`)}>
                <td class="td-rank">
                  {#if entry.rank <= 3}
                    <div class="rank-badge-wrap">
                      <RankBadge rank={entry.rank} />
                    </div>
                  {:else}
                    {entry.rank}
                  {/if}
                </td>
                <td class="td-user">
                  <PixelAvatar
                    avatarId={entry.avatarId}
                    size={48}
                    fallbackInitials={(entry.displayName ?? '?')[0]}
                    minerConfig={entry.minerConfig}
                    cropUpper
                  />
                  <span class="user-name">{entry.displayName ?? 'Anonymous'}</span>
                </td>
                <td class="td-count">{entry.claimCount}</td>
                <td class="td-easy">{levels.easy || '\u2014'}</td>
                <td class="td-medium">{levels.medium || '\u2014'}</td>
                <td class="td-hard">{levels.hard || '\u2014'}</td>
                <td class="td-lattice">{primaryLattice(entry) || '\u2014'}</td>
                <td class="td-joined">{entry.createdAt ? timeAgo(entry.createdAt) : '\u2014'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<style>
  .leaderboard-page {
    background: #000;
    min-height: 100%;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
    text-decoration: none;
    margin-bottom: 24px;
    transition: color 0.2s ease;
  }

  .back-link:hover {
    color: #facc15;
  }

  .page-title {
    font-family: 'Space Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    margin: 0 0 4px;
  }

  .page-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #78716c;
    margin: 0 0 24px;
  }

  /* Panel */
  .panel {
    position: relative;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 10px,
        rgba(68, 64, 60, 0.1) 10px,
        rgba(68, 64, 60, 0.1) 11px
      );
    border: 1px solid #44403c;
    border-radius: 8px;
    padding: 20px 16px;
  }

  .nails {
    position: absolute;
    top: 8px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 8px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  /* Table */
  .table-scroll {
    overflow-x: auto;
  }

  .lb-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
  }

  .lb-table thead {
    position: sticky;
    top: 0;
    background: #1c1917;
  }

  .lb-table th {
    text-align: left;
    font-family: 'Space Mono', monospace;
    font-weight: 600;
    color: #78716c;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 6px 8px 8px;
    border-bottom: 1px solid #44403c;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: color 0.15s ease;
  }

  .lb-table th:hover {
    color: #d6d3d1;
  }

  .th-rank { width: 56px; }
  .th-count, .th-level { text-align: right; }
  .th-joined { text-align: right; }

  .lb-table td {
    padding: 8px 8px;
    border-bottom: 1px solid #292524;
    color: #a8a29e;
    vertical-align: middle;
  }

  .lb-row {
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .lb-row:hover {
    background-color: #292524;
  }

  .td-rank {
    font-weight: 700;
    color: #78716c;
    width: 56px;
  }

  .rank-badge-wrap {
    transform: scale(0.5);
    transform-origin: left center;
  }

  .td-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
    color: #d6d3d1;
    font-weight: 600;
  }

  .td-count {
    font-weight: 700;
    text-align: right;
    color: #fef08a;
  }

  .td-easy {
    text-align: right;
    color: #4ade80;
    font-weight: 600;
  }

  .td-medium {
    text-align: right;
    color: #fde047;
    font-weight: 600;
  }

  .td-hard {
    text-align: right;
    color: #f87171;
    font-weight: 600;
  }

  .td-lattice {
    color: #a8a29e;
    font-size: 12px;
  }

  .td-joined {
    text-align: right;
    color: #78716c;
    font-size: 12px;
    white-space: nowrap;
  }
</style>
