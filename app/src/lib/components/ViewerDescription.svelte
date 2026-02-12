<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from './PixelAvatar.svelte';

  let title = $derived.by(() => {
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    const rule = automataStore.rule;
    const r = automataStore.neighborhoodRadius;

    let name = `${dim}D`;
    if (r > 1) name += ` r=${r}`;
    if (view === 3) name += ` (3D view)`;

    if (rule.type === 'wolfram') {
      return `${name} — Rule ${rule.rule}`;
    }
    const maxNums = 6;
    const bornStr = rule.born.length > maxNums
      ? rule.born.slice(0, maxNums).join(',') + '…'
      : rule.born.join(',');
    const surviveStr = rule.survive.length > maxNums
      ? rule.survive.slice(0, maxNums).join(',') + '…'
      : rule.survive.join(',');
    const nc = automataStore.neighbors.length;
    return `${name} (${nc}n) — B${bornStr}/S${surviveStr}`;
  });

  let description = $derived.by(() => {
    const rule = automataStore.rule;
    if (rule.type === 'wolfram') {
      return `Elementary cellular automaton using Wolfram's Rule ${rule.rule}. Each cell's next state is determined by its current state and its two immediate neighbors, producing one of 256 possible rule sets.`;
    }
    const born = rule.born.join(', ');
    const survive = rule.survive.join(', ');
    return `Life-like cellular automaton where a dead cell becomes alive with ${born} neighbors (birth) and a living cell survives with ${survive} neighbors (survival). All other cells die from loneliness or overcrowding.`;
  });

  let shapeText = $derived(
    Object.entries(automataStore.populationShape)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' × ')
  );

  // Discovery lookup
  interface DiscoveryInfo {
    found: boolean;
    discoveredBy?: string;
    discoveredByImageUrl?: string | null;
    discoveredByAvatarId?: string | null;
    discoveredAt?: string;
    saveCount?: number;
    totalLikes?: number;
    totalBookmarks?: number;
    isLikedByMe?: boolean;
    isBookmarkedByMe?: boolean;
    entityId?: string | null;
    entityType?: 'generation_run' | 'cell_population' | null;
  }

  let discoveryInfo: DiscoveryInfo | null = $state(null);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;

  let liked = $state(false);
  let bookmarked = $state(false);
  let likeAnimating = $state(false);
  let bookmarkAnimating = $state(false);
  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;
  let lastConfigKey = '';
  let checking = $derived(discoveryInfo === null);

  function entityBody() {
    if (!discoveryInfo?.entityId || !discoveryInfo.entityType) return null;
    return discoveryInfo.entityType === 'generation_run'
      ? { generationRunId: discoveryInfo.entityId }
      : { cellPopulationId: discoveryInfo.entityId };
  }

  async function toggleLike() {
    const body = entityBody();
    if (!body) return;

    liked = !liked;
    if (liked) {
      likeAnimating = true;
      setTimeout(() => { likeAnimating = false; }, 500);
      try {
        await api('POST', '/api/likes', body);
      } catch {
        liked = false;
      }
    } else {
      try {
        await api('DELETE', '/api/likes', body);
      } catch {
        liked = true;
      }
    }
  }

  async function toggleBookmark() {
    const body = entityBody();
    if (!body) return;

    bookmarked = !bookmarked;
    if (bookmarked) {
      bookmarkAnimating = true;
      setTimeout(() => { bookmarkAnimating = false; }, 500);
      try {
        await api('POST', '/api/bookmarks', body);
      } catch {
        bookmarked = false;
      }
    } else {
      try {
        await api('DELETE', '/api/bookmarks', body);
      } catch {
        bookmarked = true;
      }
    }
  }

  // Reactively look up discovery info when config changes
  $effect(() => {
    const rule = automataStore.rule;
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    const _claimed = automataStore.claimAnimationCounter;

    // Build query params
    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

    // Reset state on actual config change
    const configKey = `${dim}:${ruleType}:${ruleDefinition}:${nr}`;
    if (configKey !== lastConfigKey) {
      lastConfigKey = configKey;
      liked = false;
      bookmarked = false;
      discoveryInfo = null;
    }

    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          d: String(dim),
          rt: ruleType,
          rd: ruleDefinition,
          nr: String(nr)
        });
        const res = await fetch(`/api/discovery?${params}`);
        if (res.ok) {
          const data = await res.json();
          discoveryInfo = data;
          liked = data.isLikedByMe ?? false;
          bookmarked = data.isBookmarkedByMe ?? false;
        } else {
          discoveryInfo = null;
        }
      } catch {
        discoveryInfo = null;
      }
    }, 500);
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => { copied = false; }, 1500);
    } catch {
      // fallback
    }
  }

</script>

