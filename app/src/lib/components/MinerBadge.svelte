<script lang="ts">
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
    discoveredAt?: string;
  }

  let discoveryInfo: DiscoveryInfo | null = $state(null);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;
  let lastConfigKey = '';

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
  <div class="body">
    {#if discoveryInfo?.found && !automataStore.isMining}
      <PixelAvatar
        avatarId={discoveryInfo.discoveredByAvatarId ?? null}
        size={40}
        fallbackInitials={discoveryInfo.discoveredBy?.[0]?.toUpperCase() ?? '?'}
      />
      <div class="info">
        <span class="label">Claimed by</span>
        <span class="name">{discoveryInfo.discoveredBy}</span>
        {#if discoveryInfo.discoveredAt}
          <span class="date">{timeAgo(discoveryInfo.discoveredAt)}</span>
        {/if}
      </div>
    {:else if discoveryInfo === null || automataStore.isMining}
      <div class="icon-placeholder">
        <svg class="search-sweep" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <div class="info">
        <span class="label">Surveying...</span>
      </div>
    {:else if !discoveryInfo.found}
      <div class="gem">
        <svg class="gem-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9Z" />
          <path d="M11 3 8 9l4 13 4-13-3-6" />
          <path d="M2 9h20" />
        </svg>
        <div class="gem-glow"></div>
      </div>
      <div class="info">
        <span class="label">Unclaimed territory</span>
        <span class="date">Stake your claim!</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .claim {
    position: relative;
    width: 180px;
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
    padding: 14px 16px 16px;
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
    font-size: 11px;
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
    gap: 8px;
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
    max-width: 150px;
    line-height: 1.3;
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
    width: 40px;
    height: 40px;
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
    width: 44px;
    height: 44px;
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

  @keyframes gem-spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }

  @keyframes gem-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
</style>
