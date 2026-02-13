<script lang="ts">
  import { timeAgo } from '$lib/utils/timeAgo';
  import { radiusToLevel } from '$lib/levels';
  import { getLattice, defaultLattice } from '$lib-core';
  import type { LatticeType } from '$lib-core';
  import PixelAvatar from './PixelAvatar.svelte';

  let {
    item,
    hideOwner = false
  }: {
    item: any;
    hideOwner?: boolean;
  } = $props();

  function displayTitle() {
    if (item.title) return item.title;
    return `${item.ruleDefinition} (${item.dimension}D)`;
  }

  function levelLabel(): string {
    return radiusToLevel(item.neighborhoodRadius ?? 1);
  }

  function latticeLabel(): string | null {
    const lat = item.latticeType as LatticeType | undefined | null;
    if (!lat) return null;
    const dim = (item.dimension ?? 2) as 2 | 3;
    if (lat === defaultLattice(dim)) return null;
    try {
      return getLattice(lat).label;
    } catch {
      return null;
    }
  }
</script>

<div class="details-wrap" class:no-avatar={hideOwner}>
  {#if !hideOwner}
    <div class="owner-avatar-label">
      <div class="owner-content">
        <div class="owner-avatar-wrap">
          <PixelAvatar avatarId={item.userAvatarId} size={96} fallbackInitials={(item.userName ?? 'A')[0]} minerConfig={item.userMinerConfig} cropUpper userId={item.userId} />
        </div>
      </div>
    </div>
  {/if}
  <div class="chip-info">
    <p class="rule-text">
      {displayTitle()}
    </p>
    <div class="pills-row">
      <span class="pill level-{levelLabel()}">{levelLabel()}</span>
      <span class="pill dim">{item.dimension}D</span>
      {#if latticeLabel()}
        <span class="pill lattice">{latticeLabel()}</span>
      {/if}
      {#if (item.neighborhoodRadius ?? 1) > 1}
        <span class="pill radius">r={item.neighborhoodRadius}</span>
      {/if}
    </div>
    {#if !hideOwner}
      <div class="owner-meta">
        <p class="username-inline">{item.userName ?? 'Anonymous'}</p>
        {#if item.createdAt}
          <span class="time-ago">{timeAgo(item.createdAt)}</span>
        {/if}
      </div>
    {:else if item.createdAt}
      <span class="time-ago">{timeAgo(item.createdAt)}</span>
    {/if}
  </div>
</div>

<style>
  .details-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding-left: 2px;
  }

  .chip-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
    margin-top: -11px;
    margin-left: -4px;
  }

  .no-avatar .chip-info {
    margin-top: 0;
    margin-left: 0;
  }

  .owner-avatar-label {
    position: relative;
    width: 96px;
    height: 96px;
  }

  .owner-content {
    position: relative;
    z-index: 1;
  }

  .owner-avatar-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    margin-top: 3px;
  }

  .owner-meta {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    min-width: 0;
    margin-top: -1px;
    padding: 0 2px;
    max-width: 100%;
  }

  .username-inline {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #d6d3d1;
    margin: 0;
    line-height: 1.2;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rule-text {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #facc15;
    margin: 0 0 1px;
    padding: 2px 8px 3px;
    background: #1c1917;
    border: 1px solid #44403c;
    border-radius: 6px;
    box-shadow: 0 2px 0 rgba(28, 25, 23, 0.88), 0 0 0 1px rgba(250, 204, 21, 0.12);
    display: inline-block;
    width: fit-content;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.15;
  }

  .time-ago {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #78716c;
    flex-shrink: 0;
  }

  /* ── Pills row ── */
  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 1px;
  }

  .pill {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 3px;
    padding: 1px 5px;
    line-height: 1.3;
    white-space: nowrap;
  }

  .pill.level-easy {
    color: #16a34a;
    background: rgba(22, 163, 74, 0.1);
    border: 1px solid rgba(22, 163, 74, 0.2);
  }

  .pill.level-medium {
    color: #ca8a04;
    background: rgba(202, 138, 4, 0.1);
    border: 1px solid rgba(202, 138, 4, 0.2);
  }

  .pill.level-hard {
    color: #dc2626;
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.2);
  }

  .pill.dim {
    color: #57534e;
    background: rgba(87, 83, 78, 0.08);
    border: 1px solid rgba(87, 83, 78, 0.15);
  }

  .pill.lattice {
    color: #0891b2;
    background: rgba(8, 145, 178, 0.08);
    border: 1px solid rgba(8, 145, 178, 0.18);
  }

  .pill.radius {
    color: #78716c;
    background: rgba(120, 113, 108, 0.08);
    border: 1px solid rgba(120, 113, 108, 0.15);
  }
</style>
