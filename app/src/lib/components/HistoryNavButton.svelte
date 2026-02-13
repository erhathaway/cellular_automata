<script lang="ts">
  import SteelPanel from '$lib/components/SteelPanel.svelte';

  let {
    direction,
    disabled = false,
    onclick,
  }: {
    direction: 'back' | 'forward';
    disabled?: boolean;
    onclick: () => void;
  } = $props();
</script>

<SteelPanel
  variant="yellow"
  borderRadius="50%"
  borderWidth={2}
  {disabled}
  onclick={() => { if (!disabled) onclick(); }}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-label={direction === 'back' ? 'Go back in history' : 'Go forward in history'}
  aria-disabled={disabled}
  style="width: clamp(40px, 5.5vw, 64px); height: clamp(40px, 5.5vw, 64px); cursor: pointer;"
>
  <div class="hist-nav-btn" class:is-disabled={disabled}>
    <svg class="chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      {#if direction === 'back'}
        <path d="M12 4L6 10L12 16" />
      {:else}
        <path d="M8 4L14 10L8 16" />
      {/if}
    </svg>
  </div>
</SteelPanel>

<style>
  .hist-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #67e8f9;
  }

  .hist-nav-btn:hover:not(.is-disabled) .chevron {
    color: #facc15;
    filter: drop-shadow(0 0 7px rgba(250, 204, 21, 0.6));
  }

  .hist-nav-btn.is-disabled {
    pointer-events: none;
    color: #44403c;
  }

  .hist-nav-btn.is-disabled .chevron {
    filter: none;
    opacity: 0.35;
  }

  .chevron {
    width: clamp(16px, 2.5vw, 26px);
    height: clamp(16px, 2.5vw, 26px);
    filter: drop-shadow(0 0 5px rgba(103, 232, 249, 0.5));
  }
</style>
