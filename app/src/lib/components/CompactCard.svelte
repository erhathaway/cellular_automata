<script lang="ts">
  let {
    item,
    onclick
  }: {
    item: any;
    onclick?: (item: any) => void;
  } = $props();

  function displayTitle() {
    if (item.title) return item.title;
    return `${item.ruleDefinition} (${item.dimension}D)`;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
  onclick={() => onclick?.(item)}
>
  <!-- Thumbnail -->
  <div class="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/10">
    {#if item.thumbnail}
      <img src={item.thumbnail} alt={displayTitle()} class="h-full w-full object-cover" />
    {:else}
      <div class="flex h-full w-full items-center justify-center text-white/20">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Info -->
  <div class="min-w-0 flex-1">
    <p class="truncate text-xs font-medium text-white/90">{displayTitle()}</p>
    <div class="flex items-center gap-2 text-[10px] text-white/50">
      <span>{item.ruleDefinition}</span>
      <span class="flex items-center gap-0.5">
        <svg class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        {item.likeCount ?? 0}
      </span>
    </div>
  </div>
</div>
