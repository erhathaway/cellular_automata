<script lang="ts">
  import { getAvatarById } from '$lib/avatars';
  import type { MinerConfig } from '$lib/miner/types';
  import { renderMinerToDataURL } from '$lib/miner/renderer';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';
  import { timeAgo } from '$lib/utils/timeAgo';

  export type PopupData = {
    displayName?: string | null;
    claimCount: number;
    byRadius: Record<string, number>;
    byLattice: Record<string, number>;
    createdAt?: string | null;
  };

  let {
    avatarId = null,
    size = 32,
    fallbackInitials = '?',
    centered = false,
    minerConfig = null,
    cropUpper = false,
    userId = undefined,
    popupData = undefined
  }: {
    avatarId?: string | null;
    size?: number;
    fallbackInitials?: string;
    centered?: boolean;
    minerConfig?: string | MinerConfig | null;
    cropUpper?: boolean;
    userId?: string;
    popupData?: PopupData;
  } = $props();

  let avatar = $derived(avatarId && avatarId !== '__miner__' ? getAvatarById(avatarId) : undefined);

  let isMiner = $derived(avatarId === '__miner__' && minerConfig != null);

  let minerDataUrl = $derived.by(() => {
    if (!isMiner || !minerConfig) return '';
    try {
      const config: MinerConfig = typeof minerConfig === 'string' ? JSON.parse(minerConfig) : minerConfig;
      // Scale factor: size / 48 (canvas width), minimum 1
      const scale = Math.max(1, Math.ceil(size / 48));
      return renderMinerToDataURL(config, scale);
    } catch {
      return '';
    }
  });

  let viewBox = $derived.by(() => {
    if (!avatar || !centered) return '0 0 8 8';
    const grid = avatar.grid;
    let minX = 8, minY = 8, maxX = -1, maxY = -1;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return '0 0 8 8';
    const contentW = maxX - minX + 1;
    const contentH = maxY - minY + 1;
    const side = Math.max(contentW, contentH);
    const pad = 0.5;
    const cx = minX + contentW / 2;
    const cy = minY + contentH / 2;
    const half = side / 2 + pad;
    return `${cx - half} ${cy - half} ${half * 2} ${half * 2}`;
  });

  // ── Popup state ──
  const hasPopup = $derived(!!userId);
  let showPopup = $state(false);
  let popupX = $state(0);
  let popupY = $state(0);
  let flipBelow = $state(false);
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let containerEl: HTMLDivElement | undefined = $state();

  // Module-level cache for fetched stats
  const statsCache = new Map<string, PopupData>();

  let fetchedData: PopupData | null = $state(null);
  let fetching = $state(false);

  let activeData = $derived(popupData ?? fetchedData);

  function primaryLattice(byLattice: Record<string, number>): string {
    const entries = Object.entries(byLattice);
    if (entries.length === 0) return '';
    entries.sort((a, b) => b[1] - a[1]);
    const type = entries[0][0];
    return (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type;
  }

  function levelBreakdown(byRadius: Record<string, number>): { key: string; label: string; count: number; color: string }[] {
    const agg = aggregateByLevel(byRadius);
    const colors: Record<string, string> = { easy: '#4ade80', medium: '#fde047', hard: '#f87171' };
    return LEVELS.map(l => ({
      key: l.key,
      label: l.label,
      count: agg[l.key] ?? 0,
      color: colors[l.key] ?? '#a8a29e'
    })).filter(l => l.count > 0);
  }

  async function ensureData() {
    if (popupData || fetchedData || !userId) return;
    const cached = statsCache.get(userId);
    if (cached) {
      fetchedData = cached;
      return;
    }
    fetching = true;
    try {
      const res = await fetch(`/api/user/${userId}/stats`);
      if (res.ok) {
        const data = await res.json();
        const pd: PopupData = {
          displayName: data.displayName,
          claimCount: data.claimCount,
          byRadius: data.byRadius,
          byLattice: data.byLattice,
          createdAt: data.createdAt
        };
        statsCache.set(userId, pd);
        fetchedData = pd;
      }
    } catch {
      // silently fail
    } finally {
      fetching = false;
    }
  }

  function positionPopup() {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const POPUP_HEIGHT = 180;
    const GAP = 8;

    if (rect.top < POPUP_HEIGHT + GAP + 20) {
      // Flip below
      flipBelow = true;
      popupX = cx;
      popupY = rect.bottom + GAP;
    } else {
      flipBelow = false;
      popupX = cx;
      popupY = rect.top - GAP;
    }
  }

  function dismissPopup() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    if (showPopup) {
      showPopup = false;
      window.removeEventListener('scroll', onScroll, true);
    }
  }

  function onScroll() {
    dismissPopup();
  }

  function onMouseEnter() {
    if (!hasPopup) return;
    ensureData();
    hoverTimer = setTimeout(() => {
      positionPopup();
      showPopup = true;
      window.addEventListener('scroll', onScroll, true);
    }, 300);
  }

  function onMouseLeave() {
    dismissPopup();
  }

  // Full-size avatar for popup (no crop, larger)
  let popupMinerDataUrl = $derived.by(() => {
    if (!isMiner || !minerConfig) return '';
    try {
      const config: MinerConfig = typeof minerConfig === 'string' ? JSON.parse(minerConfig) : minerConfig;
      return renderMinerToDataURL(config, 3);
    } catch {
      return '';
    }
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="pixel-avatar-wrap"
  bind:this={containerEl}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  {#if isMiner && minerDataUrl && cropUpper}
    <div style="width: {size}px; height: {size}px; overflow: hidden; border-radius: 50%; flex-shrink: 0;">
      <img
        src={minerDataUrl}
        alt="Miner avatar"
        style="image-rendering: pixelated; width: 100%; height: auto; display: block;"
      />
    </div>
  {:else if isMiner && minerDataUrl}
    <img
      src={minerDataUrl}
      alt="Miner avatar"
      class="shrink-0"
      style="image-rendering: pixelated; object-fit: contain; height: {size}px; width: auto; display: block;"
    />
  {:else if avatar}
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      class="shrink-0"
      style="image-rendering: pixelated;"
    >
      {#each avatar.grid as row, y}
        {#each row as cell, x}
          {#if cell}
            <rect {x} {y} width="1" height="1" fill={avatar.color} />
          {/if}
        {/each}
      {/each}
    </svg>
  {:else}
    <div
      class="flex shrink-0 items-center justify-center rounded-full bg-neutral-200 font-semibold text-neutral-500"
      style="width: {size}px; height: {size}px; font-size: {Math.max(size * 0.4, 10)}px;"
    >
      {fallbackInitials.slice(0, 2).toUpperCase()}
    </div>
  {/if}

  {#if hasPopup && showPopup}
    <div
      class="avatar-popup"
      class:flip-below={flipBelow}
      style="left: {popupX}px; top: {popupY}px;"
    >
      <div class="popup-nails"><div class="popup-nail"></div><div class="popup-nail"></div></div>
      <div class="popup-nails popup-nails-bottom"><div class="popup-nail"></div><div class="popup-nail"></div></div>

      <!-- Avatar preview -->
      <div class="popup-avatar">
        {#if isMiner && popupMinerDataUrl}
          <img
            src={popupMinerDataUrl}
            alt="Avatar"
            style="image-rendering: pixelated; height: 120px; width: auto; display: block;"
          />
        {:else if avatar}
          <svg
            width="120"
            height="120"
            viewBox="0 0 8 8"
            style="image-rendering: pixelated;"
          >
            {#each avatar.grid as row, y}
              {#each row as cell, x}
                {#if cell}
                  <rect {x} {y} width="1" height="1" fill={avatar.color} />
                {/if}
              {/each}
            {/each}
          </svg>
        {:else}
          <div class="popup-avatar-fallback">
            {fallbackInitials.slice(0, 2).toUpperCase()}
          </div>
        {/if}
      </div>

      {#if fetching}
        <div class="popup-loading">Loading...</div>
      {:else if activeData}
        {#if activeData.displayName}
          <div class="popup-name">{activeData.displayName}</div>
        {/if}

        <div class="popup-claims">
          <svg class="popup-gem" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h12l4 6-10 13L2 9Z" />
            <path d="M11 3 8 9l4 13 4-13-3-6" />
            <path d="M2 9h20" />
          </svg>
          <span class="popup-claim-count">{activeData.claimCount}</span>
          <span class="popup-claim-label">claims</span>
        </div>

        {#if levelBreakdown(activeData.byRadius).length > 0}
          <div class="popup-levels">
            {#each levelBreakdown(activeData.byRadius) as lb (lb.key)}
              <span class="popup-level-chip" style="color: {lb.color};">{lb.label} {lb.count}</span>
            {/each}
          </div>
        {/if}

        {@const topLat = primaryLattice(activeData.byLattice)}
        {#if topLat}
          <div class="popup-lattice">{topLat}</div>
        {/if}

        {#if activeData.createdAt}
          <div class="popup-joined">Joined {timeAgo(activeData.createdAt)}</div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .pixel-avatar-wrap {
    display: inline-flex;
    position: relative;
  }

  .avatar-popup {
    position: fixed;
    transform: translate(-50%, -100%);
    z-index: 1000;
    background: #1c1917;
    border: 1px solid #44403c;
    border-radius: 8px;
    padding: 16px 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 160px;
    max-width: 220px;
    animation: popup-fade-in 0.15s ease;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  /* Invisible bridge toward the avatar so mouse can traverse the gap */
  .avatar-popup::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -16px;
    height: 16px;
  }

  .avatar-popup.flip-below {
    transform: translate(-50%, 0);
  }

  .avatar-popup.flip-below::after {
    bottom: auto;
    top: -16px;
  }

  @keyframes popup-fade-in {
    from { opacity: 0; transform: translate(-50%, -100%) translateY(4px); }
    to { opacity: 1; transform: translate(-50%, -100%) translateY(0); }
  }

  .flip-below {
    animation-name: popup-fade-in-below;
  }

  @keyframes popup-fade-in-below {
    from { opacity: 0; transform: translate(-50%, 0) translateY(-4px); }
    to { opacity: 1; transform: translate(-50%, 0) translateY(0); }
  }

  .popup-nails {
    position: absolute;
    top: 6px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .popup-nails-bottom {
    top: auto;
    bottom: 6px;
  }

  .popup-nail {
    width: 3px;
    height: 3px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  .popup-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-avatar-fallback {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #292524;
    font-family: 'Space Mono', monospace;
    font-size: 24px;
    font-weight: 700;
    color: #78716c;
  }

  .popup-loading {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #78716c;
  }

  .popup-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #d6d3d1;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .popup-claims {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .popup-gem {
    flex-shrink: 0;
  }

  .popup-claim-count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #fef08a;
    line-height: 1;
  }

  .popup-claim-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
  }

  .popup-levels {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .popup-level-chip {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
  }

  .popup-lattice {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    color: #a8a29e;
  }

  .popup-joined {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #57534e;
  }
</style>
