<script lang="ts">
  import { page } from '$app/stores';
  import { SignedIn, SignedOut, SignInButton } from 'svelte-clerk/client';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { achievementsStore } from '$lib/stores/achievements.svelte';
  import PixelAvatar from './PixelAvatar.svelte';
  import NavButton from './NavButton.svelte';

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
    <NavButton href="/mine" label="Mine" active={isActive($page.url.pathname, '/mine')}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
          <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
          <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
          <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
        </svg>
      {/snippet}
    </NavButton>

    <NavButton href="/gallery" label="Gallery" active={isActive($page.url.pathname, '/gallery')}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
        </svg>
      {/snippet}
    </NavButton>

    <NavButton href="/backpack" label="Backpack" active={isActive($page.url.pathname, '/backpack')}>
      {#snippet icon()}
        <div class="relative" bind:this={chestEl}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
      {/snippet}
    </NavButton>

    <NavButton href="/miners" label="Miners" active={isActive($page.url.pathname, '/miners')}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      {/snippet}
    </NavButton>
  </div>

  <!-- History -->
  <div class="nav-group mt-sep">
    <NavButton label="History" active={historyOpen} onclick={(e) => { e.stopPropagation(); onhistoryclick?.(); }}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12,7 12,12 15.5,14" />
        </svg>
      {/snippet}
    </NavButton>
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Bottom items -->
  <div class="nav-group">
    <NavButton href="/handbook" label="Handbook" active={isActive($page.url.pathname, '/handbook')}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      {/snippet}
    </NavButton>
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
          <NavButton label="Sign in" onclick={signIn}>
            {#snippet icon()}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            {/snippet}
          </NavButton>
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

  /* Auth section still uses .nav-item for the profile avatar link */
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

  .auth-section {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #d6d3d1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dark .auth-section {
    border-top-color: #44403c;
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
