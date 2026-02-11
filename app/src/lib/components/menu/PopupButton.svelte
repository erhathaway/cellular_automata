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
  style="height: 30px; width: 80px; text-align: center; padding: 10px; letter-spacing: 4px; font-size: 14px; border-radius: 2px; margin-left: -1px; color: {isActive ? '#2563eb' : '#555'}; border: 1px solid #d4d4d4; {isActive ? 'background-color: #eff6ff;' : ''} cursor: pointer;"
  onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = 'black'; el.style.backgroundColor = '#f3f3f3'; }}
  onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = isActive ? '#2563eb' : '#555'; el.style.backgroundColor = isActive ? '#eff6ff' : 'transparent'; }}
  onclick={onclick}
>
  {@render children()}
</div>
