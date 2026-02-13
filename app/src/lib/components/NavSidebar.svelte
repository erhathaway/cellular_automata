<script lang="ts">
  import { page } from '$app/stores';
  import { SignedIn, SignedOut, SignInButton } from 'svelte-clerk/client';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { achievementsStore } from '$lib/stores/achievements.svelte';
  import PixelAvatar from './PixelAvatar.svelte';

  type UserProfile = { displayName: string | null; avatarId: string | null; minerConfig: string | null; email: string | null } | null;

  let {
    userProfile = null,
    onhistoryclick,
    historyOpen = false,
    dark = false,
    black = false,
    bottom = false,
  }: {
    userProfile?: UserProfile;
    onhistoryclick?: () => void;
    historyOpen?: boolean;
    dark?: boolean;
    black?: boolean;
    bottom?: boolean;
  } = $props();

  const topItems = [
    { href: '/mine', label: 'Mine', icon: 'pickaxe' },
    { href: '/gallery', label: 'Gallery', icon: 'compass' },
    { href: '/backpack', label: 'Backpack', icon: 'backpack' },
    { href: '/miners', label: 'Miners', icon: 'miners' },
  ];

  const bottomItems = [
    { href: '/handbook', label: 'Handbook', icon: 'book-open' },
  ];

  function isActive(pathname: string, href: string): boolean {
    if (href === '/mine') return pathname === '/mine';
    return pathname.startsWith(href);
  }

  let chestEl = $state<HTMLElement>();
  let showGemFly = $state(false);
  let showPlusOne = $state(false);
  let gemStyle = $state('');
  let initialized = false;

  $effect(() => {
    const count = automataStore.claimAnimationCounter;
    if (initialized && count > 0) {
      triggerClaimAnimation();
    }
    initialized = true;
  });

  function triggerClaimAnimation() {
    if (!chestEl) return;
    const rect = chestEl.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    const origin = automataStore.claimGemOrigin;
    const startX = origin?.x ?? window.innerWidth / 2;
    const startY = origin?.y ?? window.innerHeight * 0.75;

    gemStyle = `--start-x: ${startX}px; --start-y: ${startY}px; --end-x: ${targetX}px; --end-y: ${targetY}px;`;
    showGemFly = true;
    setTimeout(() => {
      showGemFly = false;
      // Chest landing shake
      chestEl?.classList.add('chest-land');
      showPlusOne = true;
      setTimeout(() => {
        chestEl?.classList.remove('chest-land');
        showPlusOne = false;
      }, 1000);
    }, 1400);
  }
</script>

