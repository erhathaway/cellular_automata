<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';

  let isOpen = $state(false);
  let activeTab: string | null = $state(null);
  let containerEl = $state<HTMLElement>(undefined!);

  function onWindowClick(e: MouseEvent) {
    const target = e.target as Node;
    if (containerEl?.contains(target)) return;
    activeTab = null;
  }

  onMount(() => {
    window.addEventListener('click', onWindowClick);
    return () => window.removeEventListener('click', onWindowClick);
  });

  function selectTab(name: string) {
    activeTab = activeTab === name ? null : name;
  }

  function truncateNumber(n: number): string {
    const num = Math.floor(n);
    const mils = Math.floor(num / 1000000);
    const thousands = Math.floor((num - mils * 1000000) / 1000);
    if (mils > 0) return `${mils}m`;
    if (thousands > 0) return `${thousands}k`;
    return `${num}`;
  }

  // Display values
  let neighborsDisplay = $derived(
    automataStore.neighborhoodRadius > 1
      ? `${automataStore.neighbors.length} (r=${automataStore.neighborhoodRadius})`
      : `${automataStore.neighbors.length}`
  );
  let ruleDisplay = $derived.by(() => {
    const rule = automataStore.rule;
    if (rule.type === 'wolfram') return `Rule ${rule.rule}`;
    return `S${rule.survive.join('')} B${rule.born.join('')}`;
  });
  let shapeDisplay = $derived.by(() => {
    const shape = automataStore.populationShape;
    return Object.entries(shape)
      .map(([k, v]) => `${k}:${truncateNumber(v)}`)
      .join(' ');
  });

  let tabs = $derived([
    { id: 'states', label: 'States', value: `${automataStore.cellStates.length}` },
    { id: 'grid', label: 'Grid', value: shapeDisplay },
    { id: 'neighbors', label: 'Neighbors', value: neighborsDisplay },
    { id: 'rule', label: 'Rule', value: ruleDisplay },
  ]);

  // --- Inline control helpers ---
  let shapeKeys = $derived(Object.keys(automataStore.populationShape));
  let radius = $derived(automataStore.neighborhoodRadius);
  let neighborCount = $derived(automataStore.neighbors.length);

  let editingColorState: number | null = $state(null);

  function hslString(color: { h: number; s: number; l: number; a: number }): string {
    return `hsla(${Math.floor(color.h)}, ${Math.floor(color.s * 100)}%, ${Math.floor(color.l * 100)}%, ${color.a})`;
  }

  function parseNumberList(str: string): number[] {
    return str
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  }
</script>

