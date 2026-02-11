<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let mining = $derived(automataStore.isMining);

  function handleClick() {
    if (mining) return;
    automataStore.isMining = true;
    automataStore.randomizeRule();
    setTimeout(() => { automataStore.isMining = false; }, 5000);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-colors"
  style="background-color: #000; color: #facc15; box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);"
  onmouseenter={(e) => { if (!mining) { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#1a1a1a'; }}}
  onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#000'; }}
  onclick={handleClick}
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 {mining ? 'pickaxe-strike' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
    <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
    <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
    <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
  </svg>
  {#if mining}
    <div class="progress-track">
      <div class="progress-fill"></div>
    </div>
  {:else}
    Mine for automata!
  {/if}
</div>

<style>
  @keyframes strike {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-35deg); }
    45% { transform: rotate(15deg); }
    55% { transform: rotate(10deg); }
    70% { transform: rotate(-5deg); }
    85% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes fill {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  :global(.pickaxe-strike) {
    transform-origin: 20% 85%;
    animation: strike 0.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  }

  .progress-track {
    width: 100px;
    height: 4px;
    background: rgba(250, 204, 21, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #facc15;
    border-radius: 2px;
    animation: fill 5s linear forwards;
  }
</style>
