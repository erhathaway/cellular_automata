<script lang="ts">
  import { page } from '$app/stores';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { renderMinerToDataURL } from '$lib/miner/renderer';
  import type { MinerConfig } from '$lib/miner/types';

  let isMining = $derived(automataStore.isMining);

  // Only show the kick overlay every 5-10 mines (random interval)
  // Track the transition from not-mining → mining to count mine starts
  let prevMining = false;
  let mineCount = 0;
  let nextShowAt = Math.floor(5 + Math.random() * 6); // first show at mine 5-10
  let showThisMine = $state(false);

  $effect(() => {
    const mining = isMining;
    if (mining && !prevMining) {
      // Mining just started — count it
      mineCount++;
      if (mineCount >= nextShowAt) {
        showThisMine = true;
        mineCount = 0;
        nextShowAt = Math.floor(5 + Math.random() * 6);
      } else {
        showThisMine = false;
      }
    }
    prevMining = mining;
  });

  let visible = $derived(isMining && showThisMine);

  let userProfile = $derived(
    ($page.data as any)?.userProfile as {
      avatarId?: string | null;
      minerConfig?: string | null;
    } | null
  );

  let minerDataUrl = $derived.by(() => {
    if (!visible) return '';
    if (!userProfile?.minerConfig) return '';
    try {
      const config: MinerConfig =
        typeof userProfile.minerConfig === 'string'
          ? JSON.parse(userProfile.minerConfig)
          : userProfile.minerConfig;
      return renderMinerToDataURL(config, 4);
    } catch {
      return '';
    }
  });

  // Pick a random variant each time the overlay shows
  // 'side' = strut-in side kick from left
  // 'leap' = running jump-kick from right
  type Variant = 'side' | 'leap';
  let variant: Variant = $state('side');

  $effect(() => {
    if (visible) {
      variant = Math.random() < 0.5 ? 'side' : 'leap';
    }
  });

  // Scatter timing differs per variant
  let scatterDelay = $derived(variant === 'side' ? 950 : 1100);

  // Generate funky automata pile cells
  // Each cell has its own shape (wide/tall/square), initial tilt, glow color, wobble speed
  type PileCell = {
    x: number; y: number; w: number; h: number;
    color: string; glow: string; initRot: number;
    delay: number; sx: number; sy: number; rot: number;
    wobbleSpeed: number; wobbleAmt: number;
  };

  let pileCells = $derived.by(() => {
    if (!visible) return [];
    const cells: PileCell[] = [];

    // Funky color combos: [fill, glow-border]
    const palettes: [string, string][] = [
      ['#0a0a0a', '#facc15'],   // black + gold glow
      ['#0a0a0a', '#22d3ee'],   // black + cyan glow
      ['#1c1917', '#facc15'],   // charcoal + gold
      ['#1c1917', '#f472b6'],   // charcoal + pink
      ['#292524', '#a78bfa'],   // stone + purple
      ['#292524', '#22d3ee'],   // stone + cyan
      ['#facc15', '#0a0a0a'],   // gold fill + black border
      ['#22d3ee', '#0a0a0a'],   // cyan fill + black border
      ['#f472b6', '#0a0a0a'],   // pink fill + black border
      ['#a78bfa', '#1c1917'],   // purple fill + dark border
    ];

    const rng = (seed: number) => {
      let s = seed;
      return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    };
    const rand = rng(Date.now() % 10000);

    const pileCenterX = variant === 'side' ? 62 : 30;
    const pileCenterY = 62;

    for (let i = 0; i < 30; i++) {
      // Tight gaussian-ish cluster
      const spreadX = (rand() + rand() + rand()) / 3;
      const spreadY = (rand() + rand() + rand()) / 3;
      const baseX = pileCenterX - 8 + spreadX * 16;
      const baseY = pileCenterY - 10 + spreadY * 20;

      // Varied shapes: some tall, some wide, some square
      const shapeRoll = rand();
      let w: number, h: number;
      if (shapeRoll < 0.3) {
        // Wide boi
        w = 22 + rand() * 18; h = 12 + rand() * 8;
      } else if (shapeRoll < 0.6) {
        // Tall boi
        w = 12 + rand() * 8; h = 22 + rand() * 18;
      } else {
        // Chunky square
        const s = 16 + rand() * 16;
        w = s; h = s;
      }

      const [color, glow] = palettes[Math.floor(rand() * palettes.length)];
      const initRot = -25 + rand() * 50; // random starting tilt

      // Scatter trajectory
      const angleDeg = -40 + rand() * 220;
      const angleRad = (angleDeg * Math.PI) / 180;
      const dist = 120 + rand() * 250;
      const sx = Math.cos(angleRad) * dist;
      const sy = -Math.sin(angleRad) * dist;
      const delay = rand() * 0.3;
      const rot = 360 + rand() * 720;

      // Each cell gets its own wobble personality
      const wobbleSpeed = 1.0 + rand() * 1.5; // 1-2.5s
      const wobbleAmt = 3 + rand() * 8; // degrees

      cells.push({ x: baseX, y: baseY, w, h, color, glow, initRot, delay, sx, sy, rot, wobbleSpeed, wobbleAmt });
    }
    return cells;
  });

  let showScatter = $state(false);
  let scatterTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (visible) {
      showScatter = false;
      const d = scatterDelay;
      scatterTimer = setTimeout(() => {
        showScatter = true;
      }, d);
      return () => clearTimeout(scatterTimer);
    } else {
      showScatter = false;
    }
  });
