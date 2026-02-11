<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import DimensionPopup from './menu/DimensionPopup.svelte';
  import ViewerPopup from './menu/ViewerPopup.svelte';
  import ShapePopup from './menu/ShapePopup.svelte';
  import StatesPopup from './menu/StatesPopup.svelte';
  import RulePopup from './menu/RulePopup.svelte';

  let activePopup: string | null = $state(null);

  function togglePopup(name: string) {
    activePopup = activePopup === name ? null : name;
  }

  function truncateNumber(n: number): string {
    const num = Math.floor(n);
    const mils = Math.floor(num / 1000000);
    const thousands = Math.floor((num - mils * 1000000) / 1000);
    if (mils > 0) return `${mils}m`;
    if (thousands > 0) return `${thousands}k`;
    return `${num}`;
  }

  let dimensionDisplay = $derived(`${automataStore.dimension}D`);
  let viewerDisplay = $derived(`${automataStore.viewer}D`);
  let statesDisplay = $derived(`${automataStore.cellStates.length}`);
  let neighborsDisplay = $derived(`${automataStore.neighbors.length}`);
  let ruleDisplay = $derived.by(() => {
    const rule = automataStore.rule;
    if (rule.type === 'wolfram') return `${rule.rule}`;
    return `S${rule.survive.join('')} B${rule.born.join('')}`;
  });
  let shapeDisplay = $derived.by(() => {
    const shape = automataStore.populationShape;
    return Object.entries(shape)
      .map(([k, v]) => `${k} ${truncateNumber(v)}`)
      .join('  ');
  });

  interface MenuItem {
    key: string;
    title: string;
    value: () => string;
    hasPopup: boolean;
  }

  const menuItems: MenuItem[] = [
    { key: 'dimensions', title: 'Cells', value: () => dimensionDisplay, hasPopup: true },
    { key: 'viewer', title: 'Viewer', value: () => viewerDisplay, hasPopup: true },
    { key: 'states', title: 'States', value: () => statesDisplay, hasPopup: true },
    { key: 'shape', title: 'Population', value: () => shapeDisplay, hasPopup: true },
    { key: 'neighbors', title: 'Neighbors', value: () => neighborsDisplay, hasPopup: false },
    { key: 'rule', title: 'Rule', value: () => ruleDisplay, hasPopup: true },
    { key: 'genesis', title: 'Genesis', value: () => 'Random', hasPopup: false },
  ];
</script>

<nav class="flex h-full flex-col">
  <div class="flex-1 overflow-y-auto">
    {#each menuItems as item}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="border-b border-neutral-900"
        class:cursor-pointer={item.hasPopup}
        onclick={() => item.hasPopup && togglePopup(item.key)}
      >
        <div
          class="flex items-center justify-between px-5 py-3 transition-colors"
          class:hover:bg-white/5={item.hasPopup}
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] uppercase tracking-[2.3px] text-white">{item.title}</span>
            <span class="text-[15px] tracking-[3px] text-neutral-400">{item.value()}</span>
          </div>
          {#if item.hasPopup}
            <svg
              class="h-3 w-3 text-neutral-500 transition-transform"
              class:rotate-180={activePopup === item.key}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          {/if}
        </div>

        {#if activePopup === item.key}
          <div class="border-t border-neutral-800 bg-black/30 px-2 py-3">
            {#if item.key === 'dimensions'}
              <DimensionPopup />
            {:else if item.key === 'viewer'}
              <ViewerPopup />
            {:else if item.key === 'shape'}
              <ShapePopup />
            {:else if item.key === 'states'}
              <StatesPopup />
            {:else if item.key === 'rule'}
              <RulePopup />
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="flex border-t border-neutral-800">
    <a
      href="/intro"
      class="flex flex-1 items-center justify-center p-3 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-sky-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    </a>
    <a
      href="/docs"
      class="flex flex-1 items-center justify-center p-3 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-sky-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
    </a>
  </div>
</nav>
