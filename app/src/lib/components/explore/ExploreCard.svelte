<script lang="ts">
  import { api } from '$lib/api';

  let {
    item,
    onload
  }: {
    item: any;
    onload?: (item: any) => void;
  } = $props();

  let isLiked = $state(item.isLikedByMe ?? false);
  let isBookmarked = $state(item.isBookmarkedByMe ?? false);
  let currentLikeCount = $state(item.likeCount ?? 0);

  function displayTitle() {
    if (item.title) return item.title;
    return `${item.ruleDefinition} (${item.dimension}D)`;
  }

  function entityTypeLabel() {
    return item.entityType === 'generation_run' ? 'Run' : 'Population';
  }

  async function toggleLike(e: MouseEvent) {
    e.stopPropagation();
    const body =
      item.entityType === 'generation_run'
        ? { generationRunId: item.id }
        : { cellPopulationId: item.id };
    if (isLiked) {
      // Optimistic update
      isLiked = false;
      currentLikeCount = Math.max(0, currentLikeCount - 1);
      try {
        await api('DELETE', '/api/likes', body);
      } catch {
        // Revert on failure
        isLiked = true;
        currentLikeCount++;
      }
    } else {
      isLiked = true;
      currentLikeCount++;
      try {
        await api('POST', '/api/likes', body);
      } catch (err: any) {
        if (err.message?.startsWith('409')) {
          // Already liked server-side — keep the UI liked
        } else {
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
        if (err.message?.startsWith('409')) {
          // Already bookmarked — keep it
        } else {
          isBookmarked = false;
        }
      }
    }
  }

  function handleClick() {
    onload?.(item);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
  onclick={handleClick}
>
  <!-- Thumbnail -->
  <div class="relative aspect-square w-full overflow-hidden bg-neutral-100">
    {#if item.thumbnail}
      <img src={item.thumbnail} alt={displayTitle()} class="h-full w-full object-cover" />
    {:else}
      <div class="flex h-full w-full items-center justify-center text-neutral-300">
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
    {/if}

    <!-- Type badge -->
    <span class="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
      {entityTypeLabel()}
    </span>

    <!-- Dimension badge -->
    <span class="absolute right-2 top-2 rounded-full bg-blue-600/80 px-2 py-0.5 text-[10px] font-medium text-white">
      {item.dimension}D
    </span>
  </div>

  <!-- Info -->
  <div class="p-3">
    <h3 class="truncate text-sm font-medium text-black">{displayTitle()}</h3>
    <p class="mt-0.5 text-xs text-neutral-500">{item.ruleDefinition}</p>

    <!-- Tags -->
    {#if item.tags?.length > 0}
      <div class="mt-2 flex flex-wrap gap-1">
        {#each item.tags.slice(0, 3) as t}
          <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
            {t.tagName}
          </span>
        {/each}
      </div>
    {/if}

    <!-- Bottom row: author + actions -->
    <div class="mt-2 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        {#if item.userImageUrl}
          <img src={item.userImageUrl} alt="" class="h-5 w-5 rounded-full" />
        {/if}
        <span class="text-xs text-neutral-500">{item.userName ?? 'Anonymous'}</span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Like -->
        <button
          class="flex items-center gap-0.5 text-xs {isLiked ? 'text-red-500' : 'text-neutral-400'} hover:text-red-500"
          onclick={toggleLike}
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          {currentLikeCount}
        </button>

        <!-- Bookmark -->
        <button
          class="text-xs {isBookmarked ? 'text-yellow-500' : 'text-neutral-400'} hover:text-yellow-500"
          onclick={toggleBookmark}
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
