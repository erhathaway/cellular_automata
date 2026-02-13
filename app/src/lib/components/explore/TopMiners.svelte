<script lang="ts">
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import RankBadge from './RankBadge.svelte';
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

        <!-- Rank badge -->
        <div class="rank-icon">
          <RankBadge rank={i + 1} />
        </div>

        <!-- Avatar -->
        <div class="avatar-area">
          <div style="position: absolute; left: calc(50% + 10px); top: 50%; transform: translate(-50%, -50%);">
            <PixelAvatar
              avatarId={entry.avatarId}
              size={200}
              fallbackInitials={(entry.displayName ?? '?')[0]}
              minerConfig={entry.minerConfig}
              userId={entry.userId}
              popupData={{ displayName: entry.displayName, claimCount: entry.claimCount, byRadius: entry.byRadius, byLattice: entry.byLattice }}
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
    font-family: 'Pixelify Sans Variable', 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
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
    flex: 0 0 calc((100% - 24px) / 3);
    max-width: 340px;
    min-width: 160px;
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
    height: 180px;
  }

  .miner-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
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
    font-size: 18px;
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
    font-size: 14px;
    font-weight: 500;
    color: #a8a29e;
  }

  .bucket-track {
    width: 32px;
    height: 48px;
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

  @media (min-width: 1200px) {
    .avatar-area {
      height: 250px;
    }

    .miner-name {
      font-size: 20px;
    }

    .claim-count {
      font-size: 22px;
    }

    .bucket-count {
      font-size: 18px;
    }

    .bucket-track {
      width: 40px;
      height: 60px;
    }
  }
</style>
