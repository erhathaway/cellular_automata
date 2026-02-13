<script lang="ts">
  import { api } from '$lib/api';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { buildURLParams } from '$lib/stores/persistence';

  let {
    entityType = '',
    entityId = '',
    isLikedByMe = false,
    isBookmarkedByMe = false,
    likeCount = 0,
    bookmarkCount = 0,
    copyUrl = '',
    compact = false,
    showLabels = true,
    loading = false,
    vertical = false,
    onlikechange,
    onbookmarkchange,
  }: {
    entityType?: string;
    entityId?: string;
    isLikedByMe?: boolean;
    isBookmarkedByMe?: boolean;
    likeCount?: number;
    bookmarkCount?: number;
    copyUrl?: string;
    compact?: boolean;
    showLabels?: boolean;
    loading?: boolean;
    vertical?: boolean;
    onlikechange?: (liked: boolean) => void;
    onbookmarkchange?: (bookmarked: boolean) => void;
  } = $props();

  let ready = $derived(!!entityType && !!entityId);

  // svelte-ignore state_referenced_locally
  let liked = $state(isLikedByMe);
  // svelte-ignore state_referenced_locally
  let bookmarked = $state(isBookmarkedByMe);
  // svelte-ignore state_referenced_locally
  let currentLikeCount = $state(likeCount);
  let likeAnimating = $state(false);
  let bookmarkAnimating = $state(false);
  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  function entityBody() {
    return entityType === 'generation_run'
      ? { generationRunId: entityId }
      : { cellPopulationId: entityId };
  }

  async function toggleLike(e: MouseEvent) {
    e.stopPropagation();
    if (!ready) return;
    const body = entityBody();
    if (liked) {
      liked = false;
      currentLikeCount = Math.max(0, currentLikeCount - 1);
      onlikechange?.(false);
      try {
        await api('DELETE', '/api/likes', body);
      } catch {
        liked = true;
        currentLikeCount++;
        onlikechange?.(true);
      }
    } else {
      liked = true;
      currentLikeCount++;
      likeAnimating = true;
      onlikechange?.(true);
      setTimeout(() => { likeAnimating = false; }, 500);
      try {
        await api('POST', '/api/likes', body);
      } catch (err: any) {
        if (!err.message?.startsWith('409')) {
          liked = false;
          currentLikeCount = Math.max(0, currentLikeCount - 1);
          onlikechange?.(false);
        }
      }
    }
  }

  async function toggleBookmark(e: MouseEvent) {
    e.stopPropagation();
    if (!ready) return;
    const body = entityBody();
    if (bookmarked) {
      bookmarked = false;
      bookmarkAnimating = true;
      onbookmarkchange?.(false);
      setTimeout(() => { bookmarkAnimating = false; }, 500);
      try {
        await api('DELETE', '/api/bookmarks', body);
      } catch {
        bookmarked = true;
        onbookmarkchange?.(true);
      }
    } else {
      bookmarked = true;
      bookmarkAnimating = true;
      onbookmarkchange?.(true);
      setTimeout(() => { bookmarkAnimating = false; }, 500);
      try {
        await api('POST', '/api/bookmarks', body);
      } catch (err: any) {
        if (!err.message?.startsWith('409')) {
          bookmarked = false;
          onbookmarkchange?.(false);
        }
      }
    }
  }

  function buildCurrentUrl(): string {
    if (typeof window === 'undefined') return '';
    // On /mine, build URL fresh from the store to avoid debounce staleness
    if (window.location.pathname === '/mine') {
      const dim = automataStore.dimension;
      const viewer = automataStore.viewer;
      const allCombos = automataStore.getAllComboSettings();
      const settings = allCombos[`${dim}-${viewer}`];
      if (settings) {
        const params = buildURLParams(dim, viewer, settings, automataStore.totalGenerations, automataStore.generationRunId);
        return `${window.location.origin}/mine?${params.toString()}`;
      }
    }
    return window.location.href;
  }

  async function copyLink(e: MouseEvent) {
    e.stopPropagation();
    const url = copyUrl || buildCurrentUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => { copied = false; }, 1500);
    } catch {
      // fallback
    }
  }
</script>

