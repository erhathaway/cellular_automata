<script lang="ts">
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';

  type LeaderboardEntry = {
    userId: string;
    displayName: string | null;
    avatarId: string | null;
    minerConfig: string | null;
    claimCount: number;
    byRadius: Record<string, number>;
    byLattice: Record<string, number>;
  };

  let { miners = [], onminerclick }: { miners: LeaderboardEntry[]; onminerclick?: (entry: LeaderboardEntry) => void } = $props();

  function levelBreakdown(entry: LeaderboardEntry): { key: string; label: string; count: number; pct: number }[] {
    const agg = aggregateByLevel(entry.byRadius);
    const total = entry.claimCount || 1;
    return LEVELS.map(l => ({
      key: l.key,
      label: l.label,
      count: agg[l.key] ?? 0,
      pct: Math.round(((agg[l.key] ?? 0) / total) * 100)
    })).filter(l => l.count > 0);
  }

  function topLattice(entry: LeaderboardEntry): string {
    const entries = Object.entries(entry.byLattice);
    if (entries.length === 0) return '';
    entries.sort((a, b) => b[1] - a[1]);
    const [type] = entries[0];
    return (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type;
  }

  const trophyColors = [
    { cup: '#facc15', cupDark: '#ca8a04', shine: '#fef9c3', base: '#b45309', baseDark: '#92400e', glow: 'rgba(250, 204, 21, 0.4)' },
    { cup: '#d6d3d1', cupDark: '#78716c', shine: '#fafaf9', base: '#57534e', baseDark: '#44403c', glow: 'rgba(168, 162, 158, 0.3)' },
    { cup: '#d4a06a', cupDark: '#8b5e3c', shine: '#e8bc88', base: '#704828', baseDark: '#5c3a1e', glow: 'rgba(180, 120, 60, 0.3)' },
  ];

  const medalColors = [
    { fill: '#57534e', border: '#78716c', text: '#a8a29e', ribbon: '#44403c' },
  ];
</script>

<div class="top-miners-row">
  <div class="section-header">
    <span class="section-label">Top Miners</span>
  </div>
  <div class="miners-scroll">
    {#each miners.slice(0, 10) as entry, i (entry.userId)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="miner-card" class:first={i === 0} class:second={i === 1} class:third={i === 2} onclick={() => onminerclick?.(entry)}>
        <div class="nails"><div class="nail"></div><div class="nail"></div></div>
        <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

        <!-- Rank badge: trophy for top 3, medal for rest -->
        {#if i < 3}
          {@const c = trophyColors[i]}
          <div class="rank-icon" style="filter: drop-shadow(0 0 6px {c.glow});">
            <svg width="54" height="60" viewBox="0 0 36 40" fill="none">
              <!-- Handles -->
              <path d="M5 8 C5 8 1 8 1 13 C1 18 5 18 5 18" stroke="{c.cup}" stroke-width="2" fill="none"/>
              <path d="M31 8 C31 8 35 8 35 13 C35 18 31 18 31 18" stroke="{c.cup}" stroke-width="2" fill="none"/>
              <!-- Cup body -->
              <path d="M7 6 L7 20 C7 26 12 30 18 30 C24 30 29 26 29 20 L29 6 Z" fill="url(#cup{i})" stroke="{c.cupDark}" stroke-width="1"/>
              <!-- Shine -->
              <ellipse cx="14" cy="14" rx="3" ry="6" fill="{c.shine}" opacity="0.25"/>
              <!-- Stem -->
              <rect x="16" y="29" width="4" height="5" rx="1" fill="{c.cupDark}"/>
              <!-- Base -->
              <rect x="11" y="33" width="14" height="4" rx="2" fill="url(#base{i})" stroke="{c.baseDark}" stroke-width="0.5"/>
              <!-- Number -->
              <text x="18" y="21" text-anchor="middle" font-family="'Space Mono', monospace" font-size="16" font-weight="700" fill="#1c1917" stroke="#1c1917" stroke-width="0.5">{i + 1}</text>
              <defs>
                <linearGradient id="cup{i}" x1="7" y1="6" x2="29" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="{c.shine}" stop-opacity="0.6"/>
                  <stop offset="40%" stop-color="{c.cup}"/>
                  <stop offset="100%" stop-color="{c.cupDark}"/>
                </linearGradient>
                <linearGradient id="base{i}" x1="11" y1="33" x2="11" y2="37" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="{c.base}"/>
                  <stop offset="100%" stop-color="{c.baseDark}"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        {:else}
          <div class="rank-icon">
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
              <!-- Ribbon -->
              <path d="M8 0 L4 14 L14 10 L24 14 L20 0 Z" fill="#44403c"/>
              <path d="M8 0 L4 14 L14 10" fill="#57534e"/>
              <!-- Medal circle -->
              <circle cx="14" cy="20" r="11" fill="url(#medal{i})" stroke="#57534e" stroke-width="1.5"/>
              <circle cx="14" cy="20" r="8" fill="none" stroke="#44403c" stroke-width="0.75"/>
              <!-- Number -->
              <text x="14" y="24" text-anchor="middle" font-family="'Space Mono', monospace" font-size="11" font-weight="700" fill="#a8a29e">{i + 1}</text>
              <defs>
                <radialGradient id="medal{i}" cx="0.4" cy="0.35" r="0.6">
                  <stop offset="0%" stop-color="#57534e"/>
                  <stop offset="100%" stop-color="#292524"/>
                </radialGradient>
              </defs>
            </svg>
          </div>
        {/if}

        <!-- Avatar -->
        <div class="avatar-area">
          <div style="position: absolute; left: calc(50% + 20px); top: 50%; transform: translate(-50%, -50%);">
            <PixelAvatar
              avatarId={entry.avatarId}
              size={360}
              fallbackInitials={(entry.displayName ?? '?')[0]}
              minerConfig={entry.minerConfig}
            />
          </div>
        </div>

        <!-- Name -->
        <div class="miner-name">{entry.displayName ?? 'Anonymous'}</div>

        <!-- Claim count -->
        <div class="claims-badge">
          <svg class="claims-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h12l4 6-10 13L2 9Z" />
            <path d="M11 3 8 9l4 13 4-13-3-6" />
            <path d="M2 9h20" />
          </svg>
          <span class="claim-count">{entry.claimCount}</span>
          <span class="claim-label">claims</span>
        </div>

        <!-- Level buckets (vertical bars) -->
        <div class="level-buckets">
          {#each levelBreakdown(entry) as lb (lb.key)}
            <div class="bucket-col">
              <span class="bucket-count">{lb.count}</span>
              <div class="bucket-track">
                <div class="bucket-fill bucket-{lb.key}" style="height: {Math.max(6, (lb.count / entry.claimCount) * 100)}%;"></div>
              </div>
              <span class="bucket-label level-text-{lb.key}">{lb.label}</span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .top-miners-row {
    margin-bottom: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-label {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
  }

  .miners-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overflow-y: visible;
    padding: 32px 0 8px;
    scrollbar-width: thin;
    scrollbar-color: #44403c transparent;
  }

  .miners-scroll::-webkit-scrollbar {
    height: 4px;
  }

  .miners-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .miners-scroll::-webkit-scrollbar-thumb {
    background: #44403c;
    border-radius: 2px;
  }

  .miner-card {
    position: relative;
    flex-shrink: 0;
    width: 340px;
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
    padding: 32px 14px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    overflow: visible;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .miner-card:hover {
    border-color: #facc15;
  }

  .miner-card.first {
    border-color: rgba(250, 204, 21, 0.4);
  }

  .miner-card.second {
    border-color: rgba(168, 162, 158, 0.4);
  }

  .miner-card.third {
    border-color: rgba(180, 120, 60, 0.4);
  }

  /* Nails */
  .nails {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
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

  /* Rank icon (trophy / medal) */
  .rank-icon {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .avatar-area {
    margin-top: 4px;
    margin-bottom: -20px;
    position: relative;
    width: 100%;
    height: 280px;
  }

  .miner-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #d6d3d1;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .claims-badge {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-top: 24px;
    margin-bottom: 20px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(250, 204, 21, 0.08);
    border: 1px solid rgba(250, 204, 21, 0.2);
  }

  .claims-icon {
    align-self: center;
    flex-shrink: 0;
  }

  .claim-count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: #fef08a;
  }

  .claim-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
  }

  /* Level buckets (vertical) */
  .level-buckets {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
  }

  .bucket-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .bucket-count {
    font-family: 'Space Mono', monospace;
    font-size: 18px;
    font-weight: 500;
    color: #a8a29e;
  }

  .bucket-track {
    width: 40px;
    height: 60px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid #292524;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .bucket-fill {
    width: 100%;
    border-radius: 2px;
    transition: height 0.3s ease;
  }

  .bucket-easy { background: linear-gradient(0deg, #22c55e, #4ade80); }
  .bucket-medium { background: linear-gradient(0deg, #eab308, #fde047); }
  .bucket-hard { background: linear-gradient(0deg, #ef4444, #f87171); }

  .bucket-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .level-text-easy { color: #4ade80; }
  .level-text-medium { color: #fde047; }
  .level-text-hard { color: #f87171; }
</style>
