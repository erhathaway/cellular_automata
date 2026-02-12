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
<div class="containment-unit" onclick={() => onclick?.(item)}>
  <!-- Corner electrodes -->
  <span class="electrode tl"></span>
  <span class="electrode tr"></span>
  <span class="electrode bl"></span>
  <span class="electrode br"></span>

  <!-- Thumbnail -->
  <div class="thumb-wrapper">
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

    <!-- Inner shadow -->
    <div class="inner-shadow"></div>

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

  <!-- Line 1: rule info + like -->
  <div class="info-row">
    <p class="rule-text">
      {displayTitle()}{#if (item.neighborhoodRadius ?? 1) > 1}{' '}· r={item.neighborhoodRadius} ({neighborCount(item.dimension, item.neighborhoodRadius)}n){/if}
    </p>
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

  <!-- Line 2: user + time -->
  <div class="meta-row">
    <PixelAvatar avatarId={item.userAvatarId} size={16} fallbackInitials={(item.userName ?? 'A')[0]} />
    <p class="username">{item.userName ?? 'Anonymous'}</p>
    {#if item.createdAt}
      <span class="time-ago">· {timeAgo(item.createdAt)}</span>
    {/if}
  </div>
</div>

<style>
  .containment-unit {
    position: relative;
    padding: 8px;
    border: 2px solid #292524;
    border-radius: 8px;
    cursor: pointer;
    background: white;
    transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
    animation: containment-pulse 3s ease-in-out infinite;
  }

  .containment-unit:hover {
    border-color: #44403c;
    background-color: #fefce8;
    animation: none;
    box-shadow:
      0 0 8px rgba(250, 204, 21, 0.3),
      0 0 20px rgba(250, 204, 21, 0.15);
  }

  @keyframes containment-pulse {
    0%, 100% {
      box-shadow: 0 0 4px rgba(250, 204, 21, 0.08), 0 0 12px rgba(250, 204, 21, 0.04);
    }
    50% {
      box-shadow: 0 0 6px rgba(250, 204, 21, 0.18), 0 0 16px rgba(250, 204, 21, 0.08);
    }
  }

  /* Corner electrodes */
  .electrode {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #78716c;
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(0, 0, 0, 0.3),
      0 0 3px rgba(250, 204, 21, 0.2);
    z-index: 2;
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }

  .containment-unit:hover .electrode {
    background: #facc15;
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 0 6px rgba(250, 204, 21, 0.6);
  }

  .electrode.tl { top: -3px; left: -3px; }
  .electrode.tr { top: -3px; right: -3px; }
  .electrode.bl { bottom: -3px; left: -3px; }
  .electrode.br { bottom: -3px; right: -3px; }

  /* Thumbnail */
  .thumb-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 4px;
    background: #f5f5f4;
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
      rgba(41, 37, 36, 0.04) 3px,
      rgba(41, 37, 36, 0.04) 4px
    );
    transition: opacity 0.3s ease;
    opacity: 0.6;
  }

  .containment-unit:hover .scanlines {
    opacity: 1;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(250, 204, 21, 0.06) 3px,
      rgba(250, 204, 21, 0.06) 4px
    );
  }

  .inner-shadow {
    position: absolute;
    inset: 0;
    border-radius: 4px;
    pointer-events: none;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.15);
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

  .containment-unit:hover .bookmark-btn {
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
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
  }

  .rule-text {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #57534e;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.02em;
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

  /* Meta row */
  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .username {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #78716c;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .time-ago {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #a8a29e;
    flex-shrink: 0;
  }
</style>
