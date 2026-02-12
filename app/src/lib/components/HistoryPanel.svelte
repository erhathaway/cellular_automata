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

<div class="panel">
  <!-- Header -->
  <div class="panel-header">
    <div class="header-label">
      <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12,7 12,12 15.5,14" />
      </svg>
      <h2 class="header-title">History</h2>
    </div>
    {#if historyStore.entries.length > 0}
      <button
        class="clear-btn"
        onclick={() => historyStore.clearHistory()}
      >
        Clear
      </button>
    {/if}
  </div>

  <!-- Entries -->
  <div class="panel-body">
    {#if historyStore.entries.length === 0}
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12,7 12,12 15.5,14" />
        </svg>
        <p>No history yet</p>
        <p class="empty-sub">Changes will appear here as you explore.</p>
      </div>
    {:else}
      <div class="entry-list">
        {#each historyStore.entries as entry (entry.id)}
          <button
            class="entry"
            onclick={() => onload(entry)}
          >
            <div class="entry-thumb">
              {#if entry.thumbnail}
                <img src={entry.thumbnail} alt="" class="thumb-img" />
              {:else}
                <div class="thumb-fallback">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
              {/if}
              <div class="thumb-scanlines"></div>
            </div>
            <div class="entry-info">
              <div class="entry-top">
                <span class="rule-chip">{ruleLabel(entry)}</span>
                <span class="dim-chip">{dimLabel(entry)}</span>
              </div>
              <div class="entry-meta">
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

<style>
  .panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1c1917;
    color: #d6d3d1;
  }

  /* ── Header ── */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #292524;
    background: linear-gradient(180deg, #292524 0%, #1c1917 100%);
  }

  .header-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-icon {
    width: 16px;
    height: 16px;
    color: #facc15;
    stroke: #facc15;
    flex-shrink: 0;
  }

  .header-title {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #facc15;
    margin: 0;
  }

  .clear-btn {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #57534e;
    background: none;
    border: 1px solid #44403c;
    border-radius: 4px;
    padding: 3px 8px;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }

  .clear-btn:hover {
    color: #fca5a5;
    border-color: #7f1d1d;
    background: rgba(127, 29, 29, 0.15);
  }

  /* ── Body ── */
  .panel-body {
    flex: 1;
    overflow-y: auto;
  }

  .panel-body::-webkit-scrollbar {
    width: 6px;
  }

  .panel-body::-webkit-scrollbar-track {
    background: #1c1917;
  }

  .panel-body::-webkit-scrollbar-thumb {
    background: #44403c;
    border-radius: 3px;
  }

  .panel-body::-webkit-scrollbar-thumb:hover {
    background: #57534e;
  }

  /* ── Empty state ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 24px;
    text-align: center;
  }

  .empty-icon {
    width: 32px;
    height: 32px;
    color: #44403c;
    margin-bottom: 12px;
  }

  .empty-state p {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #57534e;
    margin: 0;
  }

  .empty-sub {
    font-weight: 400 !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 12px !important;
    color: #44403c !important;
    margin-top: 6px !important;
  }

  /* ── Entry list ── */
  .entry-list {
    display: flex;
    flex-direction: column;
  }

  .entry {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 1px solid #292524;
    transition: background 0.15s ease;
    width: 100%;
  }

  .entry:hover {
    background: #292524;
  }

  /* ── Thumbnail ── */
  .entry-thumb {
    position: relative;
    width: 140px;
    height: 140px;
    flex-shrink: 0;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #44403c;
    background: #111111;
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
    color: #44403c;
  }

  .thumb-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(250, 204, 21, 0.03) 3px,
      rgba(250, 204, 21, 0.03) 4px
    );
  }

  /* ── Entry info ── */
  .entry-info {
    min-width: 0;
    flex: 1;
  }

  .entry-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .rule-chip {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #facc15;
    background: #000000;
    border: 1px solid #44403c;
    border-radius: 4px;
    padding: 2px 7px;
    box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.08);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
    line-height: 1.2;
  }

  .dim-chip {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #a8a29e;
    background: #292524;
    border-radius: 3px;
    padding: 2px 5px;
    flex-shrink: 0;
    line-height: 1.2;
  }

  .entry-meta {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #57534e;
    margin-top: 4px;
    letter-spacing: 0.02em;
  }

  .entry:hover .rule-chip {
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.15);
  }

  .entry:hover .entry-meta {
    color: #78716c;
  }
</style>
