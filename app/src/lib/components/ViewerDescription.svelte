<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';

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
    const born = rule.born.join('');
    const survive = rule.survive.join('');
    const nc = automataStore.neighbors.length;
    return `${name} (${nc}n) — B${born}/S${survive}`;
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
    discoveredAt?: string;
    saveCount?: number;
    totalLikes?: number;
    totalBookmarks?: number;
  }

  let discoveryInfo: DiscoveryInfo | null = $state(null);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;

  // Reactively look up discovery info when config changes
  $effect(() => {
    const rule = automataStore.rule;
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;

    // Build query params
    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

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
          discoveryInfo = await res.json();
        } else {
          discoveryInfo = null;
        }
      } catch {
        discoveryInfo = null;
      }
    }, 500);
  });

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
</script>

<div class="mx-auto max-w-3xl px-6 py-10">
  <h1 class="text-2xl font-bold text-neutral-900">{title}</h1>

  <div class="mt-2 flex items-center gap-4 text-sm text-neutral-500">
    <span>Generation {automataStore.totalGenerations.toLocaleString()}</span>
    <span>·</span>
    <span>Grid {shapeText}</span>
    <span>·</span>
    <span>{automataStore.neighbors.length} neighbors</span>
  </div>

  <!-- Creator row (YouTube-style) -->
  {#if discoveryInfo?.found}
    <div class="mt-5 flex items-center gap-3">
      {#if discoveryInfo.discoveredByImageUrl}
        <img src={discoveryInfo.discoveredByImageUrl} alt="" class="h-10 w-10 rounded-full" />
      {:else}
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-500">
          {discoveryInfo.discoveredBy?.[0]?.toUpperCase() ?? '?'}
        </div>
      {/if}
      <div class="min-w-0">
        <p class="text-sm font-medium text-neutral-900">{discoveryInfo.discoveredBy}</p>
        <div class="flex items-center gap-3 text-xs text-neutral-500">
          {#if discoveryInfo.discoveredAt}
            <span>{formatDate(discoveryInfo.discoveredAt)}</span>
          {/if}
          {#if discoveryInfo.saveCount}
            <span>{discoveryInfo.saveCount} {discoveryInfo.saveCount === 1 ? 'save' : 'saves'}</span>
          {/if}
          {#if discoveryInfo.totalLikes}
            <span>{discoveryInfo.totalLikes} {discoveryInfo.totalLikes === 1 ? 'like' : 'likes'}</span>
          {/if}
          {#if discoveryInfo.totalBookmarks}
            <span>{discoveryInfo.totalBookmarks} {discoveryInfo.totalBookmarks === 1 ? 'bookmark' : 'bookmarks'}</span>
          {/if}
        </div>
      </div>
    </div>
  {:else if discoveryInfo && !discoveryInfo.found}
    <div class="mt-5 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      </div>
      <p class="text-sm text-neutral-400">Undiscovered — be the first to save this configuration!</p>
    </div>
  {/if}

  <hr class="my-6 border-neutral-200" />

  <p class="leading-relaxed text-neutral-700">{description}</p>
</div>