<div bind:this={containerEl} class="relative">
  <!-- Toggle button -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex cursor-pointer select-none items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors"
    style="color: {isOpen ? 'white' : 'rgba(255,255,255,0.5)'}; background: {isOpen ? 'rgba(255,255,255,0.15)' : 'transparent'};"
    onmouseenter={(e) => { if (!isOpen) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}
    onmouseleave={(e) => { if (!isOpen) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
    onclick={(e) => { e.stopPropagation(); isOpen = !isOpen; if (!isOpen) activeTab = null; }}
  >
    <span class="text-sm font-medium">Advanced</span>
    <svg
      class="h-3 w-3 transition-transform"
      style="transform: rotate({isOpen ? '180deg' : '0deg'});"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
    </svg>
  </div>

  <!-- Dropdown panel (dark) -->
  {#if isOpen}
    <div
      class="absolute right-0 top-full mt-2 rounded-lg p-1"
      style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); min-width: 320px;"
    >
      <!-- Tab row -->
      <div class="flex gap-1">
        {#each tabs as tab}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="flex-1 cursor-pointer select-none rounded-md px-3 py-1.5 text-center transition-colors"
            style="color: {activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)'}; background: {activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent'};"
            onmouseenter={(e) => { if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}
            onmouseleave={(e) => { if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
            onclick={(e) => { e.stopPropagation(); selectTab(tab.id); }}
          >
            <div class="text-[10px] uppercase tracking-wider" style="color: rgba(255,255,255,0.35);">{tab.label}</div>
            <div class="text-sm font-medium">{tab.value}</div>
          </div>
        {/each}
      </div>

      <!-- Tab content -->
      {#if activeTab}
        <div class="mt-1 rounded-md p-4" style="background: rgba(255,255,255,0.08);">

          {#if activeTab === 'states'}
            <div class="flex flex-col gap-2">
              {#each automataStore.cellStates as cellState}
                <div class="flex items-center gap-3">
                  <span class="w-6 text-center text-xs" style="color: rgba(255,255,255,0.5);">{cellState.number}</span>
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="h-6 w-6 cursor-pointer rounded border"
                    style="background-color: {hslString(cellState.color)}; border-color: rgba(255,255,255,0.2);"
                    onclick={() => { editingColorState = editingColorState === cellState.number ? null : cellState.number; }}
                  ></div>
                  <span class="text-xs" style="color: rgba(255,255,255,0.4);">State {cellState.number}</span>
                </div>
                {#if editingColorState === cellState.number}
                  <div class="ml-9 flex flex-col gap-1.5">
                    <label class="flex items-center gap-2 text-xs" style="color: rgba(255,255,255,0.5);">
                      H
                      <input type="range" min="0" max="360" value={cellState.color.h} class="w-full"
                        oninput={(e) => automataStore.setCellStateColor(cellState.number, { ...cellState.color, h: parseInt((e.target as HTMLInputElement).value) })} />
                    </label>
                    <label class="flex items-center gap-2 text-xs" style="color: rgba(255,255,255,0.5);">
                      S
                      <input type="range" min="0" max="100" value={Math.floor(cellState.color.s * 100)} class="w-full"
                        oninput={(e) => automataStore.setCellStateColor(cellState.number, { ...cellState.color, s: parseInt((e.target as HTMLInputElement).value) / 100 })} />
                    </label>
                    <label class="flex items-center gap-2 text-xs" style="color: rgba(255,255,255,0.5);">
                      L
                      <input type="range" min="0" max="100" value={Math.floor(cellState.color.l * 100)} class="w-full"
                        oninput={(e) => automataStore.setCellStateColor(cellState.number, { ...cellState.color, l: parseInt((e.target as HTMLInputElement).value) / 100 })} />
                    </label>
                  </div>
                {/if}
              {/each}
            </div>

          {:else if activeTab === 'grid'}
            <div class="flex flex-col gap-3">
              {#each shapeKeys as dimName}
                <div class="flex items-center gap-3">
                  <span class="w-6 text-xs font-medium" style="color: rgba(255,255,255,0.5);">{dimName}</span>
                  <input
                    type="number"
                    value={automataStore.populationShape[dimName]}
                    onchange={(e) => {
                      const v = parseInt((e.target as HTMLInputElement).value);
                      if (!isNaN(v) && v > 0) automataStore.setPopulationShapeDimension(dimName, v);
                    }}
                    class="h-8 w-full rounded border bg-transparent px-2 text-sm text-white outline-none"
                    style="border-color: rgba(255,255,255,0.2);"
                  />
                </div>
              {/each}
            </div>

          {:else if activeTab === 'neighbors'}
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-4">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded text-lg text-white transition-colors disabled:opacity-30"
                  style="background: rgba(255,255,255,0.1);"
                  disabled={radius <= 1}
                  onclick={() => automataStore.setNeighborhoodRadius(radius - 1)}
                >-</button>
                <span class="w-8 text-center text-lg font-medium text-white">{radius}</span>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded text-lg text-white transition-colors disabled:opacity-30"
                  style="background: rgba(255,255,255,0.1);"
                  disabled={radius >= 10}
                  onclick={() => automataStore.setNeighborhoodRadius(radius + 1)}
                >+</button>
              </div>
              <div class="text-xs" style="color: rgba(255,255,255,0.4);">
                {neighborCount} neighbors (r={radius})
              </div>
              {#if automataStore.dimension === 1 && radius > 1}
                <div class="text-[10px]" style="color: rgba(255,255,255,0.3);">
                  Uses life-like rules (r&gt;1 incompatible with Wolfram)
                </div>
              {/if}
            </div>

          {:else if activeTab === 'rule'}
            {#if automataStore.rule.type === 'wolfram'}
              <div class="flex items-center gap-3">
                <span class="text-xs" style="color: rgba(255,255,255,0.5); letter-spacing: 2px;">Rule #</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={automataStore.rule.rule}
                  onchange={(e) => {
                    const v = parseInt((e.target as HTMLInputElement).value);
                    if (v >= 0 && v <= 255) automataStore.setRule({ type: 'wolfram', rule: v });
                  }}
                  class="h-8 w-full rounded border bg-transparent px-2 text-sm text-white outline-none"
                  style="border-color: rgba(255,255,255,0.2);"
                />
              </div>
            {:else}
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <span class="w-14 text-xs" style="color: rgba(255,255,255,0.5); letter-spacing: 2px;">Survive</span>
                  <input
                    type="text"
                    value={automataStore.rule.survive.join(', ')}
                    onchange={(e) => {
                      const survive = parseNumberList((e.target as HTMLInputElement).value);
                      automataStore.setRule({
                        type: 'conway',
                        survive,
                        born: automataStore.rule.type === 'conway' ? automataStore.rule.born : [3],
                      });
                    }}
                    class="h-8 w-full rounded border bg-transparent px-2 text-sm text-white outline-none"
                    style="border-color: rgba(255,255,255,0.2);"
                  />
                </div>
                <div class="flex items-center gap-3">
                  <span class="w-14 text-xs" style="color: rgba(255,255,255,0.5); letter-spacing: 2px;">Born</span>
                  <input
                    type="text"
                    value={automataStore.rule.born.join(', ')}
                    onchange={(e) => {
                      const born = parseNumberList((e.target as HTMLInputElement).value);
                      automataStore.setRule({
                        type: 'conway',
                        survive: automataStore.rule.type === 'conway' ? automataStore.rule.survive : [2, 3],
                        born,
                      });
                    }}
                    class="h-8 w-full rounded border bg-transparent px-2 text-sm text-white outline-none"
                    style="border-color: rgba(255,255,255,0.2);"
                  />
                </div>
              </div>
            {/if}
          {/if}

        </div>
      {/if}
    </div>
  {/if}
</div>
