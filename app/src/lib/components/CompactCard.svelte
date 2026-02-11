<script lang="ts">
  import { api } from '$lib/api';
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

  let isLiked = $state(item.isLikedByMe ?? false);
  let isBookmarked = $state(item.isBookmarkedByMe ?? false);
  let currentLikeCount = $state(item.likeCount ?? 0);

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
<div
  class="group cursor-pointer rounded-lg px-2 py-2 transition-colors hover:bg-neutral-100"
  onclick={() => onclick?.(item)}
>
  <!-- Thumbnail -->
  <div class="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
    {#if item.thumbnail}
      <img src={item.thumbnail} alt={displayTitle()} class="h-full w-full object-cover" />
    {:else}
      <div class="flex h-full w-full items-center justify-center text-neutral-300">
        <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
    {/if}

    <!-- Inner shadow overlay -->
    <div class="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.15)]"></div>

    {#if interactive}
      <!-- Bookmark overlay -->
      <button
        class="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 {isBookmarked ? 'bg-orange-500/80 text-white opacity-100' : 'bg-white/40 text-white hover:bg-white/60'}"
        onclick={toggleBookmark}
        aria-label={isBookmarked ? 'Remove from chest' : 'Add to chest'}
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
          <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
          <line x1="4" y1="13" x2="20" y2="13" />
          <rect x="10" y="11" width="4" height="4" rx="1" />
        </svg>
      </button>
    {/if}
  </div>

  <!-- Line 1: title / rule info + like count -->
  <div class="mt-2 flex items-center justify-between gap-2">
    <p class="truncate text-xs text-neutral-400">
      {displayTitle()}{#if (item.neighborhoodRadius ?? 1) > 1}{' '}· r={item.neighborhoodRadius} ({neighborCount(item.dimension, item.neighborhoodRadius)}n){/if}
    </p>
    {#if interactive}
      <button
        class="flex shrink-0 items-center gap-1 text-sm transition-colors {isLiked ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'}"
        onclick={toggleLike}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        {currentLikeCount}
      </button>
    {:else}
      <span class="flex shrink-0 items-center gap-1 text-sm text-neutral-500">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        {item.likeCount ?? 0}
      </span>
    {/if}
  </div>

  <!-- Line 2: founder -->
  <div class="mt-0.5 flex items-center gap-1.5">
    <PixelAvatar avatarId={item.userAvatarId} size={16} fallbackInitials={(item.userName ?? 'A')[0]} />
    <p class="truncate text-sm text-neutral-500">{item.userName ?? 'Anonymous'}</p>
  </div>
</div>
