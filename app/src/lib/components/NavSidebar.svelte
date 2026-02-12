<script lang="ts">
  import { page } from '$app/stores';
  import { SignedIn, SignedOut } from 'svelte-clerk/client';
  import { automataStore } from '$lib/stores/automata.svelte';
  import PixelAvatar from './PixelAvatar.svelte';

  type UserProfile = { displayName: string | null; avatarId: string | null; email: string | null } | null;

  let {
    userProfile = null,
    onsettingsclick,
    onhistoryclick,
    historyOpen = false,
  }: {
    userProfile?: UserProfile;
    onsettingsclick?: () => void;
    onhistoryclick?: () => void;
    historyOpen?: boolean;
  } = $props();

  const topItems = [
    { href: '/', label: 'Mine', icon: 'pickaxe' },
    { href: '/explore', label: 'Gallery', icon: 'compass' },
    { href: '/bookmarks', label: 'My Chest', icon: 'chest' },
  ];

  const bottomItems = [
    { href: '/docs', label: 'Learning', icon: 'book-open' },
    { href: '/intro', label: 'Home', icon: 'home' },
  ];

  function isActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/';
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

<nav class="flex h-full flex-col items-center py-4">
  <!-- Top items -->
  <div class="flex flex-col items-center gap-2">
    {#each topItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a
        href={item.href}
        class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors
          {active
            ? 'bg-yellow-50 text-yellow-600'
            : 'text-black/70 hover:text-black hover:bg-black/5'}"
      >
        {#if item.icon === 'pickaxe'}
          <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
            <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
            <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
            <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
          </svg>
        {:else if item.icon === 'compass'}
          <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
        {:else if item.icon === 'chest'}
          <div class="relative" bind:this={chestEl}>
            <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
              <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
              <line x1="4" y1="13" x2="20" y2="13" />
              <rect x="10" y="11" width="4" height="4" rx="1" />
            </svg>
            {#if showPlusOne}
              <span class="plus-one">+1</span>
            {/if}
          </div>
        {/if}
        <span class="text-[10px]">{item.label}</span>
      </a>
    {/each}
  </div>

  <!-- History -->
  <div class="mt-2 flex flex-col items-center">
    <button
      class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors
        {historyOpen
          ? 'bg-yellow-50 text-yellow-600'
          : 'text-black/70 hover:text-black hover:bg-black/5'}"
      onclick={() => onhistoryclick?.()}
      aria-label="History"
    >
      <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12,7 12,12 15.5,14" />
      </svg>
      <span class="text-[10px]">History</span>
    </button>
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Bottom items -->
  <div class="flex flex-col items-center gap-2">
    {#each bottomItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a
        href={item.href}
        class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors
          {active
            ? 'bg-yellow-50 text-yellow-600'
            : 'text-black/70 hover:text-black hover:bg-black/5'}"
      >
        {#if item.icon === 'book-open'}
          <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
        {:else if item.icon === 'home'}
          <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        {/if}
        <span class="text-[10px]">{item.label}</span>
      </a>
    {/each}
  </div>

  <!-- Auth -->
  <div class="mt-2 flex flex-col items-center border-t border-black/10 pt-3">
    <SignedIn>
      <button
        class="rounded-lg p-1 transition-colors hover:bg-black/5"
        onclick={() => onsettingsclick?.()}
        aria-label="Settings"
      >
        <PixelAvatar avatarId={userProfile?.avatarId ?? null} size={32} fallbackInitials="?" />
      </button>
    </SignedIn>
    <SignedOut>
      <a
        href="/sign-in"
        class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
      >
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="text-[10px]">Sign in</span>
      </a>
    </SignedOut>
  </div>
</nav>

{#if showGemFly}
  <div class="gem-fly" style={gemStyle}>
    <div class="gem-fly-glow"></div>
    <svg xmlns="http://www.w3.org/2000/svg" class="gem-fly-icon" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.6));">
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
  </div>
{/if}

<style>
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
</style>
