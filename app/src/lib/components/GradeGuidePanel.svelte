<script lang="ts">
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { automataStore } from '$lib/stores/automata.svelte';

  let visible = $derived(viewerUiStore.gradeGuideVisible);

  // Mirror the 5-second dust timeout from ClaimCardContent
  let dustTimeoutReached = $state(false);
  let dustTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const shouldTrack = !automataStore.isMining && automataStore.isViableAutomata && automataStore.miningGrade === null;
    clearTimeout(dustTimeoutHandle);
    if (!shouldTrack) {
      dustTimeoutReached = false;
      return;
    }
    dustTimeoutHandle = setTimeout(() => {
      dustTimeoutReached = true;
    }, 5000);
    return () => clearTimeout(dustTimeoutHandle);
  });

  // Map the store grade to the row key used in the template
  let activeGrade = $derived.by(() => {
    const g = automataStore.miningGrade;
    if (g === 'excellent') return 'excellent';
    if (g === 'very good') return 'very-good';
    if (g === 'fair') return 'fair';
    if (g === 'low') return 'low';
    if (g === 'poor') return 'poor';
    // Only show dust when the timeout has actually been reached
    if (g === null && dustTimeoutReached) return 'dust';
    return null;
  });

  function dismiss() {
    viewerUiStore.hideGradeGuide();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="guide-panel" class:guide-visible={visible} onclick={dismiss}>
  <div class="guide-scroll">
    <div class="guide-header">
      <span class="guide-title">Ore Grades</span>
      <span class="guide-sub">What does your find mean?</span>
    </div>

    <div class="grade-list">
      <!-- EXCELLENT -->
      <div class="grade-row g-excellent" class:grade-active={activeGrade === 'excellent'}>
        <div class="grade-icon-wrap">
          <svg viewBox="0 0 32 32" fill="none" class="grade-svg">
            <path d="M16 2L20 10L28 12L22 18L24 28L16 23L8 28L10 18L4 12L12 10Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
            <circle cx="16" cy="14" r="4" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.25"/>
            <path d="M12 6L14 4M20 6L18 4M10 22L7 25M22 22L25 25" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          </svg>
        </div>
        <div class="grade-info">
          <span class="grade-name">EXCELLENT</span>
          <span class="grade-desc">The motherlode! Top shelf ore, the kind miners dream about. A legendary strike.</span>
        </div>
      </div>

      <!-- VERY GOOD -->
      <div class="grade-row g-very-good" class:grade-active={activeGrade === 'very-good'}>
        <div class="grade-icon-wrap">
          <svg viewBox="0 0 32 32" fill="none" class="grade-svg">
            <path d="M6 16L16 4L26 16L16 28Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.12"/>
            <path d="M11 16L16 9L21 16L16 23Z" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.2"/>
            <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
            <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
          </svg>
        </div>
        <div class="grade-info">
          <span class="grade-name">VERY GOOD</span>
          <span class="grade-desc">Premium ore with a healthy glow. Definitely worth staking a claim on.</span>
        </div>
      </div>

      <!-- FAIR -->
      <div class="grade-row g-fair" class:grade-active={activeGrade === 'fair'}>
        <div class="grade-icon-wrap">
          <svg viewBox="0 0 32 32" fill="none" class="grade-svg">
            <circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.08"/>
            <path d="M16 6V16L22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="2" fill="currentColor"/>
            <path d="M11 7L10 5M21 7L22 5M7 11L5 10M25 11L27 10" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>
        <div class="grade-info">
          <span class="grade-name">FAIR</span>
          <span class="grade-desc">Decent ore — nothing fancy, but honest work. A miner's bread and butter.</span>
        </div>
      </div>

      <!-- LOW -->
      <div class="grade-row g-low" class:grade-active={activeGrade === 'low'}>
        <div class="grade-icon-wrap">
          <svg viewBox="0 0 32 32" fill="none" class="grade-svg">
            <path d="M8 16C8 16 12 8 16 8C20 8 24 16 24 16C24 16 20 24 16 24C12 24 8 16 8 16Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
            <path d="M16 8C16 8 24 12 24 16C24 20 16 24 16 24C16 24 8 20 8 16C8 12 16 8 16 8Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
            <circle cx="16" cy="16" r="3" stroke="currentColor" stroke-width="1.3" fill="currentColor" fill-opacity="0.2"/>
          </svg>
        </div>
        <div class="grade-info">
          <span class="grade-name">LOW</span>
          <span class="grade-desc">Low-grade stuff. Won't make you rich, but it's still a find.</span>
        </div>
      </div>

      <!-- POOR -->
      <div class="grade-row g-poor" class:grade-active={activeGrade === 'poor'}>
        <div class="grade-icon-wrap">
          <svg viewBox="0 0 32 32" fill="none" class="grade-svg">
            <path d="M16 4L18 12L14 12L17 20L13 20L16 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M10 8L8 10M22 8L24 10M8 18L6 20M24 18L26 20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
          </svg>
        </div>
        <div class="grade-info">
          <span class="grade-name">POOR</span>
          <span class="grade-desc">Barely worth the swing. Crumbly, dull ore — but hey, a find's a find.</span>
        </div>
      </div>

      <!-- DUST -->
      <div class="grade-row g-dust" class:grade-active={activeGrade === 'dust'}>
        <div class="grade-icon-wrap">
          <svg viewBox="0 0 32 32" fill="none" class="grade-svg">
            <circle cx="10" cy="14" r="2" fill="currentColor" opacity="0.5"/>
            <circle cx="20" cy="10" r="1.5" fill="currentColor" opacity="0.35"/>
            <circle cx="16" cy="20" r="2.5" fill="currentColor" opacity="0.3"/>
            <circle cx="24" cy="18" r="1.8" fill="currentColor" opacity="0.25"/>
            <circle cx="8" cy="22" r="1.2" fill="currentColor" opacity="0.4"/>
            <circle cx="22" cy="24" r="1" fill="currentColor" opacity="0.2"/>
            <circle cx="14" cy="8" r="1.3" fill="currentColor" opacity="0.3"/>
            <path d="M6 28C10 22 14 26 18 20C22 14 26 18 28 12" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.2"/>
          </svg>
        </div>
        <div class="grade-info">
          <span class="grade-name">DUST</span>
          <span class="grade-desc">Ungraded. The surveyors couldn't make heads or tails of it. Swing again, prospector.</span>
        </div>
      </div>
    </div>

    <div class="guide-footer">
      <span class="tap-hint">tap anywhere to dismiss</span>
    </div>
  </div>
</div>

<style>
  .guide-panel {
    position: absolute;
    inset: 0;
    z-index: 50;
    background:
      radial-gradient(120% 120% at 0% 0%, #111111 0%, #0a0a0a 55%, #000000 100%);
    color: #fafaf9;
    overflow: hidden;
    cursor: pointer;

    /* Slide from right */
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
  }

  .guide-visible {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }

  .guide-scroll {
    height: 100%;
    overflow-y: auto;
    padding: 20px 16px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scrollbar-width: none;
  }

  .guide-scroll::-webkit-scrollbar {
    display: none;
  }

  .guide-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid #292524;
  }

  .guide-title {
    font-family: 'Pixelify Sans Variable', 'Space Grotesk', sans-serif;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    background: linear-gradient(
      90deg,
      #ff6b9d,
      #ffa64d,
      #ffe44d,
      #7ddf64,
      #4dc8ff,
      #a78bfa,
      #ff6b9d
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbow-shift 4s linear infinite;
  }

  @keyframes rainbow-shift {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .guide-sub {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #78716c;
    text-transform: uppercase;
  }

  .grade-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .grade-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1.5px solid #292524;
    background: rgba(255, 255, 255, 0.03);
    transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    animation: row-enter 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }

  .grade-row:nth-child(1) { animation-delay: 0.08s; }
  .grade-row:nth-child(2) { animation-delay: 0.14s; }
  .grade-row:nth-child(3) { animation-delay: 0.20s; }
  .grade-row:nth-child(4) { animation-delay: 0.26s; }
  .grade-row:nth-child(5) { animation-delay: 0.32s; }
  .grade-row:nth-child(6) { animation-delay: 0.38s; }

  @keyframes row-enter {
    0% {
      opacity: 0;
      transform: translateX(16px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* ===== Active grade highlight ===== */
  .grade-active {
    animation: grade-highlight 1.8s ease-in-out infinite !important;
    transform: scale(1.03);
    z-index: 2;
    position: relative;
  }

  .grade-active .grade-name {
    animation: name-glow 1.8s ease-in-out infinite;
  }

  .grade-active .grade-svg {
    animation: icon-bounce 1.2s ease-in-out infinite;
  }

  /* Non-active rows dim when there IS an active grade */
  .grade-row:not(.grade-active):has(~ .grade-active),
  .grade-active ~ .grade-row:not(.grade-active) {
    opacity: 0.35;
  }

  /* Excellent */
  .g-excellent.grade-active {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.15);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.3), inset 0 0 20px rgba(56, 189, 248, 0.08);
  }

  /* Very Good */
  .g-very-good.grade-active {
    border-color: #34d399;
    background: rgba(52, 211, 153, 0.15);
    box-shadow: 0 0 20px rgba(52, 211, 153, 0.3), inset 0 0 20px rgba(52, 211, 153, 0.08);
  }

  /* Fair */
  .g-fair.grade-active {
    border-color: #facc15;
    background: rgba(250, 204, 21, 0.15);
    box-shadow: 0 0 20px rgba(250, 204, 21, 0.3), inset 0 0 20px rgba(250, 204, 21, 0.08);
  }

  /* Low */
  .g-low.grade-active {
    border-color: #fb923c;
    background: rgba(251, 146, 60, 0.15);
    box-shadow: 0 0 20px rgba(251, 146, 60, 0.3), inset 0 0 20px rgba(251, 146, 60, 0.08);
  }

  /* Poor */
  .g-poor.grade-active {
    border-color: #f43f5e;
    background: rgba(244, 63, 94, 0.15);
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.3), inset 0 0 20px rgba(244, 63, 94, 0.08);
  }

  /* Dust */
  .g-dust.grade-active {
    border-color: #d4d4d8;
    background: rgba(212, 212, 216, 0.12);
    box-shadow: 0 0 20px rgba(212, 212, 216, 0.25), inset 0 0 20px rgba(212, 212, 216, 0.06);
  }

  @keyframes grade-highlight {
    0%, 100% {
      transform: scale(1.03);
      filter: brightness(1);
    }
    50% {
      transform: scale(1.05);
      filter: brightness(1.15);
    }
  }

  @keyframes name-glow {
    0%, 100% {
      letter-spacing: 0.12em;
    }
    50% {
      letter-spacing: 0.2em;
    }
  }

  @keyframes icon-bounce {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    25% {
      transform: scale(1.15) rotate(-8deg);
    }
    75% {
      transform: scale(1.15) rotate(8deg);
    }
  }

  .grade-icon-wrap {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .grade-svg {
    width: 32px;
    height: 32px;
    filter: drop-shadow(0 0 6px currentColor);
  }

  .grade-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .grade-name {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transition: letter-spacing 0.3s ease;
  }

  .grade-desc {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #d6d3d1;
  }

  /* Grade-specific colours */
  .g-excellent {
    border-color: rgba(56, 189, 248, 0.4);
    background: rgba(56, 189, 248, 0.06);
  }
  .g-excellent .grade-name {
    color: #38bdf8;
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
  }
  .g-excellent .grade-svg {
    color: #38bdf8;
  }

  .g-very-good {
    border-color: rgba(52, 211, 153, 0.4);
    background: rgba(52, 211, 153, 0.06);
  }
  .g-very-good .grade-name {
    color: #34d399;
    text-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
  }
  .g-very-good .grade-svg {
    color: #34d399;
  }

  .g-fair {
    border-color: rgba(250, 204, 21, 0.4);
    background: rgba(250, 204, 21, 0.06);
  }
  .g-fair .grade-name {
    color: #facc15;
    text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
  }
  .g-fair .grade-svg {
    color: #facc15;
  }

  .g-low {
    border-color: rgba(251, 146, 60, 0.4);
    background: rgba(251, 146, 60, 0.06);
  }
  .g-low .grade-name {
    color: #fb923c;
    text-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
  }
  .g-low .grade-svg {
    color: #fb923c;
  }

  .g-poor {
    border-color: rgba(244, 63, 94, 0.4);
    background: rgba(244, 63, 94, 0.06);
  }
  .g-poor .grade-name {
    color: #f43f5e;
    text-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
  }
  .g-poor .grade-svg {
    color: #f43f5e;
  }

  .g-dust {
    border-color: rgba(212, 212, 216, 0.3);
    background: rgba(212, 212, 216, 0.04);
  }
  .g-dust .grade-name {
    color: #d4d4d8;
    text-shadow: 0 0 10px rgba(212, 212, 216, 0.4);
  }
  .g-dust .grade-svg {
    color: #d4d4d8;
  }

  .guide-footer {
    text-align: center;
    padding-top: 4px;
  }

  .tap-hint {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #57534e;
    animation: hint-pulse 2s ease-in-out infinite;
  }

  @keyframes hint-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
</style>