<div class="action-buttons" class:compact class:vertical>
  {#if vertical}
    <!-- Vertical order: Bookmark, Like, Link -->

    <!-- Bookmark -->
    <div class="action-col" class:has-tooltip={!ready && !loading}>
      <button
        class="action-btn {bookmarked ? 'active' : ''} {bookmarkAnimating ? 'action-pop' : ''}"
        class:checking={loading}
        class:unavailable={!ready && !loading}
        aria-label={bookmarked ? 'Remove from chest' : 'Add to chest'}
        onclick={toggleBookmark}
        disabled={!ready}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if loading}
          <svg class="action-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        {/if}
      </button>
    </div>

    <!-- Like -->
    <div class="action-col" class:has-tooltip={!ready && !loading}>
      <button
        class="action-btn {liked ? 'active' : ''} {likeAnimating ? 'action-pop' : ''}"
        class:checking={loading}
        class:unavailable={!ready && !loading}
        aria-label={liked ? 'Unlike' : 'Like'}
        onclick={toggleLike}
        disabled={!ready}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if loading}
          <svg class="action-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        {/if}
      </button>
    </div>

    <!-- Copy link -->
    {#if copyUrl}
      <div class="action-col">
        <button
          class="action-btn {copied ? 'active' : ''} {copied ? 'action-pop' : ''}"
          aria-label="Copy link"
          onclick={copyLink}
        >
          <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
          <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
          {#if copied}
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          {:else}
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          {/if}
        </button>
      </div>
    {/if}

    <!-- GIF Studio -->
    <div class="action-col">
      <button class="action-btn" aria-label="GIF Studio" onclick={(e) => { e.stopPropagation(); automataStore.gifStudioOpen = true; }}>
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      </button>
    </div>

  {:else}
    <!-- Horizontal order: Link, Like, Bookmark -->

    <!-- Copy link -->
    {#if copyUrl}
      <div class="action-col">
        <button
          class="action-btn {copied ? 'active' : ''} {copied ? 'action-pop' : ''}"
          aria-label="Copy link"
          onclick={copyLink}
        >
          <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
          <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
          {#if copied}
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          {:else}
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          {/if}
        </button>
        {#if showLabels}
          <span class="action-label">{copied ? 'Copied!' : 'Link'}</span>
        {/if}
      </div>
    {/if}

    <!-- Like -->
    <div class="action-col" class:has-tooltip={!ready && !loading}>
      <button
        class="action-btn {liked ? 'active' : ''} {likeAnimating ? 'action-pop' : ''}"
        class:checking={loading}
        class:unavailable={!ready && !loading}
        aria-label={liked ? 'Unlike' : 'Like'}
        onclick={toggleLike}
        disabled={!ready}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if loading}
          <svg class="action-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        {/if}
      </button>
      {#if !ready && !loading}
        <span class="tooltip">Claim this automata first</span>
      {/if}
      {#if showLabels}
        <span class="action-label">{currentLikeCount || ''}</span>
      {/if}
    </div>

    <!-- Bookmark -->
    <div class="action-col" class:has-tooltip={!ready && !loading}>
      <button
        class="action-btn {bookmarked ? 'active' : ''} {bookmarkAnimating ? 'action-pop' : ''}"
        class:checking={loading}
        class:unavailable={!ready && !loading}
        aria-label={bookmarked ? 'Remove from chest' : 'Add to chest'}
        onclick={toggleBookmark}
        disabled={!ready}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if loading}
          <svg class="action-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        {/if}
      </button>
      {#if !ready && !loading}
        <span class="tooltip">Claim this automata first</span>
      {/if}
      {#if showLabels}
        <span class="action-label">{bookmarkCount || ''}</span>
      {/if}
    </div>

    <!-- GIF Studio -->
    <div class="action-col">
      <button class="action-btn" aria-label="GIF Studio" onclick={(e) => { e.stopPropagation(); automataStore.gifStudioOpen = true; }}>
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      </button>
      {#if showLabels}
        <span class="action-label">GIF</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .action-buttons {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    gap: 10px;
  }

  .action-buttons.compact {
    gap: 6px;
  }

  .action-buttons.vertical {
    flex-direction: column;
  }

  .action-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 2px solid #44403c;
    border-radius: 6px;
    color: #a8a29e;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background-color 0.15s;
  }

  .compact .action-btn {
    width: 42px;
    height: 42px;
    border-radius: 5px;
  }

  .action-btn:hover {
    border-color: #78716c;
    color: #fafaf9;
    background-color: #292524;
  }

  .action-btn.active {
    border-color: #facc15;
    color: #facc15;
  }

  .compact .action-btn.active {
    border-color: #44403c;
  }

  .compact .action-btn.active:hover {
    border-color: #facc15;
  }

  .action-btn.active:hover {
    border-color: #facc15;
    color: #facc15;
    background-color: #292524;
  }

  .action-btn.checking {
    color: #57534e;
    cursor: default;
  }

  .action-btn.checking:hover {
    border-color: #44403c;
    color: #57534e;
    background-color: #1c1917;
  }

  .action-btn.unavailable {
    color: #44403c;
    cursor: default;
    opacity: 0.5;
  }

  .action-btn.unavailable:hover {
    border-color: #44403c;
    color: #44403c;
    background-color: #1c1917;
  }

  .btn-nails {
    position: absolute;
    top: 3px;
    left: 5px;
    right: 5px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .btn-nails-bottom {
    top: auto;
    bottom: 3px;
  }

  .btn-nail {
    width: 4px;
    height: 4px;
    background: #57534e;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5);
  }

  .action-icon {
    width: 20px;
    height: 20px;
    transition: width 0.15s, height 0.15s;
  }

  .compact .action-icon {
    width: 18px;
    height: 18px;
  }

  .action-icon.spin {
    width: 16px;
    height: 16px;
    animation: spinner 1s linear infinite;
  }

  .compact .action-icon.spin {
    width: 14px;
    height: 14px;
  }

  .compact .btn-nails {
    top: 2px;
    left: 3px;
    right: 3px;
  }

  .compact .btn-nails-bottom {
    bottom: 2px;
  }

  .compact .btn-nail {
    width: 3px;
    height: 3px;
  }

  .action-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 400;
    color: #78716c;
    min-height: 14px;
  }

  /* Tooltip */
  .has-tooltip {
    position: relative;
  }

  .tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #fef3c7;
    background: #292524;
    border: 1px solid #44403c;
    border-radius: 4px;
    padding: 5px 10px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #44403c;
  }

  .has-tooltip:hover .tooltip {
    opacity: 1;
  }

  @keyframes pop {
    0% { transform: scale(1); }
    30% { transform: scale(1.2); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  :global(.action-pop) {
    animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 999px) {
    .action-buttons {
      gap: 6px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 5px;
    }

    .btn-nails {
      top: 2px;
      left: 3px;
      right: 3px;
    }

    .btn-nails-bottom {
      bottom: 2px;
    }

    .btn-nail {
      width: 3px;
      height: 3px;
    }

    .action-icon {
      width: 16px;
      height: 16px;
    }

  }
</style>