</script>

{#if visible && minerDataUrl}
  <div
    class="kick-overlay"
    class:scatter={showScatter}
    class:variant-side={variant === 'side'}
    class:variant-leap={variant === 'leap'}
  >
    <!-- The miner avatar -->
    <div class="kicker">
      <img
        src={minerDataUrl}
        alt=""
        class="kicker-img"
        style="image-rendering: pixelated;"
      />
    </div>

    <!-- Pile of funky automata cells -->
    <div class="automata-pile">
      {#each pileCells as cell, i}
        <div
          class="pile-cell"
          style="
            left: {cell.x}%;
            top: {cell.y}%;
            width: {cell.w}px;
            height: {cell.h}px;
            background: {cell.color};
            border-color: {cell.glow};
            --glow-color: {cell.glow};
            --init-rot: {cell.initRot}deg;
            --wobble-amt: {cell.wobbleAmt}deg;
            --wobble-speed: {cell.wobbleSpeed}s;
            --sx: {cell.sx}px;
            --sy: {cell.sy}px;
            --rot: {cell.rot}deg;
            --scatter-delay: {cell.delay}s;
          "
        ></div>
      {/each}
    </div>

    <!-- Impact effect -->
    {#if showScatter}
      <div class="impact-burst"></div>
    {/if}
  </div>
{/if}

<style>
  .kick-overlay {
    position: absolute;
    inset: 0;
    z-index: 12;
    pointer-events: none;
    overflow: hidden;
    animation: overlay-fade-in 0.3s ease-out;
  }

  @keyframes overlay-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ===== SHARED KICKER BASE ===== */
  .kicker {
    position: absolute;
    z-index: 3;
    transform-origin: bottom center;
  }

  .kicker-img {
    width: 100%;
    height: auto;
    display: block;
    transform-origin: bottom center;
    filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.5))
            drop-shadow(0 4px 24px rgba(0, 0, 0, 0.5));
  }

  /* ============================================================
     VARIANT A: SIDE KICK — strut in from left, wind up, kick
     ============================================================ */
  .variant-side .kicker {
    bottom: 8%;
    left: -25%;
    width: clamp(100px, 28%, 220px);
    animation: side-enter 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .variant-side .kicker-img {
    animation: side-kick 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes side-enter {
    0%   { left: -28%; bottom: 8%; }
    30%  { left: 8%;   bottom: 10%; }
    48%  { left: 5%;   bottom: 10%; }
    62%  { left: 20%;  bottom: 12%; }
    75%  { left: 22%;  bottom: 12%; }
    100% { left: 16%;  bottom: 10%; }
  }

  @keyframes side-kick {
    0%   { transform: rotate(0deg); }
    30%  { transform: rotate(0deg); }
    48%  { transform: rotate(-18deg) translateX(-6%); }
    60%  { transform: rotate(22deg) translateX(10%); }
    70%  { transform: rotate(12deg) translateX(6%); }
    85%  { transform: rotate(-3deg); }
    100% { transform: rotate(0deg) translateX(0); }
  }

  .variant-side .impact-burst {
    left: 42%;
    bottom: 16%;
  }

  /* ============================================================
     VARIANT B: LEAP KICK — charge in from right, jump, flying kick
     The miner sprints in from the right side, leaps into the air,
     and delivers a big flying kick into the pile on the left.
     Mirror of the side kick but with a dramatic jump arc.
     ============================================================ */
  .variant-leap .kicker {
    bottom: 8%;
    right: -28%;
    left: auto;
    width: clamp(100px, 28%, 220px);
    animation: leap-enter 2.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .variant-leap .kicker-img {
    /* Flip horizontally — miner faces left */
    animation: leap-kick 2.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  /* Miner charges in from right, leaps up, flies across, lands kick */
  @keyframes leap-enter {
    0% {
      right: -30%;
      bottom: 8%;
    }
    /* Sprint in */
    20% {
      right: 15%;
      bottom: 10%;
    }
    /* Plant foot, crouch before jump */
    30% {
      right: 18%;
      bottom: 6%;
    }
    /* LAUNCH — leap into the air! */
    42% {
      right: 35%;
      bottom: 40%;
    }
    /* Peak of jump — flying through the air */
    50% {
      right: 48%;
      bottom: 42%;
    }
    /* Coming down — kick extends */
    60% {
      right: 56%;
      bottom: 22%;
    }
    /* IMPACT with the pile */
    68% {
      right: 58%;
      bottom: 10%;
    }
    /* Bounce back slightly from impact */
    78% {
      right: 55%;
      bottom: 14%;
    }
    /* Settle, standing tall */
    100% {
      right: 54%;
      bottom: 10%;
    }
  }

  @keyframes leap-kick {
    0% {
      /* Facing left, running */
      transform: scaleX(-1) rotate(0deg);
    }
    /* Sprinting in */
    20% {
      transform: scaleX(-1) rotate(5deg);
    }
    /* Crouch — compress before jump */
    30% {
      transform: scaleX(-1) rotate(-8deg) scaleY(0.85);
    }
    /* LAUNCH — spring up, body tilts back */
    42% {
      transform: scaleX(-1) rotate(-25deg) scaleY(1.1);
    }
    /* Peak — full flying kick pose, leaning forward */
    50% {
      transform: scaleX(-1) rotate(15deg) scaleY(1.05);
    }
    /* Extending kick — lean hard into it */
    60% {
      transform: scaleX(-1) rotate(30deg);
    }
    /* IMPACT — snap */
    68% {
      transform: scaleX(-1) rotate(18deg) scaleY(0.9);
    }
    /* Recoil */
    78% {
      transform: scaleX(-1) rotate(-5deg) scaleY(1.05);
    }
    /* Stand tall */
    100% {
      transform: scaleX(-1) rotate(0deg);
    }
  }

  .variant-leap .impact-burst {
    left: 32%;
    bottom: 18%;
  }

  /* ===== AUTOMATA PILE ===== */
  .automata-pile {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .pile-cell {
    position: absolute;
    border-radius: 3px;
    image-rendering: pixelated;
    border: 3px solid var(--glow-color, #facc15);
    box-shadow:
      0 0 10px var(--glow-color, #facc15),
      0 0 22px rgba(250, 204, 21, 0.2),
      inset 0 0 6px rgba(255, 255, 255, 0.08);
    transform: rotate(var(--init-rot, 0deg));
    animation: pile-funk var(--wobble-speed, 1.5s) ease-in-out infinite alternate;
    animation-delay: var(--scatter-delay);
  }

  @keyframes pile-funk {
    0% {
      transform: rotate(var(--init-rot, 0deg)) translate(0, 0) scale(1);
    }
    50% {
      transform: rotate(calc(var(--init-rot, 0deg) + var(--wobble-amt, 5deg))) translate(2px, -3px) scale(1.06);
    }
    100% {
      transform: rotate(calc(var(--init-rot, 0deg) - var(--wobble-amt, 5deg))) translate(-1px, 2px) scale(0.96);
    }
  }

  /* Scatter on kick impact */
  .scatter .pile-cell {
    animation: cell-scatter 1.4s cubic-bezier(0.2, 0.6, 0.35, 1) forwards;
    animation-delay: var(--scatter-delay);
  }

  @keyframes cell-scatter {
    0% {
      transform: rotate(var(--init-rot, 0deg)) translate(0, 0) scale(1);
      opacity: 1;
    }
    12% {
      transform: rotate(var(--init-rot, 0deg)) translate(0, -6px) scale(1.5);
      opacity: 1;
      box-shadow:
        0 0 20px var(--glow-color, #facc15),
        0 0 40px rgba(250, 204, 21, 0.4);
    }
    100% {
      transform: translate(var(--sx), var(--sy)) rotate(var(--rot)) scale(0.15);
      opacity: 0;
      box-shadow: none;
    }
  }

  /* ===== IMPACT BURST (shared, position set per variant) ===== */
  .impact-burst {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(250, 204, 21, 0.8) 0%, rgba(251, 146, 60, 0.3) 40%, transparent 70%);
    z-index: 4;
    animation: burst-pop 0.7s ease-out forwards;
    pointer-events: none;
  }

  @keyframes burst-pop {
    0% {
      transform: translate(-50%, 50%) scale(0.2);
      opacity: 1;
    }
    40% {
      transform: translate(-50%, 50%) scale(3);
      opacity: 0.9;
    }
    100% {
      transform: translate(-50%, 50%) scale(5);
      opacity: 0;
    }
  }

  /* Small screens */
  @media (max-width: 640px) {
    .kicker {
      width: clamp(60px, 24%, 130px) !important;
    }

    .impact-burst {
      width: 40px;
      height: 40px;
    }
  }
</style>
