<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';

  type LeaderboardEntry = {
    userId: string;
    displayName: string | null;
    avatarId: string | null;
    claimCount: number;
    byRadius: Record<string, number>;
    byLattice: Record<string, number>;
  };

  type StatsResponse = {
    totalClaims: number;
    byRadius: Record<string, number>;
    byLattice: Record<string, number>;
    leaderboard: LeaderboardEntry[];
  };

  let stats: StatsResponse | null = $state(null);
  let loading = $state(true);

  let levelData = $derived.by(() => {
    if (!stats) return [];
    const agg = aggregateByLevel(stats.byRadius);
    return LEVELS.map(l => ({ key: l.key, label: l.label, count: agg[l.key] ?? 0 }));
  });

  let maxLevel = $derived.by(() => {
    if (levelData.length === 0) return 1;
    const m = Math.max(...levelData.map(d => d.count));
    return m > 0 ? m : 1;
  });

  let latticeData = $derived.by(() => {
    if (!stats) return [];
    return Object.entries(stats.byLattice)
      .map(([type, count]) => ({
        type,
        label: (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type,
        count
      }))
      .sort((a, b) => b.count - a.count);
  });

  let maxLattice = $derived.by(() => {
    if (latticeData.length === 0) return 1;
    const m = Math.max(...latticeData.map(d => d.count));
    return m > 0 ? m : 1;
  });

  onMount(async () => {
    try {
      stats = await api<StatsResponse>('GET', '/api/explore/stats');
    } finally {
      loading = false;
    }
  });

  function userLevelBreakdown(entry: LeaderboardEntry): { key: string; label: string; pct: number }[] {
    const agg = aggregateByLevel(entry.byRadius);
    const total = entry.claimCount || 1;
    return LEVELS.map(l => ({
      key: l.key,
      label: l.label,
      pct: Math.round(((agg[l.key] ?? 0) / total) * 100)
    })).filter(l => l.pct > 0);
  }
</script>

<div class="stats-body">
  {#if loading}
    <div class="loading">Loading stats...</div>
  {:else if stats}
    <!-- Total Claims -->
    <div class="total-card">
      <div class="section-label">Total Claims</div>
      <div class="total-value">{stats.totalClaims.toLocaleString()}</div>
    </div>

    <!-- Level Distribution -->
    <div class="chart-card">
      <div class="section-label">Level Distribution</div>
      <div class="hbar-list">
        {#each levelData as d (d.key)}
          <div class="hbar-row">
            <div class="hbar-name">{d.label}</div>
            <div class="hbar-track">
              <div
                class="hbar-fill"
                style="width: {Math.max(2, (d.count / maxLevel) * 100)}%;"
              ></div>
            </div>
            <div class="hbar-count">{d.count}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Lattice Distribution -->
    <div class="chart-card">
      <div class="section-label">Lattice Distribution</div>
      <div class="hbar-list">
        {#each latticeData as d (d.type)}
          <div class="hbar-row">
            <div class="hbar-name">{d.label}</div>
            <div class="hbar-track">
              <div
                class="hbar-fill"
                style="width: {Math.max(2, (d.count / maxLattice) * 100)}%;"
              ></div>
            </div>
            <div class="hbar-count">{d.count}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Leaderboard -->
    {#if stats.leaderboard.length > 0}
      <div class="chart-card leaderboard-card">
        <div class="section-label">Leaderboard</div>
        <div class="leaderboard-scroll">
          <table class="leaderboard">
            <thead>
              <tr>
                <th class="th-rank">#</th>
                <th class="th-user">Explorer</th>
                <th class="th-count">Claims</th>
                <th class="th-levels">Levels</th>
              </tr>
            </thead>
            <tbody>
              {#each stats.leaderboard as entry, i (entry.userId)}
                <tr>
                  <td class="td-rank">{i + 1}</td>
                  <td class="td-user">
                    <PixelAvatar
                      avatarId={entry.avatarId}
                      size={22}
                      fallbackInitials={(entry.displayName ?? '?')[0]}
                    />
                    <span class="user-name">{entry.displayName ?? 'Anonymous'}</span>
                  </td>
                  <td class="td-count">{entry.claimCount}</td>
                  <td class="td-levels">
                    <div class="level-chips">
                      {#each userLevelBreakdown(entry) as lb (lb.key)}
                        <span class="level-chip level-{lb.key}">{lb.label[0]} {lb.pct}%</span>
                      {/each}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .stats-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    padding: 18px 14px;
    overflow-y: auto;
  }

  .loading {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #a8a29e;
    padding: 24px 0;
    text-align: center;
  }

  .section-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
    margin-bottom: 8px;
  }

  /* Total Claims Card */
  .total-card {
    border: 1px solid #e7e5e4;
    border-radius: 6px;
    background: #fafaf9;
    padding: 12px;
  }

  .total-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: #1c1917;
  }

  /* Chart cards */
  .chart-card {
    border: 1px solid #e7e5e4;
    border-radius: 6px;
    background: #fafaf9;
    padding: 12px;
  }

  /* Horizontal bar chart */
  .hbar-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hbar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hbar-name {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #44403c;
    width: 60px;
    flex-shrink: 0;
  }

  .hbar-track {
    flex: 1;
    height: 14px;
    border-radius: 3px;
    background: #f5f5f4;
    border: 1px solid #e7e5e4;
    overflow: hidden;
  }

  .hbar-fill {
    height: 100%;
    background: #1c1917;
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .hbar-count {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #1c1917;
    width: 36px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Leaderboard */
  .leaderboard-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .leaderboard-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .leaderboard {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
  }

  .leaderboard thead {
    position: sticky;
    top: 0;
    background: #fafaf9;
  }

  .leaderboard th {
    text-align: left;
    font-weight: 600;
    color: #78716c;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 4px 6px;
    border-bottom: 1px solid #e7e5e4;
  }

  .th-rank { width: 24px; }
  .th-count { width: 44px; text-align: right; }
  .th-levels { text-align: right; }

  .leaderboard td {
    padding: 5px 4px;
    border-bottom: 1px solid #f5f5f4;
    color: #44403c;
    vertical-align: middle;
  }

  .td-rank {
    font-weight: 700;
    color: #a8a29e;
  }

  .td-user {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .user-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
  }

  .td-count {
    font-weight: 700;
    text-align: right;
    color: #1c1917;
  }

  .td-levels {
    text-align: right;
  }

  .level-chips {
    display: flex;
    gap: 3px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .level-chip {
    font-size: 8px;
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: 600;
    white-space: nowrap;
  }

  .level-easy {
    background: #dcfce7;
    color: #166534;
  }

  .level-medium {
    background: #fef9c3;
    color: #854d0e;
  }

  .level-hard {
    background: #fee2e2;
    color: #991b1b;
  }
</style>
