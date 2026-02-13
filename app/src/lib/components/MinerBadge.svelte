<script lang="ts">
  import { SignedIn, SignedOut, SignInButton } from 'svelte-clerk/client';
  import { page } from '$app/stores';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from './PixelAvatar.svelte';
  import { defaultLattice } from '$lib-core';

  interface DiscoveryInfo {
    found: boolean;
    discoveredBy?: string;
    discoveredByImageUrl?: string | null;
    discoveredByAvatarId?: string | null;
    discoveredByMinerConfig?: string | null;
    discoveredAt?: string;
  }

  let discoveryInfo: DiscoveryInfo | null = $state(null);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;
  let lastConfigKey = '';

  // Save state
  let saving = $state(false);
  let saved = $state(false);
  let saveError = $state('');

  // Animation state — claim gem flies OUT to chest
  let gemExiting = $state(false);
  let avatarEntering = $state(false);
  let gemEl = $state<HTMLElement>();

  // Animation state — mine gem flies IN from button
  let gemAreaEl = $state<HTMLElement>();
  let showMineGemFly = $state(false);
  let mineGemStyle = $state('');
  let gemLanded = $state(false);
  let gemArriving = $state(false);
  let mineGemInitialized = false;

  $effect(() => {
    const count = automataStore.mineGemAnimationCounter;
    if (mineGemInitialized && count > 0) {
      triggerMineGemAnimation();
    }
    mineGemInitialized = true;
  });

  function triggerMineGemAnimation() {
    if (!gemAreaEl) return;
    const rect = gemAreaEl.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    const origin = automataStore.mineGemOrigin;
    const startX = origin?.x ?? window.innerWidth / 2;
    const startY = origin?.y ?? window.innerHeight * 0.5;

    mineGemStyle = `--mg-start-x: ${startX}px; --mg-start-y: ${startY}px; --mg-end-x: ${targetX}px; --mg-end-y: ${targetY}px;`;
    gemArriving = true;
    showMineGemFly = true;
    gemLanded = false;
    setTimeout(() => {
      showMineGemFly = false;
      gemLanded = true;
      gemArriving = false;
      setTimeout(() => { gemLanded = false; }, 2000);
    }, 1200);
  }

  let userProfile = $derived(($page.data as any)?.userProfile as { displayName?: string | null; avatarId?: string | null; minerConfig?: string | null } | null);

  $effect(() => {
    const rule = automataStore.rule;
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    const lat = automataStore.lattice;
    const _claimed = automataStore.claimAnimationCounter;

    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

    const configKey = `${dim}:${ruleType}:${ruleDefinition}:${nr}:${lat}`;
    if (configKey !== lastConfigKey) {
      lastConfigKey = configKey;
      discoveryInfo = null;
      saved = false;
      saveError = '';
      gemExiting = false;
      avatarEntering = false;
    }

    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          d: String(dim),
          rt: ruleType,
          rd: ruleDefinition,
          nr: String(nr),
          ...(lat !== defaultLattice(dim) ? { lt: lat } : {}),
        });
        const res = await fetch(`/api/discovery?${params}`);
        if (res.ok) {
          const data = await res.json();
          discoveryInfo = data;
        } else {
          discoveryInfo = null;
        }
      } catch {
        discoveryInfo = null;
      }
    }, 500);
  });

  async function claim() {
    if (saving || saved) return;

    // Capture gem position NOW while it's still in the DOM
    let gemOrigin: { x: number; y: number } | null = null;
    if (gemEl) {
      const rect = gemEl.getBoundingClientRect();
      gemOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    saving = true;
    saveError = '';
    try {
      const data = automataStore.exportForSave();
      const thumbnail = automataStore.getCanvasDataURL?.() ?? undefined;

      const res = await fetch('/api/generation-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, thumbnail })
      });
      if (res.status === 409) {
        // Already exists — treat as success
      } else if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try {
          const body = await res.json();
          msg = body.message ?? msg;
        } catch {
          msg = (await res.text()) || msg;
        }
        throw new Error(msg);
      }

      // 2. Hide gem and launch the flying gem from the captured position
      if (gemOrigin) {
        automataStore.claimGemOrigin = gemOrigin;
      }
      gemExiting = true;
      // Immediately trigger the sidebar flying gem — it spawns at the badge gem's position
      automataStore.claimAnimationCounter++;

      // After the full flight lands (~1.4s flight + buffer), show avatar
      setTimeout(() => {
        saved = true;
        avatarEntering = true;
      }, 1800);

      const seedSnapshot = automataStore.getSeedSnapshot?.();
      if (seedSnapshot) {
        automataStore.savedSeed = seedSnapshot;
        automataStore.useSavedSeed = true;
      }
    } catch (e: any) {
      saveError = e.message ?? 'Failed to save';
    } finally {
      saving = false;
    }
  }

  let isUnclaimed = $derived(
    discoveryInfo !== null && !discoveryInfo.found && !automataStore.isMining && !gemArriving
  );