<div class="mx-auto flex max-w-4xl gap-8 px-6 py-10">
  <!-- Left column: Creator -->
  <div class="flex w-40 shrink-0 flex-col items-center pt-1 text-center">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Mined by</p>
    {#if discoveryInfo?.found && !automataStore.isMining}
      <PixelAvatar
        avatarId={discoveryInfo.discoveredByAvatarId ?? null}
        size={48}
        fallbackInitials={discoveryInfo.discoveredBy?.[0]?.toUpperCase() ?? '?'}
      />
      <p class="mt-2 text-sm font-medium text-neutral-900">{discoveryInfo.discoveredBy}</p>
      <div class="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
        {#if discoveryInfo.discoveredAt}
          <span>{timeAgo(discoveryInfo.discoveredAt)}</span>
        {/if}
        {#if discoveryInfo.totalLikes}
          <span>{discoveryInfo.totalLikes} {discoveryInfo.totalLikes === 1 ? 'like' : 'likes'}</span>
        {/if}
        {#if discoveryInfo.totalBookmarks}
          <span>{discoveryInfo.totalBookmarks} in chests</span>
        {/if}
      </div>
    {:else if discoveryInfo === null || automataStore.isMining}
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
        <svg class="search-sweep h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p class="mt-2 text-xs text-neutral-400">Searching...</p>
    {:else if !discoveryInfo.found}
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      </div>
      <p class="mt-2 text-xs text-neutral-400">Undiscovered</p>
    {/if}
  </div>

  <!-- Center column: Title + Description -->
  <div class="min-w-0 flex-1">
    <h1 class="truncate text-2xl font-bold text-neutral-900" title={title}>{title}</h1>

    <div class="mt-2 flex items-center gap-4 text-sm text-neutral-500">
      <span>Generation {automataStore.totalGenerations.toLocaleString()}</span>
      <span>·</span>
      <span>Grid {shapeText}</span>
      <span>·</span>
      <span>{automataStore.neighbors.length} neighbors</span>
    </div>

    <hr class="my-5 border-neutral-200" />

    <p class="leading-relaxed text-neutral-700">{description}</p>
  </div>

  <!-- Right column: Action buttons -->
  <div class="flex shrink-0 items-start gap-3 pt-1">
    <!-- Copy link button -->
    <div class="flex flex-col items-center gap-1">
      <button
        class="flex h-14 w-14 items-center justify-center rounded-full border transition-all {copied ? 'border-green-300 text-green-500' : 'border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'} {copied ? 'action-pop' : ''}"
        aria-label="Copy link"
        onclick={copyLink}
      >
        {#if copied}
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        {:else}
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        {/if}
      </button>
      {#if copied}
        <span class="copied-label text-xs font-medium text-green-500">Copied!</span>
      {/if}
    </div>

    <!-- Like button -->
    <div class="flex flex-col items-center gap-1">
      <button
        class="flex h-14 w-14 items-center justify-center rounded-full transition-all {checking ? 'border border-neutral-100 text-neutral-300' : liked ? 'bg-neutral-900 text-yellow-400' : 'border border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'} {likeAnimating ? 'action-pop' : ''}"
        aria-label={liked ? 'Unlike' : 'Like'}
        onclick={toggleLike}
        disabled={checking}
      >
        <svg class="transition-all {checking ? 'h-4 w-4 animate-spin' : 'h-6 w-6'}" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
      </button>
      {#if discoveryInfo?.totalLikes}
        <span class="text-xs text-neutral-400">{discoveryInfo.totalLikes}</span>
      {/if}
    </div>

    <!-- Bookmark button -->
    <div class="flex flex-col items-center gap-1">
      <button
        class="flex h-14 w-14 items-center justify-center rounded-full transition-all {checking ? 'border border-neutral-100 text-neutral-300' : bookmarked ? 'bg-neutral-900 text-yellow-400' : 'border border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'} {bookmarkAnimating ? 'action-pop' : ''}"
        aria-label={bookmarked ? 'Remove from chest' : 'Add to chest'}
        onclick={toggleBookmark}
        disabled={checking}
      >
        <svg class="transition-all {checking ? 'h-4 w-4 animate-spin' : 'h-6 w-6'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
          <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
          <line x1="4" y1="13" x2="20" y2="13" />
          <rect x="10" y="11" width="4" height="4" rx="1" />
        </svg>
      </button>
      {#if discoveryInfo?.totalBookmarks}
        <span class="text-xs text-neutral-400">{discoveryInfo.totalBookmarks}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes pop {
    0% { transform: scale(1); }
    30% { transform: scale(1.3); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  :global(.action-pop) {
    animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .search-sweep {
    animation: sweep 1.5s ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes sweep {
    0% { transform: translateX(-3px) rotate(-5deg); }
    50% { transform: translateX(3px) rotate(5deg); }
    100% { transform: translateX(-3px) rotate(-5deg); }
  }

  .copied-label {
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0); }
  }
</style>
