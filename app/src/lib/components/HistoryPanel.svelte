<script lang="ts">
  import { historyStore, type HistoryEntry } from '$lib/stores/history.svelte';
  import { radiusToLevel } from '$lib/levels';
  import { getLattice, defaultLattice } from '$lib-core';
  import type { LatticeType } from '$lib-core';

  let {
    onload,
  }: {
    onload: (entry: HistoryEntry) => void;
  } = $props();

  function ruleLabel(entry: HistoryEntry): string {
    if (entry.ruleType === 'wolfram') {
      return `Rule ${entry.ruleDefinition.slice(1)}`;
    }
    const match = entry.ruleDefinition.match(/^B([0-9,]*)S([0-9,]*)$/);
    if (match) {
      return `B${match[1]}/S${match[2]}`;
    }
    return entry.ruleDefinition;
  }

  function dimLabel(entry: HistoryEntry): string {
    return `${entry.dimension}D`;
  }

  function levelLabel(entry: HistoryEntry): string {
    return radiusToLevel(entry.neighborhoodRadius);
  }

  function latticeLabel(entry: HistoryEntry): string | null {
    const lat = entry.lattice as LatticeType | undefined;
    if (!lat) return null;
    const dim = entry.dimension as 2 | 3;
    if (lat === defaultLattice(dim)) return null;
    try {
      return getLattice(lat).label;
    } catch {
      return null;
    }
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
        {#each historyStore.entries as entry, i (entry.id)}
          <button
            class="entry {(historyStore.cursorIndex === -1 ? i === 0 : historyStore.cursorIndex === i) ? 'active' : ''}"
            onclick={() => onload(entry)}
          >
            <div class="entry-thumb">
              {#if entry.thumbnail}
                <img src={entry.thumbnail} alt="" class="thumb-img" />
              {:else}
                <div class="thumb-fallback">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
              {/if}
              <div class="thumb-scanlines"></div>

              <!-- Status icons overlay -->
              {#if entry.claimed || entry.liked || entry.bookmarked}
                <div class="status-icons">
                  {#if entry.claimed}
                    <span class="status-icon claimed" title="Claimed">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 3h12l4 6-10 13L2 9Z" />
                      </svg>
                    </span>
                  {/if}
                  {#if entry.liked}
                    <span class="status-icon liked" title="Liked">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  {/if}
                  {#if entry.bookmarked}
                    <span class="status-icon bookmarked" title="In Chest">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
                        <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
                        <line x1="4" y1="13" x2="20" y2="13" />
                      </svg>
                    </span>
                  {/if}
                </div>
              {/if}
            </div>
            <div class="entry-info">
              <div class="entry-top">
                <span class="rule-chip">{ruleLabel(entry)}</span>
                <span class="dim-chip">{dimLabel(entry)}</span>
              </div>

              <!-- Pills row -->
              <div class="pills-row">
                <span class="pill level-{levelLabel(entry)}">{levelLabel(entry)}</span>
                {#if latticeLabel(entry)}
                  <span class="pill lattice">{latticeLabel(entry)}</span>
                {/if}
                {#if entry.neighborhoodRadius > 1}
                  <span class="pill radius">r={entry.neighborhoodRadius}</span>
                {/if}
              </div>

              <div class="entry-meta">
                {timeAgo(entry.timestamp)}
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

  .entry.active {
    background: rgba(250, 204, 21, 0.06);
    border-left: 2px solid #facc15;
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

  /* ── Status icons (overlay on thumbnail) ── */
  .status-icons {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    gap: 3px;
    pointer-events: none;
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    backdrop-filter: blur(6px);
  }

  .status-icon.claimed {
    background: rgba(250, 204, 21, 0.2);
    color: #facc15;
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
  }

  .status-icon.liked {
    background: rgba(251, 113, 133, 0.2);
    color: #fb7185;
    box-shadow: 0 0 6px rgba(251, 113, 133, 0.3);
  }

  .status-icon.bookmarked {
    background: rgba(234, 88, 12, 0.2);
    color: #f97316;
    box-shadow: 0 0 6px rgba(234, 88, 12, 0.3);
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

  /* ── Pills row ── */
  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  .pill {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 3px;
    padding: 2px 6px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .pill.level-easy {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.12);
    border: 1px solid rgba(74, 222, 128, 0.2);
  }

  .pill.level-medium {
    color: #facc15;
    background: rgba(250, 204, 21, 0.12);
    border: 1px solid rgba(250, 204, 21, 0.2);
  }

  .pill.level-hard {
    color: #f87171;
    background: rgba(248, 113, 113, 0.12);
    border: 1px solid rgba(248, 113, 113, 0.2);
  }

  .pill.lattice {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.10);
    border: 1px solid rgba(34, 211, 238, 0.2);
  }

  .pill.radius {
    color: #a8a29e;
    background: rgba(168, 162, 158, 0.10);
    border: 1px solid rgba(168, 162, 158, 0.15);
  }

  .entry-meta {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #57534e;
    margin-top: 6px;
    letter-spacing: 0.02em;
  }

  .entry:hover .rule-chip {
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.15);
  }

  .entry:hover .entry-meta {
    color: #78716c;
  }
</style>
