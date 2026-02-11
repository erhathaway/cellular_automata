<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="absolute right-5 bottom-28 z-20 flex cursor-pointer items-center justify-center"
  style="height: 44px; width: 44px; border-radius: 4px; box-shadow: 0 2px 6px rgba(139,92,246,0.3), 0 6px 14px rgba(139,92,246,0.15); color: white; background-color: #8b5cf6;"
  onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#7c3aed'; }}
  onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#8b5cf6'; }}
  onclick={() => automataStore.randomizeRule()}
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 8.5c-.83 0-1.5-.67-1.5-1.5S6.67 5.5 7.5 5.5 9 6.17 9 7s-.67 1.5-1.5 1.5zm0 10c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5S9 16.17 9 17s-.67 1.5-1.5 1.5zm4.5-5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-10c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5S18 6.17 18 7s-.67 1.5-1.5 1.5z"/>
  </svg>
</div>
