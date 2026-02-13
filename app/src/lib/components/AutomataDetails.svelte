<script lang="ts">
  import { timeAgo } from '$lib/utils/timeAgo';
  import { radiusToLevel } from '$lib/levels';
  import { getLattice, defaultLattice } from '$lib-core';
  import type { LatticeType } from '$lib-core';
  import { migrateCellStatesData } from '$lib/stores/persistence';
  import PixelAvatar from './PixelAvatar.svelte';

  let {
    item,
    hideOwner = false,
    fullRules = [],
  }: {
    item: any;
    hideOwner?: boolean;
    fullRules?: Array<{ label: string; born: number[]; survive: number[] }>;
  } = $props();

  let expanded = $state(false);

  function parseNums(s: string): string[] {
    if (!s) return [];
    return s.includes(',') ? s.split(',') : s.split('');
  }

  function truncateNums(s: string, max: number): string {
    const nums = parseNums(s);
    if (nums.length === 0) return '';
    if (nums.length <= max) return nums.join(',');
    return nums.slice(0, max).join(',') + '…';
  }

  function getRuleCounts(rule: string): { born: number; survive: number } | null {
    const match = rule.match(/^B([0-9,]*)S([0-9,]*)$/);
    if (!match) return null;
    return { born: parseNums(match[1]).length, survive: parseNums(match[2]).length };
  }

  let counts = $derived(getRuleCounts(item.ruleDefinition));

  interface HSLColor { h: number; s: number; l: number; a: number }

  function parseCellStatesData() {
    const raw = item.cellStates;
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return migrateCellStatesData(parsed);
  }

  interface LabeledColor {
    label: string;
    color: HSLColor;
  }

  let labeledColors = $derived.by((): LabeledColor[] => {
    const data = parseCellStatesData();
    if (!data) return [];

    const result: LabeledColor[] = [];

    // Alive states first
    for (const s of data.states) {
      if (s.role !== 'dead') {
        result.push({ label: s.role, color: s.color });
      }
    }

    // Dead state
    const deadState = data.states.find(s => s.role === 'dead');
    if (deadState) {
      result.push({ label: 'dead', color: deadState.color });
    }

    // Trail from trail config (not applicable to 1D)
    const dim = item.dimension ?? 2;
    if (dim > 1) {
      result.push({ label: 'trail', color: data.trail.color });
    }

    return result;
  });

  function hslToCSS(c: HSLColor): string {
    return `hsla(${c.h}, ${Math.round(c.s * 100)}%, ${Math.round(c.l * 100)}%, ${c.a})`;
  }

  function parsedRule(rule: string): { born: string; survive: string } | null {
    const match = rule.match(/^B([0-9,]*)S([0-9,]*)$/);
    if (!match) return null;
    return { born: truncateNums(match[1], 3), survive: truncateNums(match[2], 3) };
  }

  let parsed = $derived(parsedRule(item.ruleDefinition));

  function displayTitle() {
    if (item.title) return item.title;
    return null;
  }

  function levelLabel(): string {
    return radiusToLevel(item.neighborhoodRadius ?? 1);
  }

  function neighborCount(dim: number, radius: number): number {
    if (dim === 1) return 2;
    return (2 * radius + 1) ** dim - 1;
  }

  function latticeLabel(): string {
    const lat = item.latticeType as LatticeType | undefined | null;
    if (!lat) {
      const dim = (item.dimension ?? 2) as 2 | 3;
      return getLattice(defaultLattice(dim)).label;
    }
    try {
      return getLattice(lat).label;
    } catch {
      return lat;
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
    <div class="pills-row">
      <span class="pill level-{levelLabel()}">{levelLabel()}</span>
      <span class="pill dim">{item.dimension}D</span>
      <span class="pill lattice">{latticeLabel()}</span>
      <span class="pill neighbors">{neighborCount(item.dimension ?? 2, item.neighborhoodRadius ?? 1)} neighbors</span>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span class="pill more-toggle" onclick={() => expanded = !expanded}>{expanded ? '− Less' : '+ More'}</span>
    </div>
    {#if expanded}
      <div class="rule-row">
        <p class="rule-text">
          {#if displayTitle()}
            {displayTitle()}
          {:else if parsed}
            B<span class="eq">:</span>{parsed.born} <span class="eq">|</span> S<span class="eq">:</span>{parsed.survive}
          {:else}
            {item.ruleDefinition}
          {/if}
        </p>
        {#if counts}
          <span class="pill rule-count born"><span class="count-label">Count</span> B<span class="eq">=</span>{counts.born}</span>
          <span class="pill rule-count survive"><span class="count-label">Count</span> S<span class="eq">=</span>{counts.survive}</span>
        {/if}
      </div>
      <div class="pills-row">
        <span class="pill radius">r={item.neighborhoodRadius ?? 1}</span>
      </div>
      {#if labeledColors.length > 0}
        <div class="colors-row">
          {#each labeledColors as { label, color }}
            <span class="pill state-colors">
              <span class="swatch-label">{label}</span>
              <span class="color-swatch" style="background: {hslToCSS(color)};"></span>
            </span>
          {/each}
        </div>
      {/if}
    {/if}
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

  .rule-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    min-width: 0;
  }

  .rule-count {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 400;
    padding: 1px 5px;
  }

  .rule-count.born {
    color: #facc15;
    background: rgba(250, 204, 21, 0.1);
    border: 1px solid rgba(250, 204, 21, 0.2);
  }

  .count-label {
    font-size: 8px;
  }

  .eq {
    color: #78716c;
  }

  .rule-count.survive {
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.2);
  }

  .rule-text {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
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
    font-size: 12px;
    color: #78716c;
    flex-shrink: 0;
    padding-left: 6px;
  }

  /* ── Pills row ── */
  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }

  .colors-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }

  .pill {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 4px;
    padding: 2px 7px;
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

  .more-toggle {
    color: #78716c;
    background: rgba(120, 113, 108, 0.08);
    border: 1px solid rgba(120, 113, 108, 0.15);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .more-toggle:hover {
    color: #a8a29e;
    border-color: #a8a29e;
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

  .pill.neighbors {
    color: #78716c;
    background: rgba(120, 113, 108, 0.08);
    border: 1px solid rgba(120, 113, 108, 0.15);
  }

  .pill.state-colors {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    background: #292524;
    border: 1px solid rgba(120, 113, 108, 0.2);
  }

  .swatch-label {
    color: #78716c;
  }

  .color-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid #44403c;
    flex-shrink: 0;
    box-sizing: border-box;
  }
</style>
