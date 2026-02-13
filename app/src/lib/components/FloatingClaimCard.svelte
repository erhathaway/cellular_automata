<script lang="ts">
  import { page } from '$app/stores';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { discoveryStore } from '$lib/stores/discovery.svelte';
  import { historyStore } from '$lib/stores/history.svelte';
  import ClaimCardContent from './ClaimCardContent.svelte';
  import SteelPanel from './SteelPanel.svelte';
  import Pipe from './Pipe.svelte';

  // Mine-gem fly animation state
  let gemAreaEl = $state<HTMLElement>();
  let showMineGemFly = $state(false);
  let mineGemStyle = $state('');
  let gemLanded = $state(false);
  let gemArriving = $state(false);
  let mineGemInitialized = false;
  let mineGemLandTimer: ReturnType<typeof setTimeout> | undefined;
  let mineGemGlowTimer: ReturnType<typeof setTimeout> | undefined;
  let gemRunId = 0;
  let gemEl = $state<HTMLElement>();

  function resetGemState() {
    clearTimeout(mineGemLandTimer);
    clearTimeout(mineGemGlowTimer);
    gemRunId++;
    showMineGemFly = false;
    gemLanded = false;
    gemArriving = false;
  }

  // Reset gem animation state when a new mine starts
  $effect(() => {
    if (automataStore.isMining) {
      resetGemState();
    }
  });

  // Watch mine gem animation counter
  $effect(() => {
    const count = automataStore.mineGemAnimationCounter;
    if (mineGemInitialized && count > 0) {
      triggerMineGemAnimation();
    }
    mineGemInitialized = true;
  });

  function triggerMineGemAnimation() {
    if (!gemAreaEl || !automataStore.isViableAutomata || automataStore.isMining || historyStore.cursorIndex >= 0) return;

    resetGemState();
    const thisRun = gemRunId;

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
    mineGemLandTimer = setTimeout(() => {
      if (gemRunId !== thisRun) return;
      showMineGemFly = false;
      gemLanded = true;
      gemArriving = false;
      mineGemGlowTimer = setTimeout(() => {
        if (gemRunId !== thisRun) return;
        gemLanded = false;
      }, 2000);
    }, 2400);
  }

  let userProfile = $derived(($page.data as any)?.userProfile as { displayName?: string | null; avatarId?: string | null; minerConfig?: string | null } | null);

  // Visibility: show whenever automata is viable and not actively mining
  // (includes surveying state, so the mine-gem has a target to fly to)
  let visible = $derived(
    !automataStore.isMining && !discoveryStore.notViable
  );

  // Register/unregister gemAreaEl on automataStore
  $effect(() => {
    if (visible && gemAreaEl) {
      automataStore.floatingClaimCardEl = gemAreaEl;
    }
    return () => {
      if (automataStore.floatingClaimCardEl === gemAreaEl) {
        automataStore.floatingClaimCardEl = null;
      }
    };
  });

  // Set gemEl on discovery store for claim position capture
  $effect(() => {
    discoveryStore.setGemEl(gemEl ?? null);
  });

  function handleClaim() {
    discoveryStore.claim();
  }
</script>

<div class="floating-claim-wrapper" class:visible>
  <div class="pipes-right">
    <Pipe variant="metal" color="yellow" width="40px" height="14px" flanges />
    <Pipe variant="metal" color="yellow" width="40px" height="14px" flanges />
  </div>
  <SteelPanel variant="yellow">
    <ClaimCardContent
      discoveryInfo={discoveryStore.discoveryInfo}
      isSurveying={discoveryStore.isSurveying}
      notViable={discoveryStore.notViable}
      isUnclaimed={discoveryStore.isUnclaimed}
      saving={discoveryStore.saving}
      saved={discoveryStore.saved}
      saveError={discoveryStore.saveError}
      gemExiting={discoveryStore.gemExiting}
      avatarEntering={discoveryStore.avatarEntering}
      {gemLanded}
      {gemArriving}
      isMining={automataStore.isMining}
      {userProfile}
      onclaim={handleClaim}
      bind:gemEl
      bind:gemAreaEl
    />
  </SteelPanel>
</div>

{#if showMineGemFly}
  <!-- Outer: horizontal movement (ease-in-out) -->
  <div class="mine-gem-fly-x" style={mineGemStyle}>
    <!-- Inner: vertical movement (up then gravity down) + scale -->
    <div class="mine-gem-fly-y">
      <div class="mine-gem-fly-bg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9Z" />
          <path d="M11 3 8 9l4 13 4-13-3-6" />
          <path d="M2 9h20" />
        </svg>
      </div>
    </div>
  </div>
{/if}

<style>
  .floating-claim-wrapper {
    position: relative;
    transform: translateX(calc(100% + 60px));
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .floating-claim-wrapper.visible {
    transform: translateX(0);
  }

  .pipes-right {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 2;
  }

  .mine-gem-fly-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #000;
  }

  /* Flying gem from mine button into floating claim card — two-axis arc */
  .mine-gem-fly-x {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    top: 0;
    left: var(--mg-start-x);
    animation: mg-move-x 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .mine-gem-fly-y {
    position: relative;
    top: var(--mg-start-y);
    left: -24px;
    animation: mg-move-y 2.4s cubic-bezier(0.1, 0, 0.3, 1) forwards;
    filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.8));
  }

  @keyframes mg-move-x {
    0% { left: var(--mg-start-x); }
    100% { left: var(--mg-end-x); }
  }

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
      top: calc(var(--mg-end-y) - 24px);
      opacity: 0.5;
      transform: scale(0.7);
    }
  }
</style>
