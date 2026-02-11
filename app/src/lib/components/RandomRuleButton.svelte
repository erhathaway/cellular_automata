<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let mining = $state(false);

  function handleClick() {
    mining = true;
    automataStore.randomizeRule();
    setTimeout(() => { mining = false; }, 800);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-colors {mining ? 'mine-shake' : ''}"
  style="background-color: #000; color: #facc15; box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);"
  onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#1a1a1a'; }}
  onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#000'; }}
  onclick={handleClick}
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 {mining ? 'pickaxe-swing' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
    <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
    <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
    <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
  </svg>
  Mine for automata!
</div>

<style>
  @keyframes swing {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-30deg); }
    40% { transform: rotate(5deg); }
    55% { transform: rotate(-20deg); }
    70% { transform: rotate(3deg); }
    85% { transform: rotate(-10deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-3px); }
    30% { transform: translateX(3px); }
    45% { transform: translateX(-2px); }
    60% { transform: translateX(2px); }
    75% { transform: translateX(-1px); }
    90% { transform: translateX(1px); }
  }

  :global(.pickaxe-swing) {
    transform-origin: 80% 80%;
    animation: swing 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  :global(.mine-shake) {
    animation: shake 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
