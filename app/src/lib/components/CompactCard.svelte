<script lang="ts">
  import { api } from '$lib/api';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from './PixelAvatar.svelte';

  let {
    item,
    onclick,
    interactive = false
  }: {
    item: any;
    onclick?: (item: any) => void;
    interactive?: boolean;
  } = $props();

  // svelte-ignore state_referenced_locally
  let isLiked = $state(item.isLikedByMe ?? false);
  // svelte-ignore state_referenced_locally
  let isBookmarked = $state(item.isBookmarkedByMe ?? false);
  // svelte-ignore state_referenced_locally
  let currentLikeCount = $state(item.likeCount ?? 0);
  let thumbError = $state(false);

  let thumbnailUrl = $derived(item.thumbnail
    ? item.thumbnail
    : (item.entityType && item.id)
      ? `/api/thumbnail?type=${item.entityType}&id=${item.id}`
      : null);

  function neighborCount(dim: number, radius: number): number {
    if (dim === 1) return 2;
    return (2 * radius + 1) ** dim - 1;
  }

  function displayTitle() {
    if (item.title) return item.title;
    return `${item.ruleDefinition} (${item.dimension}D)`;
  }

  async function toggleLike(e: MouseEvent) {
    e.stopPropagation();
    const body =
      item.entityType === 'generation_run'
        ? { generationRunId: item.id }
        : { cellPopulationId: item.id };
    if (isLiked) {
      isLiked = false;
      currentLikeCount = Math.max(0, currentLikeCount - 1);
      try {
        await api('DELETE', '/api/likes', body);
      } catch {
        isLiked = true;
        currentLikeCount++;
      }
    } else {
      isLiked = true;
      currentLikeCount++;
      try {
        await api('POST', '/api/likes', body);
      } catch (err: any) {
        if (!err.message?.startsWith('409')) {
          isLiked = false;
          currentLikeCount = Math.max(0, currentLikeCount - 1);
        }
      }
    }
  }

  async function toggleBookmark(e: MouseEvent) {
    e.stopPropagation();
    const body =
      item.entityType === 'generation_run'
        ? { generationRunId: item.id }
        : { cellPopulationId: item.id };
    if (isBookmarked) {
      isBookmarked = false;
      try {
        await api('DELETE', '/api/bookmarks', body);
      } catch {
        isBookmarked = true;
      }
    } else {
      isBookmarked = true;
      try {
        await api('POST', '/api/bookmarks', body);
      } catch (err: any) {
        if (!err.message?.startsWith('409')) {
          isBookmarked = false;
        }
      }
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={() => onclick?.(item)}>
  <!-- Containment field — just the image -->
  <div class="containment-frame">
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

    <div class="thumb-inner">
      {#if thumbnailUrl && !thumbError}
        <img src={thumbnailUrl} alt={displayTitle()} class="thumb-img" loading="lazy" onerror={() => { thumbError = true; }} />
      {:else}
        <div class="thumb-fallback">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
      {/if}

      <!-- Scanline overlay -->
      <div class="scanlines"></div>

      {#if interactive}
        <button
          class="bookmark-btn {isBookmarked ? 'active' : ''}"
          onclick={toggleBookmark}
          aria-label={isBookmarked ? 'Remove from chest' : 'Add to chest'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
            <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
            <line x1="4" y1="13" x2="20" y2="13" />
            <rect x="10" y="11" width="4" height="4" rx="1" />
          </svg>
        </button>
      {/if}
    </div>

  </div>

  <div class="chip-stack">
    <div class="owner-avatar-label">
      <div class="owner-content">
        <div class="owner-avatar-wrap">
          <PixelAvatar avatarId={item.userAvatarId} size={56} fallbackInitials={(item.userName ?? 'A')[0]} />
        </div>
      </div>
    </div>
    <div class="chip-info">
      <p class="rule-text">
        {displayTitle()}{#if (item.neighborhoodRadius ?? 1) > 1}{' '}· r={item.neighborhoodRadius} ({neighborCount(item.dimension, item.neighborhoodRadius)}n){/if}
      </p>
      <div class="owner-meta">
        <p class="username-inline">{item.userName ?? 'Anonymous'}</p>
        {#if item.createdAt}
          <span class="time-ago">{timeAgo(item.createdAt)}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Clean metadata below -->
  <div class="info-row">
    {#if interactive}
      <button
        class="like-btn {isLiked ? 'liked' : ''}"
        onclick={toggleLike}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        {currentLikeCount}
      </button>
    {:else}
      <span class="like-static">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        {item.likeCount ?? 0}
      </span>
    {/if}
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
    background-color: #fafaf9;
  }

  /* Containment frame — no solid border, corners + electric edges */
  .containment-frame {
    position: relative;
    border-radius: 6px;
    overflow: visible;
    margin-bottom: 6px;
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
    border-top: 4px solid #1c1917;
    border-left: 4px solid #1c1917;
    border-top-left-radius: 4px;
  }

  .corner.tr {
    top: -1px;
    right: -1px;
    border-top: 4px solid #1c1917;
    border-right: 4px solid #1c1917;
    border-top-right-radius: 4px;
  }

  .corner.bl {
    bottom: -1px;
    left: -1px;
    border-bottom: 4px solid #1c1917;
    border-left: 4px solid #1c1917;
    border-bottom-left-radius: 4px;
  }

  .corner.br {
    bottom: -1px;
    right: -1px;
    border-bottom: 4px solid #1c1917;
    border-right: 4px solid #1c1917;
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
    border-top: 3px solid #ffffff;
    border-left: 3px solid #ffffff;
    border-top-left-radius: 2px;
  }

  .corner-inner.tr {
    top: 3px;
    right: 3px;
    border-top: 3px solid #ffffff;
    border-right: 3px solid #ffffff;
    border-top-right-radius: 2px;
  }

  .corner-inner.bl {
    bottom: 3px;
    left: 3px;
    border-bottom: 3px solid #ffffff;
    border-left: 3px solid #ffffff;
    border-bottom-left-radius: 2px;
  }

  .corner-inner.br {
    bottom: 3px;
    right: 3px;
    border-bottom: 3px solid #ffffff;
    border-right: 3px solid #ffffff;
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
    background: #f5f5f4;
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

  .bookmark-btn {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease, background 0.2s ease;
    background: rgba(255, 255, 255, 0.4);
    color: white;
    backdrop-filter: blur(8px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card:hover .bookmark-btn {
    opacity: 1;
  }

  .bookmark-btn.active {
    background: rgba(234, 88, 12, 0.8);
    color: white;
    opacity: 1;
  }

  .bookmark-btn:hover {
    background: rgba(255, 255, 255, 0.6);
  }

  .bookmark-btn.active:hover {
    background: rgba(234, 88, 12, 0.9);
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
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
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

  .owner-avatar-label {
    position: relative;
    width: 56px;
    height: 56px;
  }

  .owner-content {
    position: relative;
    z-index: 1;
  }

  .owner-avatar-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
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
    color: #111111;
    margin: 0;
    line-height: 1.2;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .like-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #78716c;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s ease;
  }

  .like-btn:hover {
    color: #facc15;
  }

  .like-btn.liked {
    color: #facc15;
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
    color: #111111;
    flex-shrink: 0;
  }
</style>
