<script lang="ts">
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';

  let {
    stats
  }: {
    stats: { claimCount: number; byRadius: Record<string, number>; byLattice: Record<string, number> };
  } = $props();

  let levelData = $derived.by(() => {
    const agg = aggregateByLevel(stats.byRadius);
    return LEVELS.map(l => ({ key: l.key, label: l.label, count: agg[l.key] ?? 0 }));
  });

  let maxLevel = $derived.by(() => {
    const m = Math.max(...levelData.map(d => d.count));
    return m > 0 ? m : 1;
  });

  let latticeData = $derived.by(() => {
    return Object.entries(stats.byLattice)
      .map(([type, count]) => ({
        type,
        label: (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type,
        count
      }))
      .sort((a, b) => b.count - a.count);
  });

  let maxLattice = $derived.by(() => {
    const m = Math.max(...latticeData.map(d => d.count));
    return m > 0 ? m : 1;
  });
</script>

<!-- Total Claims -->
<div class="panel">
  <div class="nails"><div class="nail"></div><div class="nail"></div></div>
  <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
  <div class="stat-label">Total Claims</div>
  <div class="claims-row">
    <svg class="claims-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
    <span class="total-value">{stats.claimCount.toLocaleString()}</span>
  </div>
</div>

<!-- Level Distribution -->
<div class="panel">
  <div class="nails"><div class="nail"></div><div class="nail"></div></div>
  <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
  <div class="stat-label">Level Distribution</div>
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
{#if latticeData.length > 0}
  <div class="panel">
    <div class="nails"><div class="nail"></div><div class="nail"></div></div>
    <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
    <div class="stat-label">Lattice Distribution</div>
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

<style>
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

  .stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fde68a;
    margin-bottom: 10px;
  }

  .claims-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .claims-icon {
    flex-shrink: 0;
  }

  .total-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: #fef08a;
  }

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
