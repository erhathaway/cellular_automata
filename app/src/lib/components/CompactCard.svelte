<script lang="ts">
  import AutomataDetails from './AutomataDetails.svelte';
  import ActionButtons from './ActionButtons.svelte';
  import LoadingIcon from './LoadingIcon.svelte';

  let {
    item,
    onclick,
    interactive = false,
    currentUserId = '',
    dense = false
  }: {
    item: any;
    onclick?: (item: any) => void;
    interactive?: boolean;
    currentUserId?: string;
    dense?: boolean;
  } = $props();

  let hideOwner = $derived(!!currentUserId && item.userId === currentUserId);
  let thumbError = $state(false);
  // svelte-ignore state_referenced_locally
  let isLiked = $state(item.isLikedByMe ?? false);
  // svelte-ignore state_referenced_locally
  let isBookmarked = $state(item.isBookmarkedByMe ?? false);

  let thumbnailUrl = $derived(item.thumbnail
    ? item.thumbnail
    : (item.entityType && item.id)
      ? `/api/thumbnail?type=${item.entityType}&id=${item.id}`
      : null);

  function displayTitle() {
    if (item.title) return item.title;
    return `${item.ruleDefinition} (${item.dimension}D)`;
  }

  function buildCopyUrl(): string {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams();
    params.set('d', String(item.dimension ?? 2));
    params.set('v', String(item.viewer ?? item.dimension ?? 2));
    params.set('r', item.ruleDefinition ?? '');
    if (item.neighborhoodRadius && item.neighborhoodRadius > 1) {
      params.set('nr', String(item.neighborhoodRadius));
    }
    if (item.latticeType) {
      params.set('lt', item.latticeType);
    }
    return `${window.location.origin}/?${params.toString()}`;
  }

  let copyUrl = $derived(buildCopyUrl());

  let deadBg = $derived.by(() => {
    try {
      const raw = typeof item.cellStates === 'string' ? JSON.parse(item.cellStates) : item.cellStates;
      const states = Array.isArray(raw) ? raw : raw?.states;
      const dead = states?.[0]?.color;
      if (dead) return `hsl(${dead.h}, ${dead.s * 100}%, ${dead.l * 100}%)`;
    } catch {}
    return '#0c0a09';
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" class:dense>
  <!-- Containment field — just the image -->
  <div class="containment-frame" onclick={() => onclick?.(item)}>
    <!-- Corner brackets: black outer + white inner -->
    <span class="corner tl"></span>
    <span class="corner tr"></span>
    <span class="corner bl"></span>
    <span class="corner br"></span>
    <span class="corner-inner tl"></span>
    <span class="corner-inner tr"></span>
    <span class="corner-inner bl"></span>
    <span class="corner-inner br"></span>

    <!-- Electric edges between corners -->
    <span class="edge top"></span>
    <span class="edge bottom"></span>
    <span class="edge left"></span>
    <span class="edge right"></span>

    <div class="thumb-inner" style:background={deadBg}>
      {#if thumbnailUrl && !thumbError}
        <img src={thumbnailUrl} alt={displayTitle()} class="thumb-img" class:dense loading="lazy" onerror={() => { thumbError = true; }} />
      {:else}
        <div class="thumb-fallback">
          <LoadingIcon size={40} mode="dark" />
        </div>
      {/if}

      <!-- Scanline overlay -->
      <div class="scanlines"></div>

      {#if interactive}
        <div class="hover-actions" class:always-visible={isLiked || isBookmarked}>
          <ActionButtons
            entityType={item.entityType}
            entityId={item.id}
            isLikedByMe={item.isLikedByMe ?? false}
            isBookmarkedByMe={item.isBookmarkedByMe ?? false}
            likeCount={item.likeCount ?? 0}
            {copyUrl}
            compact
            {dense}
            vertical
            showLabels={false}
            gifItem={item}
            onlikechange={(v) => { isLiked = v; }}
            onbookmarkchange={(v) => { isBookmarked = v; }}
          />
        </div>
      {/if}
    </div>

  </div>

  <div class="chip-stack">
    <AutomataDetails {item} {hideOwner} {dense} />
  </div>

  <div class="info-row">
    <span class="like-static">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
      </svg>
      {item.likeCount ?? 0}
    </span>
  </div>
</div>

<style>
  .card {
    padding: 6px 6px 8px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s ease;
  }

  .card:hover {
    background-color: transparent;
  }

  /* Containment frame — gallery picture frame */
  .containment-frame {
    position: relative;
    border-radius: 6px;
    overflow: visible;
    margin-bottom: 6px;
    padding: 10px;
    background: #1c1917;
    border: 1px solid #44403c;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  /* ── Corner brackets: thick black L-shapes ── */
  .corner {
    position: absolute;
    width: 16px;
    height: 16px;
    z-index: 3;
    pointer-events: none;
  }

  .corner.tl {
    top: -1px;
    left: -1px;
    border-top: 4px solid #facc15;
    border-left: 4px solid #facc15;
    border-top-left-radius: 4px;
  }

  .corner.tr {
    top: -1px;
    right: -1px;
    border-top: 4px solid #facc15;
    border-right: 4px solid #facc15;
    border-top-right-radius: 4px;
  }

  .corner.bl {
    bottom: -1px;
    left: -1px;
    border-bottom: 4px solid #facc15;
    border-left: 4px solid #facc15;
    border-bottom-left-radius: 4px;
  }

  .corner.br {
    bottom: -1px;
    right: -1px;
    border-bottom: 4px solid #facc15;
    border-right: 4px solid #facc15;
    border-bottom-right-radius: 4px;
  }

  /* ── White inner corner brackets ── */
  .corner-inner {
    position: absolute;
    width: 20px;
    height: 20px;
    z-index: 4;
    pointer-events: none;
  }

  .corner-inner.tl {
    top: 3px;
    left: 3px;
    border-top: 3px solid #1c1917;
    border-left: 3px solid #1c1917;
    border-top-left-radius: 2px;
  }

  .corner-inner.tr {
    top: 3px;
    right: 3px;
    border-top: 3px solid #1c1917;
    border-right: 3px solid #1c1917;
    border-top-right-radius: 2px;
  }

  .corner-inner.bl {
    bottom: 3px;
    left: 3px;
    border-bottom: 3px solid #1c1917;
    border-left: 3px solid #1c1917;
    border-bottom-left-radius: 2px;
  }

  .corner-inner.br {
    bottom: 3px;
    right: 3px;
    border-bottom: 3px solid #1c1917;
    border-right: 3px solid #1c1917;
    border-bottom-right-radius: 2px;
  }

  /* ── Electric edges between corners ── */
  .edge {
    position: absolute;
    z-index: 2;
    pointer-events: none;
  }

  .edge.top, .edge.bottom {
    left: 16px;
    right: 16px;
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      #facc15 0px,
      #facc15 3px,
      transparent 3px,
      transparent 7px
    );
    background-size: 14px 2px;
    animation: electric-h 0.6s linear infinite;
    opacity: 0.5;
    filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.4));
  }

  .edge.top { top: 0; }
  .edge.bottom { bottom: 0; }

  .edge.left, .edge.right {
    top: 16px;
    bottom: 16px;
    width: 2px;
    background: repeating-linear-gradient(
      180deg,
      #facc15 0px,
      #facc15 3px,
      transparent 3px,
      transparent 7px
    );
    background-size: 2px 14px;
    animation: electric-v 0.6s linear infinite;
    opacity: 0.5;
    filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.4));
  }

  .edge.left { left: 0; }
  .edge.right { right: 0; }

  .card:hover .edge {
    opacity: 0.85;
    filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.6));
  }

  @keyframes electric-h {
    0%   { background-position: 0 0; }
    100% { background-position: 14px 0; }
  }

  @keyframes electric-v {
    0%   { background-position: 0 0; }
    100% { background-position: 0 14px; }
  }

  /* Thumbnail */
  .thumb-inner {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: #0c0a09;
    border-radius: 4px;
    overflow: hidden;
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .thumb-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #d6d3d1;
  }

  .scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(41, 37, 36, 0.035) 3px,
      rgba(41, 37, 36, 0.035) 4px
    );
  }

  .hover-actions {
    position: absolute;
    top: 6px;
    right: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 5;
  }

  .card:hover .hover-actions,
  .hover-actions.always-visible {
    opacity: 1;
  }

  /* Hide inactive buttons when not hovering */
  .hover-actions :global(.action-col) {
    display: none;
  }

  .hover-actions :global(.action-col:has(.active)) {
    display: flex;
  }

  .card:hover .hover-actions :global(.action-col) {
    display: flex;
  }

  /* Info row */
  .info-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 0;
    padding: 0 2px;
  }

  .chip-stack {
    margin-top: 10px;
  }

  .like-static {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #78716c;
  }

  /* Dense mode */
  .card.dense {
    padding: 3px 3px 4px;
  }

  .card.dense .containment-frame {
    padding: 5px;
    margin-bottom: 3px;
  }

  .card.dense .corner {
    width: 10px;
    height: 10px;
  }

  .card.dense .corner.tl { border-width: 3px 0 0 3px; }
  .card.dense .corner.tr { border-width: 3px 3px 0 0; }
  .card.dense .corner.bl { border-width: 0 0 3px 3px; }
  .card.dense .corner.br { border-width: 0 3px 3px 0; }

  .card.dense .corner-inner {
    width: 14px;
    height: 14px;
  }

  .card.dense .corner-inner.tl { border-width: 2px 0 0 2px; }
  .card.dense .corner-inner.tr { border-width: 2px 2px 0 0; }
  .card.dense .corner-inner.bl { border-width: 0 0 2px 2px; }
  .card.dense .corner-inner.br { border-width: 0 2px 2px 0; }

  .card.dense .edge.top, .card.dense .edge.bottom {
    left: 10px;
    right: 10px;
  }

  .card.dense .edge.left, .card.dense .edge.right {
    top: 10px;
    bottom: 10px;
  }

  .thumb-img.dense {
    transform: scale(2);
  }

  .card.dense .chip-stack {
    margin-top: 4px;
  }

  .card.dense .info-row {
    gap: 4px;
  }

  .card.dense .like-static {
    font-size: 10px;
    gap: 2px;
  }

  .card.dense .like-static svg {
    width: 10px;
    height: 10px;
  }

  @media (max-width: 700px) {
    .hover-actions {
      opacity: 1;
    }

    .hover-actions :global(.action-col) {
      display: flex;
    }
  }

</style>
