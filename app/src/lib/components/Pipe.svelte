<script lang="ts">
  interface Props {
    /** 'horizontal' or 'vertical' */
    direction?: 'horizontal' | 'vertical';
    /** 'glow' = glowing connector, 'metal' = structural tube with inner glow, 'joint' = metallic bar */
    variant?: 'glow' | 'metal' | 'joint';
    /** Color theme */
    color?: 'cyan' | 'yellow';
    /** CSS width value (e.g. '14px', 'clamp(20px, 3vw, 42px)') */
    width?: string;
    /** CSS height value */
    height?: string;
    /** Show metal flanges at pipe ends (metal variant only) */
    flanges?: boolean;
    /** Open one end — no border/rounding on that side (glow variant) */
    openEnd?: 'start' | 'end';
    /** Active state — brighter glow, faster animation */
    active?: boolean;
    /** Enable animations (pulse/breathe/flow) */
    animate?: boolean;
    /** Show dark backdrop behind pipe for depth */
    backdrop?: boolean;
    /** Additional inline styles (typically for positioning) */
    style?: string;
  }

  let {
    direction = 'horizontal',
    variant = 'glow',
    color = 'cyan',
    width = '14px',
    height = '14px',
    flanges = false,
    openEnd,
    active = false,
    animate = true,
    backdrop = false,
    style = '',
  }: Props = $props();
</script>

<div
  class="pipe {direction} {color}"
  class:active
  style="width: {width}; height: {height}; {style}"
  aria-hidden="true"
>
  {#if backdrop}
    <div class="backdrop-el"></div>
  {/if}

  {#if variant === 'glow'}
    <div
      class="glow-body"
      class:animate
      class:open-start={openEnd === 'start'}
      class:open-end={openEnd === 'end'}
    ></div>
  {:else if variant === 'metal'}
    <div class="metal-outer">
      <div class="metal-inner" class:active class:animate></div>
    </div>
    {#if flanges}
      <div class="flange flange-start" class:active></div>
      <div class="flange flange-end" class:active></div>
    {/if}
  {:else if variant === 'joint'}
    <div class="joint-body"></div>
  {/if}
</div>

<style>
  .pipe {
    position: relative;
    pointer-events: none;
  }

  /* ── Color themes (RGB triplets for rgba()) ── */
  .pipe.cyan {
    --pg: 34, 211, 238;
    --pga: 103, 232, 249;
    --pc: #22d3ee;
    --pc-dark: #0c4a6e;
    --pc-border: #0e7490;
  }

  .pipe.yellow {
    --pg: 250, 204, 21;
    --pga: 254, 240, 138;
    --pc: #fde047;
    --pc-dark: #ca8a04;
    --pc-border: #facc15;
  }

  /* ── Backdrop ── */
  .backdrop-el {
    position: absolute;
    inset: -2px;
    border-radius: 3px;
    background: #1c1917;
  }

  /* ══════════════════════════════════════════════
     Glow variant — thin glowing connector pipe
     ══════════════════════════════════════════════ */
  .glow-body {
    position: absolute;
    inset: 0;
    border-radius: 3px;
    border: 2px solid var(--pc-border);
    background: linear-gradient(90deg, var(--pc-dark) 0%, var(--pc) 50%, var(--pc-dark) 100%);
    box-shadow:
      0 0 10px rgba(var(--pg), 0.75),
      inset 0 0 6px rgba(var(--pga), 0.95);
  }

  .vertical .glow-body {
    background: linear-gradient(180deg, var(--pc-dark) 0%, var(--pc) 50%, var(--pc-dark) 100%);
  }

  .glow-body.animate {
    animation: glow-pulse 1.1s ease-in-out infinite;
  }

  /* Open end — horizontal */
  .glow-body.open-end {
    border-radius: 3px 0 0 3px;
    border-right: none;
  }
  .glow-body.open-start {
    border-radius: 0 3px 3px 0;
    border-left: none;
  }

  /* Open end — vertical */
  .vertical .glow-body.open-end {
    border-radius: 3px 3px 0 0;
    border-bottom: none;
  }
  .vertical .glow-body.open-start {
    border-radius: 0 0 3px 3px;
    border-top: none;
  }

  @keyframes glow-pulse {
    0% {
      box-shadow:
        0 0 8px rgba(var(--pg), 0.45),
        inset 0 0 4px rgba(var(--pg), 0.45);
    }
    50% {
      box-shadow:
        0 0 14px rgba(var(--pg), 0.9),
        inset 0 0 8px rgba(var(--pga), 0.85);
    }
    100% {
      box-shadow:
        0 0 8px rgba(var(--pg), 0.45),
        inset 0 0 4px rgba(var(--pg), 0.45);
    }
  }

  /* ══════════════════════════════════════════════
     Metal variant — structural tube with inner glow
     ══════════════════════════════════════════════ */
  .metal-outer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      #1c1917 0%,
      #292524 20%,
      #44403c 50%,
      #292524 80%,
      #1c1917 100%
    );
    border-radius: 3px;
    border: 1px solid #57534e;
    overflow: hidden;
  }

  /* Inner glow strip — runs along the pipe's length */
  .vertical .metal-inner {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    transform: translateX(-50%);
    background: rgba(var(--pg), 0.15);
    transition: all 0.3s;
  }

  .horizontal .metal-inner {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    transform: translateY(-50%);
    background: rgba(var(--pg), 0.15);
    transition: all 0.3s;
  }

  .metal-inner.active {
    background: rgba(var(--pg), 0.6);
    box-shadow:
      0 0 8px rgba(var(--pg), 0.5),
      0 0 16px rgba(var(--pg), 0.2);
  }

  .metal-inner.animate:not(.active) {
    box-shadow: 0 0 6px rgba(var(--pg), 0.3);
    animation: metal-breathe 1.1s ease-in-out infinite;
  }

  .metal-inner.active.animate {
    animation: metal-flow 0.6s linear infinite;
  }

  @keyframes metal-breathe {
    0%   { background: rgba(var(--pg), 0.15); }
    50%  { background: rgba(var(--pg), 0.5); }
    100% { background: rgba(var(--pg), 0.15); }
  }

  @keyframes metal-flow {
    0%   { background: rgba(var(--pg), 0.4); }
    50%  { background: rgba(var(--pg), 0.8); }
    100% { background: rgba(var(--pg), 0.4); }
  }

  /* Flanges — metal rings at pipe ends */
  .vertical .flange {
    position: absolute;
    left: -3px;
    right: -3px;
    height: 6px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 40%, #57534e 100%);
    border-radius: 2px;
    border: 1px solid #44403c;
  }
  .vertical .flange-start { top: -2px; }
  .vertical .flange-end { bottom: -2px; }

  .horizontal .flange {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 6px;
    background: linear-gradient(90deg, #57534e 0%, #78716c 40%, #57534e 100%);
    border-radius: 2px;
    border: 1px solid #44403c;
  }
  .horizontal .flange-start { left: -2px; }
  .horizontal .flange-end { right: -2px; }

  .flange.active {
    border-color: rgba(var(--pg), 0.3);
    box-shadow: 0 0 6px rgba(var(--pg), 0.15);
  }

  /* ══════════════════════════════════════════════
     Joint variant — simple metallic bar
     ══════════════════════════════════════════════ */
  .joint-body {
    position: absolute;
    inset: 0;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(var(--pg), 0.35);
  }

  .horizontal .joint-body {
    background: linear-gradient(90deg, #57534e 0%, #78716c 50%, #57534e 100%);
  }
</style>