</script>

<div class="claim">
  <!-- Nails in the corners -->
  <div class="nails">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>
  <div class="nails nails-bottom">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>

  <!-- Header row with pickaxe inline -->
  <div class="header">
    <svg class="pickaxe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
      <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
      <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
      <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
    </svg>
    <span class="header-text">Mining Claim</span>
  </div>

  <div class="divider"></div>

  <!-- Content area -->
  <div class="body" bind:this={gemAreaEl} class:gem-landed={gemLanded}>
    {#if discoveryInfo?.found && !automataStore.isMining}
      <PixelAvatar
        avatarId={discoveryInfo.discoveredByAvatarId ?? null}
        minerConfig={discoveryInfo.discoveredByMinerConfig ?? null}
        size={72}
        fallbackInitials={discoveryInfo.discoveredBy?.[0]?.toUpperCase() ?? '?'}
        cropUpper
      />
      <div class="info">
        <span class="label">Claimed by</span>
        <span class="name">{discoveryInfo.discoveredBy}</span>
        {#if discoveryInfo.discoveredAt}
          <span class="date">{timeAgo(discoveryInfo.discoveredAt)}</span>
        {/if}
      </div>
    {:else if discoveryInfo === null || automataStore.isMining || gemArriving}
      <div class="icon-placeholder">
        <svg class="search-sweep" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <div class="info">
        <span class="label">Surveying...</span>
      </div>
    {:else if isUnclaimed && saved}
      <!-- Claimed: show avatar animating in -->
      <div class="avatar-enter" class:avatar-entering={avatarEntering}>
        <PixelAvatar
          avatarId={userProfile?.avatarId ?? null}
          minerConfig={userProfile?.minerConfig ?? null}
          size={72}
          fallbackInitials={userProfile?.displayName?.[0]?.toUpperCase() ?? '?'}
          cropUpper
        />
      </div>
      <div class="info">
        <span class="label" style="color: #22c55e;">Claimed!</span>
        <span class="date">Territory secured</span>
      </div>
    {:else if isUnclaimed}
      <SignedIn>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="unclaimed-action" onclick={claim}>
          {#if saving}
            <div class="icon-placeholder">
              <svg class="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <div class="info">
              <span class="label" style="color: #facc15;">Staking claim...</span>
            </div>
          {:else if saveError}
            <div class="gem" bind:this={gemEl}>
              <svg class="gem-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
              </svg>
              <div class="gem-glow"></div>
            </div>
            <div class="info">
              <span class="label" style="color: #ef4444;">Failed — tap to retry</span>
              <span class="date" style="color: #ef4444;">{saveError}</span>
            </div>
          {:else if gemExiting}
            <!-- Gem hidden — it's now the flying gem in NavSidebar -->
            <div class="gem gem-gone">
              <div class="gem-flash"></div>
            </div>
            <div class="info">
              <span class="label" style="color: #facc15;">Staking claim...</span>
            </div>
          {:else}
            <div class="gem" bind:this={gemEl}>
              <svg class="gem-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
              </svg>
              <div class="gem-glow"></div>
            </div>
            <div class="info">
              <span class="label">Unclaimed territory</span>
              <span class="date claim-cta">Stake your claim!</span>
            </div>
          {/if}
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'} asChild>
          {#snippet children({ signIn })}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="unclaimed-action" onclick={signIn}>
              <div class="gem">
                <svg class="gem-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3h12l4 6-10 13L2 9Z" />
                  <path d="M11 3 8 9l4 13 4-13-3-6" />
                  <path d="M2 9h20" />
                </svg>
                <div class="gem-glow"></div>
              </div>
              <div class="info">
                <span class="label">Unclaimed territory</span>
                <span class="date claim-cta">Sign in to claim</span>
              </div>
            </div>
          {/snippet}
        </SignInButton>
      </SignedOut>
    {/if}
  </div>
</div>

{#if showMineGemFly}
  <!-- Outer: horizontal movement (ease-in-out) -->
  <div class="mine-gem-fly-x" style={mineGemStyle}>
    <!-- Inner: vertical movement (up then gravity down) + scale -->
    <div class="mine-gem-fly-y">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    </div>
  </div>
{/if}

<style>
  .claim {
    position: relative;
    width: 280px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 2px solid #44403c;
    border-radius: 6px;
    padding: 24px 16px 28px;
    text-align: center;
  }

  .nails {
    position: absolute;
    top: 6px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 6px;
  }

  .nail {
    width: 6px;
    height: 6px;
    background: #78716c;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .pickaxe {
    width: 20px;
    height: 20px;
    color: #facc15;
    flex-shrink: 0;
  }

  .header-text {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #facc15;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 20%, #44403c 80%, transparent);
    margin-bottom: 12px;
  }

  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.2;
  }

  .name {
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #fafaf9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
    line-height: 1.3;
    margin: 6px 0;
  }

  .date {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
    line-height: 1.2;
  }

  .icon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    color: rgba(255, 255, 255, 0.25);
  }

  .search-sweep {
    animation: sweep 1.5s ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes sweep {
    0% { transform: translateX(-2px) rotate(-5deg); }
    50% { transform: translateX(2px) rotate(5deg); }
    100% { transform: translateX(-2px) rotate(-5deg); }
  }

  .gem {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
  }

  .gem-icon {
    color: #facc15;
    filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.6));
    animation: gem-spin 3s linear infinite;
  }

  .gem-glow {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(250, 204, 21, 0.25) 0%, transparent 70%);
    animation: gem-pulse 1.5s ease-in-out infinite;
    pointer-events: none;
  }

  .gem-gone .gem-icon,
  .gem-gone .gem-glow {
    display: none;
  }

  .gem-flash {
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(250, 204, 21, 0.7) 0%, transparent 70%);
    animation: flash-burst 0.4s ease-out forwards;
    pointer-events: none;
  }

  @keyframes gem-spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }

  @keyframes gem-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes flash-burst {
    0% {
      opacity: 1;
      transform: scale(0.8);
    }
    100% {
      opacity: 0;
      transform: scale(2);
    }
  }

  .avatar-enter {
    opacity: 0;
    transform: scale(0);
  }

  .avatar-entering {
    animation: avatar-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes avatar-pop-in {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .unclaimed-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .unclaimed-action:hover .claim-cta {
    color: #facc15;
  }

  .claim-cta {
    transition: color 0.15s ease;
  }

  .spin {
    animation: spinner 0.8s linear infinite;
  }

  @keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Flying gem from mine button into claim card — two-axis arc */
  .mine-gem-fly-x {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    top: 0;
    left: var(--mg-start-x);
    animation: mg-move-x 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .mine-gem-fly-y {
    position: relative;
    top: var(--mg-start-y);
    left: -14px;
    animation: mg-move-y 1.2s cubic-bezier(0.1, 0, 0.3, 1) forwards;
    filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.8));
  }

  /* Horizontal: smooth slide from button X to claim X */
  @keyframes mg-move-x {
    0% { left: var(--mg-start-x); }
    100% { left: var(--mg-end-x); }
  }

  /* Vertical: rise up from behind button, peak, then fall into claim */
  @keyframes mg-move-y {
    0% {
      top: calc(var(--mg-start-y) + 20px);
      opacity: 0;
      transform: scale(0.2);
    }
    15% {
      top: var(--mg-start-y);
      opacity: 0.8;
      transform: scale(0.6);
    }
    45% {
      top: calc(var(--mg-start-y) - 140px);
      opacity: 1;
      transform: scale(1.6);
    }
    100% {
      top: calc(var(--mg-end-y) - 14px);
      opacity: 0.5;
      transform: scale(0.7);
    }
  }

  /* Glow effect on claim card body when gem lands */
  .gem-landed {
    animation: gem-land-glow 1.5s ease-out;
  }

  @keyframes gem-land-glow {
    0% {
      filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.8));
    }
    30% {
      filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.5));
    }
    100% {
      filter: none;
    }
  }
</style>