{#if bottom}
<nav class="nav-bottom" class:dark class:black>
  {#each topItems as item}
    {@const active = isActive($page.url.pathname, item.href)}
    <a href={item.href} class="bottom-item" class:active>
      {#if item.icon === 'pickaxe'}
        <svg class="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
          <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
          <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
          <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
        </svg>
      {:else if item.icon === 'compass'}
        <svg class="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
        </svg>
      {:else if item.icon === 'backpack'}
        <div class="relative" bind:this={chestEl}>
          <svg class="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 10a4 4 0 014-4h8a4 4 0 014 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z" />
            <path d="M9 6V4a3 3 0 016 0v2" />
            <path d="M8 21v-5a2 2 0 012-2h4a2 2 0 012 2v5" />
            <path d="M20 10h-2" />
            <path d="M6 10H4" />
          </svg>
          {#if showPlusOne}
            <span class="plus-one">+1</span>
          {/if}
          {#if achievementsStore.unseenCount > 0}
            <span class="achievement-badge">{achievementsStore.unseenCount}</span>
          {/if}
        </div>
      {:else if item.icon === 'miners'}
        <svg class="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      {/if}
      <span class="bottom-label" class:active>{item.label}</span>
    </a>
  {/each}
  <SignedIn>
    <a href="/user" class="bottom-item" class:active={isActive($page.url.pathname, '/user')} aria-label="Profile">
      <PixelAvatar avatarId={userProfile?.avatarId ?? null} minerConfig={userProfile?.minerConfig ?? null} size={24} fallbackInitials="?" cropUpper bgColor="blue" />
      <span class="bottom-label" class:active={isActive($page.url.pathname, '/user')}>Profile</span>
    </a>
  </SignedIn>
  <SignedOut>
    <SignInButton mode="modal" forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/mine'} asChild>
      {#snippet children({ signIn })}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="bottom-item" onclick={signIn}>
          <svg class="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="bottom-label">Sign in</span>
        </div>
      {/snippet}
    </SignInButton>
  </SignedOut>
</nav>
{:else}
<nav class="nav-rail" class:dark class:black>
  <!-- Top items -->
  <div class="nav-group">
    {#each topItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a href={item.href} class="nav-item" class:active>
        <div class="icon-frame" class:active>
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          {#if item.icon === 'pickaxe'}
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
              <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
              <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
              <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
            </svg>
          {:else if item.icon === 'compass'}
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
            </svg>
          {:else if item.icon === 'backpack'}
            <div class="relative" bind:this={chestEl}>
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 10a4 4 0 014-4h8a4 4 0 014 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z" />
                <path d="M9 6V4a3 3 0 016 0v2" />
                <path d="M8 21v-5a2 2 0 012-2h4a2 2 0 012 2v5" />
                <path d="M20 10h-2" />
                <path d="M6 10H4" />
              </svg>
              {#if showPlusOne}
                <span class="plus-one">+1</span>
              {/if}
              {#if achievementsStore.unseenCount > 0}
                <span class="achievement-badge">{achievementsStore.unseenCount}</span>
              {/if}
            </div>
          {:else if item.icon === 'miners'}
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          {/if}
          <span class="nav-label" class:active>{item.label}</span>
        </div>
      </a>
    {/each}
  </div>

  <!-- History -->
  <div class="nav-group mt-sep">
    <button class="nav-item" class:active={historyOpen} onclick={(e) => { e.stopPropagation(); onhistoryclick?.(); }} aria-label="History">
      <div class="icon-frame" class:active={historyOpen}>
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12,7 12,12 15.5,14" />
        </svg>
        <span class="nav-label" class:active={historyOpen}>History</span>
      </div>
    </button>
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Bottom items -->
  <div class="nav-group">
    {#each bottomItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a href={item.href} class="nav-item" class:active>
        <div class="icon-frame" class:active>
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          {#if item.icon === 'book-open'}
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
          {/if}
          <span class="nav-label" class:active>{item.label}</span>
        </div>
      </a>
    {/each}
  </div>

  <!-- Auth -->
  <div class="auth-section">
    <SignedIn>
      <a
        href="/user"
        class="nav-item"
        aria-label="Profile"
      >
        <PixelAvatar avatarId={userProfile?.avatarId ?? null} minerConfig={userProfile?.minerConfig ?? null} size={72} fallbackInitials="?" cropUpper bgColor="blue" />
      </a>
    </SignedIn>
    <SignedOut>
      <SignInButton mode="modal" forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/mine'} asChild>
        {#snippet children({ signIn })}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="nav-item" onclick={signIn}>
            <div class="icon-frame">
              <div class="nails"><div class="nail"></div><div class="nail"></div></div>
              <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span class="nav-label">Sign in</span>
            </div>
          </div>
        {/snippet}
      </SignInButton>
    </SignedOut>
  </div>
</nav>
{/if}

{#if showGemFly}
  <div class="gem-fly" style={gemStyle}>
    <div class="gem-fly-glow"></div>
    <div class="gem-fly-bg">
      <svg xmlns="http://www.w3.org/2000/svg" class="gem-fly-icon" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.6));">
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    </div>
  </div>
{/if}

<style>
  /* ── Bottom nav (mobile) ── */
  .nav-bottom {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 6px 8px;
    padding-bottom: max(6px, env(safe-area-inset-bottom));
  }

  .bottom-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    border: none;
    background: none;
    color: #78716c;
    transition: color 0.2s ease;
  }

  .bottom-item.active {
    color: #facc15;
  }

  .bottom-item:hover {
    color: #d6d3d1;
  }

  .bottom-icon {
    width: 24px;
    height: 24px;
  }

  .bottom-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: inherit;
  }

  .dark .bottom-item {
    color: #57534e;
  }

  .dark .bottom-item.active {
    color: #facc15;
  }

  .dark .bottom-item:hover {
    color: #d6d3d1;
  }

  .black .bottom-item {
    color: #44403c;
  }

  .black .bottom-item.active {
    color: #facc15;
  }

  .black .bottom-item:hover {
    color: #78716c;
  }

  /* ── Nav rail ── */
  .nav-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 16px 0;
  }

  .nav-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .mt-sep {
    margin-top: 8px;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2px 8px;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    transition: background 0.2s ease;
    color: #a8a29e;
  }

  .nav-item:hover {
    background: #e7e5e4;
    color: #57534e;
  }

  .nav-item.active {
    color: #1c1917;
  }

  /* Icon frame — dark rounded container */
  .icon-frame {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 76px;
    height: 86px;
    border-radius: 12px;
    background: #e7e5e4;
    border: 1.5px solid blue;
    color: #57534e;
    transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }

  /* Nails */
  .nails {
    position: absolute;
    top: 7px;
    left: 9px;
    right: 9px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 1;
  }

  .nails-bottom {
    top: auto;
    bottom: 7px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  .icon-frame :global(svg) {
    color: #57534e;
    stroke: #57534e;
    transition: color 0.2s ease, stroke 0.2s ease;
  }

  .nav-item:hover .icon-frame:not(.active) {
    background: #d6d3d1;
    border-color: blue;
  }

  .nav-item:hover .icon-frame:not(.active) :global(svg) {
    color: #57534e;
    stroke: #57534e;
  }

  .icon-frame.active {
    background: #000000;
    border-color: blue;
    box-shadow: 0 0 8px rgba(250, 204, 21, 0.2);
    animation: frame-activate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes frame-activate {
    0% {
      transform: scale(1);
      background: #f5f5f4;
      border-color: transparent;
      box-shadow: none;
    }
    20% {
      transform: scale(0.88);
      background: #44403c;
    }
    50% {
      transform: scale(1.06);
      background: #000000;
      box-shadow: 0 0 14px rgba(250, 204, 21, 0.4);
    }
    75% {
      transform: scale(0.97);
    }
    100% {
      transform: scale(1);
      background: #000000;
      border-color: #292524;
      box-shadow: 0 0 8px rgba(250, 204, 21, 0.2);
    }
  }

  .icon-frame.active :global(svg) {
    color: #facc15;
    stroke: #facc15;
  }

  .nav-icon {
    width: 40px;
    height: 40px;
  }

  .nav-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a8a29e;
    transition: color 0.2s ease;
    z-index: 1;
  }

  .nav-label.active {
    color: #1c1917;
  }

  .auth-section {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #d6d3d1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Dark mode overrides */
  .dark .auth-section {
    border-top-color: #44403c;
  }

  .dark .nav-item:hover {
    background: #292524;
    color: #d6d3d1;
  }

  .dark .nav-item.active {
    color: #facc15;
  }

  .dark .icon-frame {
    background: #292524;
    border-color: blue;
    color: #a8a29e;
  }

  .dark .icon-frame :global(svg) {
    color: #a8a29e;
    stroke: #a8a29e;
  }

  .dark .icon-frame.active {
    background: #000000;
  }

  .dark .icon-frame.active :global(svg) {
    color: #facc15;
    stroke: #facc15;
  }

  .dark .nav-item:hover .icon-frame:not(.active) {
    background: #44403c;
    border-color: blue;
  }

  .dark .nav-item:hover .icon-frame:not(.active) :global(svg) {
    color: #d6d3d1;
    stroke: #d6d3d1;
  }

  .dark .nav-label {
    color: #78716c;
  }

  .dark .nav-label.active {
    color: #facc15;
  }

  /* Black mode (learning) — dimmer inactive icons */
  .black .icon-frame:not(.active) {
    background: #1a1a1a;
  }

  .black .icon-frame:not(.active) :global(svg) {
    color: #a8a29e;
    stroke: #a8a29e;
  }

  .black .nav-item:hover .icon-frame:not(.active) {
    background: #292524;
  }

  .black .nav-item:hover .icon-frame:not(.active) :global(svg) {
    color: #d6d3d1;
    stroke: #d6d3d1;
  }

  .black .nav-label:not(.active) {
    color: #44403c;
  }

  .black .nav-item:hover .nav-label:not(.active) {
    color: #78716c;
  }

  .gem-fly {
    position: fixed;
    z-index: 100;
    pointer-events: none;
    left: var(--start-x);
    top: var(--start-y);
    transform: translate(-50%, -50%);
    animation:
      fly-x 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards,
      fly-y 1.4s cubic-bezier(0.6, 0, 0.4, 1) forwards;
  }

  .gem-fly-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #000;
  }

  .gem-fly-icon {
    width: 28px;
    height: 28px;
    animation:
      gem-fly-spin 1.4s linear forwards,
      gem-fly-scale 1.4s ease-in-out forwards;
  }

  .gem-fly-glow {
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(250, 204, 21, 0.5) 0%, transparent 70%);
    animation: glow-fade 1.4s ease-out forwards;
    pointer-events: none;
  }

  @keyframes fly-x {
    0% { left: var(--start-x); }
    100% { left: var(--end-x); }
  }

  @keyframes fly-y {
    0% { top: var(--start-y); }
    40% { top: calc(var(--start-y) - 60px); }
    100% { top: var(--end-y); }
  }

  @keyframes gem-fly-spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(720deg); }
  }

  @keyframes gem-fly-scale {
    0% { scale: 1; opacity: 1; }
    15% { scale: 1.6; opacity: 1; }
    70% { scale: 1.2; opacity: 1; }
    100% { scale: 0.5; opacity: 0.8; }
  }

  @keyframes glow-fade {
    0% { opacity: 1; scale: 1; }
    30% { opacity: 0.8; scale: 1.5; }
    100% { opacity: 0; scale: 0.5; }
  }

  :global(.chest-land) {
    animation: chest-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes chest-bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.25); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  .plus-one {
    position: absolute;
    top: -6px;
    right: -10px;
    font-size: 14px;
    font-weight: 700;
    color: #facc15;
    text-shadow: 0 0 8px rgba(250, 204, 21, 0.6), 0 1px 2px rgba(0,0,0,0.3);
    animation: float-up 1s ease-out forwards;
    pointer-events: none;
  }

  @keyframes float-up {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1.4);
    }
    60% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-28px) scale(0.8);
    }
  }

  .achievement-badge {
    position: absolute;
    top: -4px;
    left: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    color: #000;
    background: #facc15;
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.4);
    pointer-events: none;
    z-index: 2;
  }
</style>
