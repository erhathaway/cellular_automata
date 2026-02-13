<script lang="ts">
  import { SignInButton } from 'svelte-clerk/client';
  import { onMount } from 'svelte';

  const ACTIVITY_THRESHOLD = 180; // seconds of active usage before showing
  const IDLE_TIMEOUT = 30_000; // 30s without interaction = idle
  const SESSION_KEY = 'signup-nudge-dismissed';

  let show = $state(false);
  let lastInteraction = $state(0);
  let activeSeconds = $state(0);

  onMount(() => {
    // Already dismissed this session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    lastInteraction = Date.now();

    function onActivity() {
      lastInteraction = Date.now();
    }

    window.addEventListener('click', onActivity);
    window.addEventListener('pointermove', onActivity);

    const timer = setInterval(() => {
      const now = Date.now();
      const recentlyActive = now - lastInteraction < IDLE_TIMEOUT;
      const pageVisible = document.visibilityState === 'visible';

      if (recentlyActive && pageVisible) {
        activeSeconds++;
        if (activeSeconds >= ACTIVITY_THRESHOLD) {
          show = true;
          clearInterval(timer);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('pointermove', onActivity);
    };
  });

  function dismiss() {
    show = false;
    sessionStorage.setItem(SESSION_KEY, '1');
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="backdrop" onclick={dismiss}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-panel" onclick={(e) => e.stopPropagation()}>
      <!-- Nails -->
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

      <!-- Close button -->
      <button class="close-btn" onclick={dismiss} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>

      <!-- Icon -->
      <div class="icon-wrap">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9Z" />
          <path d="M11 3 8 9l4 13 4-13-3-6" />
          <path d="M2 9h20" />
        </svg>
      </div>

      <h2 class="modal-title">Your backpack is filling up</h2>
      <p class="modal-subtitle">Sign in to save your discoveries and claim new finds.</p>

      <SignInButton mode="modal" forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/mine'} asChild>
        {#snippet children({ signIn })}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="btn-signin" onclick={signIn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in / Sign up
          </div>
        {/snippet}
      </SignInButton>

      <button class="btn-dismiss" onclick={dismiss}>Maybe later</button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  .modal-panel {
    position: relative;
    width: 100%;
    max-width: 380px;
    margin: 0 16px;
    padding: 32px 28px 24px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 10px,
        rgba(68, 64, 60, 0.1) 10px,
        rgba(68, 64, 60, 0.1) 11px
      );
    border: 2px solid #44403c;
    border-radius: 8px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    text-align: center;
  }

  /* Nails */
  .nails {
    position: absolute;
    top: 8px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 8px;
  }

  .nail {
    width: 6px;
    height: 6px;
    background: #78716c;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
  }

  /* Close button */
  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #78716c;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .close-btn:hover {
    color: #d6d3d1;
    border-color: #44403c;
  }

  /* Icon */
  .icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
    color: #facc15;
    filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.3));
  }

  /* Title */
  .modal-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #f5f5f4;
    margin: 0 0 6px;
  }

  .modal-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #78716c;
    margin: 0 0 24px;
    line-height: 1.5;
  }

  /* Sign-in CTA */
  .btn-signin {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1c1917;
    background: #facc15;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .btn-signin:hover {
    background: #fde047;
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
  }

  /* Dismiss link */
  .btn-dismiss {
    display: inline-block;
    margin-top: 14px;
    padding: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #57534e;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
  }

  .btn-dismiss:hover {
    color: #a8a29e;
  }
</style>
