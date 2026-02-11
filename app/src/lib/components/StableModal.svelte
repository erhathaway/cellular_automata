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
    if (automataStore.stableKind === 'quasi') return 'Quasi-Stable State Detected';
    if (automataStore.stablePeriod === 1) return 'Stable State Detected';
    return 'Oscillation Detected';
  });

  let message = $derived.by(() => {
    if (automataStore.stableKind === 'quasi') {
      return 'The automata has settled into a locally fluctuating state — the population is bounded but not exactly repeating.';
    }
    if (automataStore.stablePeriod === 1) {
      return 'The automata has reached a static state — no cells are changing.';
    }
    return `The automata is oscillating with a period of ${automataStore.stablePeriod}.`;
  });
</script>

{#if automataStore.stableDetected}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: rgba(0, 0, 0, 0.5);"
    onclick={dismiss}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      style="background: black; border-radius: 8px; padding: 24px 28px; max-width: 380px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
        {title}
      </h2>
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
        {message}
      </p>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button
          style="padding: 8px 16px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; font-size: 14px; cursor: pointer;"
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          onclick={dismiss}
        >
          Dismiss
        </button>
        <button
          style="padding: 8px 16px; border-radius: 4px; border: none; background: hsl(234, 70%, 40%); color: white; font-size: 14px; cursor: pointer;"
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(234, 70%, 50%)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(234, 70%, 40%)'; }}
          onclick={resetAndPlay}
        >
          Reset & Play
        </button>
      </div>
    </div>
  </div>
{/if}
