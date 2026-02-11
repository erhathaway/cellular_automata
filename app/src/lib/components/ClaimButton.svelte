<script lang="ts">
  import { SignedIn, SignedOut } from 'svelte-clerk/client';
  import { automataStore } from '$lib/stores/automata.svelte';
  import SaveDialog from './SaveDialog.svelte';

  let saveDialogOpen = $state(false);
  let animating = $state(false);

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
</script>

<SignedIn>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-colors"
    style="background-color: #facc15; color: #000; box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);"
    onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#eab308'; }}
    onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#facc15'; }}
    onclick={() => (saveDialogOpen = true)}
  >
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
  </div>

  <SaveDialog bind:open={saveDialogOpen} />
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
