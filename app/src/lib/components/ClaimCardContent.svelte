<script lang="ts">
  import { SignedIn, SignedOut, SignInButton } from 'svelte-clerk/client';
  import PixelAvatar from './PixelAvatar.svelte';
  import { timeAgo } from '$lib/utils/timeAgo';
  import type { DiscoveryInfo } from '$lib/stores/discovery.svelte';

  let {
    discoveryInfo = null,
    isSurveying = false,
    notViable = false,
    isUnclaimed = false,
    saving = false,
    saved = false,
    saveError = '',
    gemExiting = false,
    avatarEntering = false,
    gemLanded = false,
    gemArriving = false,
    isMining = false,
    compact = false,
    userProfile = null,
    onclaim,
    gemEl = $bindable<HTMLElement | undefined>(undefined),
    gemAreaEl = $bindable<HTMLElement | undefined>(undefined),
  }: {
    discoveryInfo?: DiscoveryInfo | null;
    isSurveying?: boolean;
    notViable?: boolean;
    isUnclaimed?: boolean;
    saving?: boolean;
    saved?: boolean;
    saveError?: string;
    gemExiting?: boolean;
    avatarEntering?: boolean;
    gemLanded?: boolean;
    gemArriving?: boolean;
    isMining?: boolean;
    compact?: boolean;
    userProfile?: { displayName?: string | null; avatarId?: string | null; minerConfig?: string | null } | null;
    onclaim?: () => void;
    gemEl?: HTMLElement | undefined;
    gemAreaEl?: HTMLElement | undefined;
  } = $props();

  let avatarSize = $derived(compact ? 36 : (typeof window !== 'undefined' && window.innerWidth < 900 ? 48 : 72));
</script>

