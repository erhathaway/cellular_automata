<script lang="ts">
  import { SignedIn, SignedOut } from 'svelte-clerk/client';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';

  let saving = $state(false);
  let saved = $state(false);
  let saveError = $state('');
  let animating = $state(false);

  // Discovery state: null = loading, true = undiscovered, false = already discovered
  let isUndiscovered: boolean | null = $state(null);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;

  // Trigger animation when the rule changes (i.e. a new automata was mined)
  let lastRule = $state('');
  $effect(() => {
    const current = JSON.stringify(automataStore.rule);
    if (lastRule && current !== lastRule) {
      animating = true;
      setTimeout(() => { animating = false; }, 1500);
    }
    lastRule = current;
  });

  async function claim() {
    if (saving || saved) return;
    saving = true;
    saveError = '';
    try {
      const data = automataStore.exportForSave();
      const thumbnail = automataStore.getCanvasDataURL?.() ?? undefined;
      const res = await fetch('/api/generation-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, thumbnail })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      saved = true;
      automataStore.claimAnimationCounter++;
    } catch (e: any) {
      saveError = e.message ?? 'Failed to save';
    } finally {
      saving = false;
    }
  }

  // Check discovery status when rule config changes
  $effect(() => {
    const rule = automataStore.rule;
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;

    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

    // Reset state
    isUndiscovered = null;
    saved = false;
    saveError = '';

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
          isUndiscovered = !data.found;
        } else {
          isUndiscovered = null;
        }
      } catch {
        isUndiscovered = null;
      }
    }, 500);
  });
</script>

<SignedIn>
  {#if isUndiscovered === false}
    <!-- Already discovered — show nothing -->
  {:else if automataStore.isMining || isUndiscovered === null}
    <!-- Show checking spinner while mining or while API is in flight -->
    <div
      class="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg"
      style="background-color: #a3a3a3; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15);"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Checking discovery...
    </div>
  {:else if isUndiscovered && automataStore.stableKind === 'exact' && automataStore.stablePeriod <= 1}
    <!-- Stable / dead — no living automata -->
    <div
      class="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg"
      style="background-color: #525252; color: #a3a3a3; box-shadow: 0 4px 14px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15);"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </svg>
      No living automata found
    </div>
  {:else if isUndiscovered && saved}
    <!-- Successfully claimed -->
    <div
      class="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg"
      style="background-color: #16a34a; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2);"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      Claimed!
    </div>
  {:else if isUndiscovered}
    <!-- New automata — click to claim -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-colors"
      style="background-color: #facc15; color: #000; box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);"
      onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#eab308'; }}
      onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#facc15'; }}
      onclick={claim}
    >
      {#if saving}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Claiming...
      {:else if saveError}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
        </svg>
        Failed — tap to retry
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 {animating ? 'gem-found' : ''}"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 3h12l4 6-10 13L2 9Z" />
          <path d="M11 3 8 9l4 13 4-13-3-6" />
          <path d="M2 9h20" />
        </svg>
        New automata found! Click to claim
      {/if}
    </div>
  {/if}
</SignedIn>

<style>
  @keyframes gem-bounce {
    0% { transform: scale(1) rotate(0deg); }
    15% { transform: scale(1.4) rotate(-15deg); }
    30% { transform: scale(0.9) rotate(10deg); }
    45% { transform: scale(1.3) rotate(-8deg); }
    60% { transform: scale(1) rotate(5deg); }
    75% { transform: scale(1.15) rotate(-3deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  :global(.gem-found) {
    animation: gem-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
