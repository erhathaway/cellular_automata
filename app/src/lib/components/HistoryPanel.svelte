<script lang="ts">
  import { historyStore, type HistoryEntry } from '$lib/stores/history.svelte';

  let {
    onload,
  }: {
    onload: (entry: HistoryEntry) => void;
  } = $props();

  function ruleLabel(entry: HistoryEntry): string {
    if (entry.ruleType === 'wolfram') {
      return `Rule ${entry.ruleDefinition.slice(1)}`;
    }
    // Conway: "B3/S2,3"
    const match = entry.ruleDefinition.match(/^B([0-9,]*)S([0-9,]*)$/);
    if (match) {
      return `B${match[1]}/S${match[2]}`;
    }
    return entry.ruleDefinition;
  }

  function dimLabel(entry: HistoryEntry): string {
    return `${entry.dimension}D`;
  }

  function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
    <h2 class="text-sm font-semibold text-neutral-700">History</h2>
    {#if historyStore.entries.length > 0}
      <button
        class="text-xs text-neutral-400 hover:text-red-500 transition-colors"
        onclick={() => historyStore.clearHistory()}
      >
        Clear
      </button>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if historyStore.entries.length === 0}
      <div class="px-4 py-8 text-center text-xs text-neutral-400">
        No history yet. Changes will appear here as you explore.
      </div>
    {:else}
      <div class="flex flex-col">
        {#each historyStore.entries as entry (entry.id)}
          <button
            class="flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 border-b border-neutral-100"
            onclick={() => onload(entry)}
          >
            {#if entry.thumbnail}
              <img
                src={entry.thumbnail}
                alt=""
                class="mt-0.5 h-10 w-14 shrink-0 rounded border border-neutral-200 object-cover"
              />
            {:else}
              <div class="mt-0.5 flex h-10 w-14 shrink-0 items-center justify-center rounded border border-neutral-200 bg-neutral-50">
                <svg class="h-4 w-4 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            {/if}
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-medium text-neutral-800 truncate">
                  {ruleLabel(entry)}
                </span>
                <span class="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                  {dimLabel(entry)}
                </span>
              </div>
              <div class="mt-0.5 text-[11px] text-neutral-400">
                {timeAgo(entry.timestamp)}
                {#if entry.neighborhoodRadius > 1}
                  &middot; r={entry.neighborhoodRadius}
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
