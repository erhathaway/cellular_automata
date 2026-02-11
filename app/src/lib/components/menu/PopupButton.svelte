<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    isActive?: boolean;
    onclick?: () => void;
    children: Snippet;
  }

  let { isActive = false, onclick, children }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex items-center justify-center"
  style="height: 30px; width: 80px; text-align: center; padding: 10px; letter-spacing: 4px; font-size: 14px; border-radius: 2px; margin-left: -1px; color: {isActive ? 'yellow' : 'gray'}; border: 1px solid #5d5c5c; {isActive ? 'background-color: #00000047;' : ''} cursor: pointer;"
  onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = 'white'; el.style.backgroundColor = 'black'; }}
  onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = isActive ? 'yellow' : 'gray'; el.style.backgroundColor = isActive ? '#00000047' : 'transparent'; }}
  onclick={onclick}
>
  {@render children()}
</div>
