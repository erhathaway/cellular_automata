<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';
  type StatsResponse = {
    totalClaims: number;
    byRadius: Record<string, number>;
    byLattice: Record<string, number>;
    leaderboard: unknown[];
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

</script>

<div class="stats-body">
  {#if loading}
    <div class="loading">Loading stats...</div>
  {:else if stats}
    <!-- Total Claims -->
    <div class="panel">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      <div class="section-label">Total Claims</div>
      <div class="total-value">{stats.totalClaims >= 1_000_000 ? (stats.totalClaims / 1_000_000).toFixed(2) + 'm' : stats.totalClaims >= 1_000 ? (stats.totalClaims / 1_000).toFixed(2) + 'k' : stats.totalClaims}</div>
    </div>

    <!-- Level Distribution -->
    <div class="panel">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
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
    <div class="panel">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
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

  {/if}
</div>

<style>
  .stats-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
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

  /* ── Panel (black-mode) ── */
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

  /* Nails */
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

  .section-label {
    font-family: 'Pixelify Sans Variable', 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 10px;
    background: linear-gradient(
      90deg,
      #ff6b9d,
      #ffa64d,
      #ffe44d,
      #7ddf64,
      #4dc8ff,
      #a78bfa,
      #ff6b9d
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbow-shift 4s linear infinite;
  }

  @keyframes rainbow-shift {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* Total Claims */
  .total-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: #fef08a;
  }

  /* Horizontal bar chart */
  .hbar-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .hbar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hbar-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #d6d3d1;
    width: 68px;
    flex-shrink: 0;
  }

  .hbar-track {
    flex: 1;
    height: 16px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid #44403c;
    overflow: hidden;
  }

  .hbar-fill {
    height: 100%;
    background: linear-gradient(90deg, #facc15 0%, #fde047 100%);
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .hbar-count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #d6d3d1;
    width: 36px;
    text-align: right;
    flex-shrink: 0;
  }

</style>
