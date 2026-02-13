<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'cyan',
    borderRadius = '6px',
    borderWidth = 1,
    active = false,
    disabled = false,
    nails: showNails = true,
    nailInset,
    class: className = '',
    style: extraStyle = '',
    children,
    ...rest
  }: {
    variant?: 'cyan' | 'yellow' | 'muted';
    borderRadius?: string;
    borderWidth?: number;
    active?: boolean;
    disabled?: boolean;
    nails?: boolean;
    nailInset?: { top: number; left: number };
    class?: string;
    style?: string;
    children: Snippet;
    [key: string]: any;
  } = $props();

  const INSETS = { cyan: { top: 5, left: 8 }, yellow: { top: 10, left: 12 }, muted: { top: 6, left: 10 } };
  const HIGHLIGHTS = { cyan: '#67e8f9', yellow: '#facc15', muted: '#facc15' };
  const NAIL_BG = { cyan: '#67e8f9', yellow: '#0e7490', muted: '#a8a29e' };
  const NAIL_GLOW = { cyan: '0 0 3px rgba(103, 232, 249, 0.25)', yellow: '0 0 3px rgba(14, 116, 144, 0.3)', muted: 'none' };

  const inset = $derived(nailInset ?? INSETS[variant]);
  const hoverable = $derived(variant !== 'muted');

  const panelStyle = $derived(
    `--sp-r:${borderRadius};--sp-bw:${borderWidth}px;--sp-hi:${HIGHLIGHTS[variant]};` +
    `--sp-n-bg:${NAIL_BG[variant]};--sp-n-gl:${NAIL_GLOW[variant]};--sp-n-op:${variant === 'muted' ? 0.45 : 1};` +
    `--sp-n-t:${inset.top}px;--sp-n-lr:${inset.left}px;` +
    (extraStyle ? ` ${extraStyle}` : '')
  );
</script>

<div
  class="steel-panel {active ? 'is-active' : ''} {disabled ? 'is-disabled' : ''} {hoverable ? 'hoverable' : ''} {className}"
  style={panelStyle}
  {...rest}
>
  {#if showNails}
    <div class="sp-nails"><div class="sp-nail"></div><div class="sp-nail"></div></div>
    <div class="sp-nails sp-nails-btm"><div class="sp-nail"></div><div class="sp-nail"></div></div>
  {/if}
  {@render children()}
</div>

<style>
  .steel-panel {
    position: relative;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 3px solid blue;
    border-radius: var(--sp-r);
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
    transition: border-color 0.15s, background-color 0.15s;
    background-clip: padding-box;
  }

  .steel-panel::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: var(--sp-r);
    background: conic-gradient(
      from var(--sp-glow-angle, 0deg),
      #ff000088,
      #ff880088,
      #ffff0088,
      #00ff0088,
      #0088ff88,
      #8800ff88,
      #ff00ff88,
      #ff000088
    );
    filter: blur(10px);
    opacity: 0.45;
    z-index: -1;
    animation: sp-rainbow-spin 4s linear infinite;
  }

  @keyframes sp-rainbow-spin {
    to { --sp-glow-angle: 360deg; }
  }

  @property --sp-glow-angle {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
  }

  .steel-panel::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: var(--sp-r);
    background: radial-gradient(ellipse at center, rgba(250, 204, 21, 0.35), rgba(250, 180, 0, 0.15) 50%, transparent 75%);
    filter: blur(16px);
    z-index: -2;
    animation: sp-gold-pulse 2.5s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes sp-gold-pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.06); }
  }

  .steel-panel.hoverable:hover:not(.is-disabled),
  .steel-panel.is-active {
    border-color: var(--sp-hi);
    background-color: #292524;
  }

  .steel-panel.is-disabled {
    border-color: blue;
  }

  .steel-panel.is-disabled .sp-nail {
    background: #44403c;
    box-shadow: none;
    opacity: 1;
  }

  .sp-nails {
    position: absolute;
    top: var(--sp-n-t);
    left: var(--sp-n-lr);
    right: var(--sp-n-lr);
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 1;
  }

  .sp-nails-btm {
    top: auto;
    bottom: var(--sp-n-t);
  }

  .sp-nail {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--sp-n-bg);
    box-shadow: var(--sp-n-gl);
    opacity: var(--sp-n-op);
  }
</style>