<div class="claim" class:compact>
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
    {#if discoveryInfo?.found && !isMining}
      <PixelAvatar
        avatarId={discoveryInfo.discoveredByAvatarId ?? null}
        minerConfig={discoveryInfo.discoveredByMinerConfig ?? null}
        size={avatarSize}
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
    {:else if isSurveying || gemArriving}
      <div class="icon-placeholder">
        <svg class="search-sweep icon-svg" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <div class="info">
        <span class="label surveying-text label-lg"><span>Surveying</span><span class="ellipsis"></span></span>
      </div>
    {:else if notViable}
      <div class="icon-placeholder">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      </div>
      <div class="info">
        <span class="label label-lg" style="margin-bottom: 8px;">No viable automata found</span>
        <span class="date date-lg">Mine again to search</span>
      </div>
    {:else if isUnclaimed && saved}
      <!-- Claimed: show avatar animating in -->
      <div class="avatar-enter" class:avatar-entering={avatarEntering}>
        <PixelAvatar
          avatarId={userProfile?.avatarId ?? null}
          minerConfig={userProfile?.minerConfig ?? null}
          size={avatarSize}
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
        <div class="unclaimed-action" onclick={onclaim}>
          {#if saving}
            <div class="icon-placeholder">
              <svg class="spin spinner-svg" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <div class="info">
              <span class="label" style="color: #facc15;">Staking claim...</span>
            </div>
          {:else if saveError}
            <div class="gem" bind:this={gemEl}>
              <svg class="gem-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <svg class="gem-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
              </svg>
              <div class="gem-glow"></div>
            </div>
            <div class="info">
              <span class="label label-title">Unclaimed automata</span>
              <span class="date claim-cta claim-flash date-title">Stake your claim!</span>
            </div>
          {/if}
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/mine'} asChild>
          {#snippet children({ signIn })}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="unclaimed-action" onclick={signIn}>
              <div class="gem">
                <svg class="gem-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3h12l4 6-10 13L2 9Z" />
                  <path d="M11 3 8 9l4 13 4-13-3-6" />
                  <path d="M2 9h20" />
                </svg>
                <div class="gem-glow"></div>
              </div>
              <div class="info">
                <span class="label label-title">Unclaimed automata</span>
                <span class="date claim-cta date-title">Sign in to claim</span>
              </div>
            </div>
          {/snippet}
        </SignInButton>
      </SignedOut>
    {/if}
  </div>
</div>

<style>
  .claim {
    position: relative;
    width: clamp(180px, 20vw, 280px);
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
    padding: clamp(14px, 2vw, 24px) clamp(10px, 1.2vw, 16px) clamp(16px, 2.2vw, 28px);
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
    width: clamp(4px, 0.5vw, 6px);
    height: clamp(4px, 0.5vw, 6px);
    background: #78716c;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 0.5vw, 6px);
    margin-bottom: clamp(4px, 0.5vw, 6px);
  }

  .pickaxe {
    width: clamp(14px, 1.5vw, 20px);
    height: clamp(14px, 1.5vw, 20px);
    color: #facc15;
    flex-shrink: 0;
  }

  .header-text {
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.1vw, 14px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #facc15;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 20%, #44403c 80%, transparent);
    margin-bottom: clamp(8px, 1vw, 12px);
  }

  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(8px, 1vw, 14px);
  }

  .info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: clamp(8px, 0.9vw, 10px);
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.2;
  }

  .label-lg {
    font-size: clamp(9px, 1vw, 13px);
  }

  .label-title {
    font-size: clamp(11px, 1.3vw, 16px);
  }

  .name {
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: clamp(11px, 1.2vw, 15px);
    font-weight: 600;
    color: #fafaf9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: clamp(150px, 18vw, 240px);
    line-height: 1.3;
    margin: clamp(3px, 0.4vw, 6px) 0;
  }

  .date {
    font-family: 'Space Mono', monospace;
    font-size: clamp(8px, 0.9vw, 10px);
    color: #a8a29e;
    line-height: 1.2;
  }

  .date-lg {
    font-size: clamp(9px, 1vw, 12px);
  }

  .date-title {
    font-size: clamp(10px, 1.1vw, 14px);
  }

  .icon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(48px, 5.5vw, 72px);
    height: clamp(48px, 5.5vw, 72px);
    color: rgba(255, 255, 255, 0.25);
  }

  .icon-svg {
    width: clamp(32px, 3.5vw, 48px);
    height: clamp(32px, 3.5vw, 48px);
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

  .surveying-text {
    display: inline-flex;
  }

  .ellipsis {
    display: inline-block;
    width: 1.5em;
    text-align: left;
  }

  .ellipsis::after {
    content: '';
    animation: ellipsis 1.5s steps(4, end) infinite;
  }

  @keyframes ellipsis {
    0% { content: ''; }
    25% { content: '.'; }
    50% { content: '..'; }
    75% { content: '...'; }
  }

  .gem {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(48px, 5.5vw, 72px);
    height: clamp(48px, 5.5vw, 72px);
  }

  .gem-icon {
    width: clamp(28px, 3vw, 40px);
    height: clamp(28px, 3vw, 40px);
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

  .spinner-svg {
    width: clamp(16px, 1.8vw, 24px);
    height: clamp(16px, 1.8vw, 24px);
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
    gap: clamp(4px, 0.6vw, 8px);
    cursor: pointer;
  }

  .unclaimed-action:hover .claim-cta {
    color: #facc15;
  }

  .claim-cta {
    transition: color 0.15s ease;
  }

  .claim-flash {
    color: #facc15;
    animation: gold-flash 1.5s ease-in-out infinite;
  }

  @keyframes gold-flash {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .spin {
    animation: spinner 0.8s linear infinite;
  }

  @keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  /* Compact mode — narrower card for smaller viewports */
  .compact {
    width: clamp(90px, 13vw, 130px);
    padding: 10px 8px 12px;
  }

  .compact .header {
    gap: 3px;
    margin-bottom: 3px;
  }

  .compact .pickaxe {
    display: none;
  }

  .compact .header-text {
    font-size: 8px;
  }

  .compact .divider {
    margin-bottom: 6px;
  }

  .compact .body {
    gap: 6px;
  }

  .compact .label {
    font-size: 7px;
  }

  .compact .label-lg {
    font-size: 8px;
  }

  .compact .label-title {
    font-size: 9px;
  }

  .compact .name {
    font-size: 9px;
    max-width: 120px;
    margin: 2px 0;
  }

  .compact .date {
    font-size: 7px;
  }

  .compact .date-lg {
    font-size: 8px;
  }

  .compact .date-title {
    font-size: 8px;
  }

  .compact .icon-placeholder {
    width: 36px;
    height: 36px;
  }

  .compact .icon-svg {
    width: 24px;
    height: 24px;
  }

  .compact .gem {
    width: 36px;
    height: 36px;
  }

  .compact .gem-icon {
    width: 22px;
    height: 22px;
  }

  .compact .spinner-svg {
    width: 14px;
    height: 14px;
  }

  .compact .nail {
    width: 4px;
    height: 4px;
  }
</style>
