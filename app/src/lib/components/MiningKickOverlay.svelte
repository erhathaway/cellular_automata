<script lang="ts">
  import { page } from '$app/stores';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { renderMinerToDataURL } from '$lib/miner/renderer';
  import type { MinerConfig } from '$lib/miner/types';

  let visible = $derived(automataStore.isMining);

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

  // Generate randomized cell positions for the automata pile
  // Pre-compute scatter x/y in JS for browser compatibility (no CSS trig)
  let pileCells = $derived.by(() => {
    if (!visible) return [];
    const cells: { x: number; y: number; size: number; color: string; delay: number; sx: number; sy: number; rot: number }[] = [];
    const colors = ['#38bdf8', '#22d3ee', '#a78bfa', '#f472b6', '#facc15', '#4ade80', '#fb923c', '#f87171'];
    const rng = (seed: number) => {
      let s = seed;
      return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    };
    const rand = rng(Date.now() % 10000);
    for (let i = 0; i < 28; i++) {
      const baseX = 55 + rand() * 22; // percent from left (pile center-right area)
      const baseY = 48 + rand() * 32; // percent from top
      const size = 6 + rand() * 12;
      const color = colors[Math.floor(rand() * colors.length)];
      // Scatter trajectory — pre-compute final x/y offsets
      const angleDeg = -40 + rand() * 220; // wide fan
      const angleRad = (angleDeg * Math.PI) / 180;
      const dist = 80 + rand() * 180; // pixels to travel
      const sx = Math.cos(angleRad) * dist;
      const sy = -Math.sin(angleRad) * dist; // negative = upward
      const delay = rand() * 0.35;
      const rot = 360 + rand() * 720;
      cells.push({ x: baseX, y: baseY, size, color, delay, sx, sy, rot });
    }
    return cells;
  });

  let showScatter = $state(false);
  let scatterTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (visible) {
      showScatter = false;
      // Kick lands at ~1.0s into the animation, trigger scatter then
      scatterTimer = setTimeout(() => {
        showScatter = true;
      }, 950);
      return () => clearTimeout(scatterTimer);
    } else {
      showScatter = false;
    }
  });
</script>

{#if visible && minerDataUrl}
  <div class="kick-overlay" class:scatter={showScatter}>
    <!-- The miner avatar doing the kick -->
    <div class="kicker">
      <img
        src={minerDataUrl}
        alt=""
        class="kicker-img"
        style="image-rendering: pixelated;"
      />
    </div>

    <!-- Pile of automata cells -->
    <div class="automata-pile">
      {#each pileCells as cell, i}
        <div
          class="pile-cell"
          style="
            left: {cell.x}%;
            top: {cell.y}%;
            width: {cell.size}px;
            height: {cell.size}px;
            background: {cell.color};
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

  /* ===== THE KICKER (avatar) ===== */
  .kicker {
    position: absolute;
    bottom: 8%;
    left: -25%;
    width: clamp(100px, 28%, 220px);
    z-index: 3;
    animation: kicker-enter 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    transform-origin: bottom center;
  }

  .kicker-img {
    width: 100%;
    height: auto;
    display: block;
    animation: kicker-kick 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    transform-origin: bottom center;
    filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.5))
            drop-shadow(0 4px 24px rgba(0, 0, 0, 0.5));
  }

  /* Kicker slides in from left, pauses, winds up, KICKS */
  @keyframes kicker-enter {
    0% {
      left: -28%;
      bottom: 8%;
    }
    /* Strut in confidently */
    30% {
      left: 8%;
      bottom: 10%;
    }
    /* Pause & wind up (shift back slightly) */
    48% {
      left: 5%;
      bottom: 10%;
    }
    /* KICK — lunge forward! */
    62% {
      left: 20%;
      bottom: 12%;
    }
    /* Follow through */
    75% {
      left: 22%;
      bottom: 12%;
    }
    /* Settle back, arms-folded vibe */
    100% {
      left: 16%;
      bottom: 10%;
    }
  }

  @keyframes kicker-kick {
    0% {
      transform: rotate(0deg);
    }
    /* Walking in */
    30% {
      transform: rotate(0deg);
    }
    /* Wind-up: lean back! */
    48% {
      transform: rotate(-18deg) translateX(-6%);
    }
    /* KICK! Lean forward hard, snap that leg out */
    60% {
      transform: rotate(22deg) translateX(10%);
    }
    /* Follow through */
    70% {
      transform: rotate(12deg) translateX(6%);
    }
    /* Bounce settle */
    85% {
      transform: rotate(-3deg);
    }
    /* Rest */
    100% {
      transform: rotate(0deg) translateX(0);
    }
  }

  /* ===== AUTOMATA PILE ===== */
  .automata-pile {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .pile-cell {
    position: absolute;
    border-radius: 2px;
    image-rendering: pixelated;
    box-shadow:
      inset -1px -1px 0 rgba(0,0,0,0.35),
      inset 1px 1px 0 rgba(255,255,255,0.1),
      0 0 4px rgba(255,255,255,0.08);
    /* Idle pile wobble */
    animation: pile-wobble 1.5s ease-in-out infinite alternate;
    animation-delay: var(--scatter-delay);
  }

  @keyframes pile-wobble {
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(1px, -2px) rotate(4deg); }
  }

  /* When the kick lands, scatter the cells! */
  .scatter .pile-cell {
    animation: cell-scatter 1.4s cubic-bezier(0.2, 0.6, 0.35, 1) forwards;
    animation-delay: var(--scatter-delay);
  }

  @keyframes cell-scatter {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    15% {
      transform: translate(0, -4px) rotate(0deg) scale(1.4);
      opacity: 1;
    }
    100% {
      transform: translate(var(--sx), var(--sy)) rotate(var(--rot)) scale(0.2);
      opacity: 0;
    }
  }

  /* ===== IMPACT BURST ===== */
  .impact-burst {
    position: absolute;
    left: 42%;
    bottom: 16%;
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

  /* Small screens: scale down */
  @media (max-width: 640px) {
    .kicker {
      width: clamp(60px, 24%, 130px);
    }

    .impact-burst {
      width: 40px;
      height: 40px;
    }
  }
</style>
