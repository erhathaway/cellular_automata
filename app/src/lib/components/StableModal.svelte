<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  function dismiss() {
    automataStore.dismissStable();
  }

  function resetAndPlay() {
    automataStore.dismissStable();
    automataStore.reset();
    automataStore.play();
  }

  let title = $derived.by(() => {
    if (automataStore.stableKind === 'quasi') return 'Quasi-Stable';
    if (automataStore.stablePeriod === 1) return 'Stable';
    return `Oscillating (period ${automataStore.stablePeriod})`;
  });

  let message = $derived.by(() => {
    if (automataStore.stableKind === 'quasi') return 'Locally fluctuating state';
    if (automataStore.stablePeriod === 1) return 'No cells are changing';
    return 'Repeating pattern detected';
  });
</script>

{#if automataStore.stableDetected}
  <div
    class="absolute left-1/2 top-16 z-30 flex -translate-x-1/2 items-center gap-4 rounded-lg px-5 py-3"
    style="background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); box-shadow: 0 4px 16px rgba(0,0,0,0.3);"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-white">{title}</span>
      <span class="text-sm text-white/50">{message}</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="cursor-pointer rounded px-3 py-1.5 text-xs text-white/70 transition-colors hover:text-white"
        style="background: transparent; border: 1px solid rgba(255,255,255,0.2);"
        onclick={dismiss}
      >
        Dismiss
      </button>
      <button
        class="cursor-pointer rounded border-none px-3 py-1.5 text-xs text-white transition-colors"
        style="background: hsl(234, 70%, 40%);"
        onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(234, 70%, 50%)'; }}
        onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(234, 70%, 40%)'; }}
        onclick={resetAndPlay}
      >
        Reset & Play
      </button>
    </div>
  </div>
{/if}
