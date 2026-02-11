<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  const modes = [
    { label: '1D in 2D', dim: 1 as const, viewer: 2 as const },
    { label: '2D in 2D', dim: 2 as const, viewer: 2 as const },
    { label: '2D in 3D', dim: 2 as const, viewer: 3 as const },
    { label: '3D in 3D', dim: 3 as const, viewer: 3 as const },
  ];

  let activeMode = $derived(
    modes.findIndex(m => m.dim === automataStore.dimension && m.viewer === automataStore.viewer)
  );

  function switchMode(dim: 1 | 2 | 3, viewer: 2 | 3) {
    if (dim !== automataStore.dimension) {
      automataStore.setDimension(dim);
    }
    if (viewer !== automataStore.viewer) {
      automataStore.setViewer(viewer);
    }
  }
</script>

<div class="flex gap-1">
  {#each modes as mode, i}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="cursor-pointer select-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      style="color: {activeMode === i ? 'white' : 'rgba(255,255,255,0.5)'}; background: {activeMode === i ? 'rgba(255,255,255,0.15)' : 'transparent'};"
      onmouseenter={(e) => { if (activeMode !== i) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}
      onmouseleave={(e) => { if (activeMode !== i) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
      onclick={() => switchMode(mode.dim, mode.viewer)}
    >
      {mode.label}
    </div>
  {/each}
</div>
