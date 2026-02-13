<script lang="ts">
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="hist-nav-btn {disabled ? 'is-disabled' : ''}"
  onclick={() => { if (!disabled) onclick(); }}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-label={direction === 'back' ? 'Go back in history' : 'Go forward in history'}
  aria-disabled={disabled}
>
  <div class="nails">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>
  <div class="nails nails-bottom">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>
  <svg class="chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    {#if direction === 'back'}
      <path d="M12 4L6 10L12 16" />
    {:else}
      <path d="M8 4L14 10L8 16" />
    {/if}
  </svg>
</div>

<style>
  .hist-nav-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(40px, 5.5vw, 64px);
    height: clamp(40px, 5.5vw, 64px);
    border-radius: 50%;
    cursor: pointer;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        #1c1917,
        #1c1917 8px,
        #201e1b 8px,
        #201e1b 9px
      );
    border: 2px solid #44403c;
    color: #67e8f9;
    transition: border-color 0.15s, background-color 0.15s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
    background-clip: padding-box;
  }

  .hist-nav-btn:hover:not(.is-disabled) {
    background-color: #292524;
    border-color: #facc15;
  }

  .hist-nav-btn:hover:not(.is-disabled) .chevron {
    color: #facc15;
    filter: drop-shadow(0 0 7px rgba(250, 204, 21, 0.6));
  }

  .hist-nav-btn.is-disabled {
    pointer-events: none;
    border-color: #292524;
    color: #44403c;
  }

  .hist-nav-btn.is-disabled .chevron {
    filter: none;
    opacity: 0.35;
  }

  .hist-nav-btn.is-disabled .nail {
    background: #44403c;
    box-shadow: none;
  }

  .chevron {
    width: clamp(16px, 2.5vw, 26px);
    height: clamp(16px, 2.5vw, 26px);
    filter: drop-shadow(0 0 5px rgba(103, 232, 249, 0.5));
  }

  .nails {
    position: absolute;
    top: 10px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 10px;
  }

  .nail {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #0e7490;
    box-shadow: 0 0 3px rgba(14, 116, 144, 0.3);
  }
</style>
