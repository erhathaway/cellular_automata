<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    active = false,
    href,
    onclick,
    icon,
    badge,
  }: {
    label: string;
    active?: boolean;
    href?: string;
    onclick?: (e: MouseEvent) => void;
    icon: Snippet;
    badge?: Snippet;
  } = $props();
</script>

{#if href}
  <a {href} class="nav-item" class:active>
    <div class="icon-frame" class:active>
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      {@render icon()}
      <span class="nav-label" class:active>{label}</span>
    </div>
    {#if badge}{@render badge()}{/if}
  </a>
{:else}
  <button class="nav-item" class:active onclick={onclick} aria-label={label}>
    <div class="icon-frame" class:active>
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      {@render icon()}
      <span class="nav-label" class:active>{label}</span>
    </div>
    {#if badge}{@render badge()}{/if}
  </button>
{/if}

<style>
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2px 8px;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    transition: background 0.2s ease;
    color: #a8a29e;
  }

  .nav-item:hover {
    background: #e7e5e4;
    color: #57534e;
  }

  .nav-item.active {
    color: #1c1917;
  }

  .icon-frame {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 76px;
    height: 86px;
    border-radius: 12px;
    background: #e7e5e4;
    border: 1.5px solid blue;
    color: #57534e;
    transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }

  .nails {
    position: absolute;
    top: 7px;
    left: 9px;
    right: 9px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 1;
  }

  .nails-bottom {
    top: auto;
    bottom: 7px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  .icon-frame :global(svg) {
    color: #57534e;
    stroke: #57534e;
    transition: color 0.2s ease, stroke 0.2s ease;
  }

  .nav-item:hover .icon-frame:not(.active) {
    background: #d6d3d1;
    border-color: blue;
  }

  .nav-item:hover .icon-frame:not(.active) :global(svg) {
    color: #57534e;
    stroke: #57534e;
  }

  .icon-frame.active {
    background: #000000;
    border-color: blue;
    box-shadow: 0 0 8px rgba(250, 204, 21, 0.2);
    animation: frame-activate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes frame-activate {
    0% {
      transform: scale(1);
      background: #f5f5f4;
      border-color: transparent;
      box-shadow: none;
    }
    20% {
      transform: scale(0.88);
      background: #44403c;
    }
    50% {
      transform: scale(1.06);
      background: #000000;
      box-shadow: 0 0 14px rgba(250, 204, 21, 0.4);
    }
    75% {
      transform: scale(0.97);
    }
    100% {
      transform: scale(1);
      background: #000000;
      border-color: #292524;
      box-shadow: 0 0 8px rgba(250, 204, 21, 0.2);
    }
  }

  .icon-frame.active :global(svg) {
    color: #facc15;
    stroke: #facc15;
  }

  .icon-frame :global(svg) {
    width: 40px;
    height: 40px;
  }

  .nav-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a8a29e;
    transition: color 0.2s ease;
    z-index: 1;
  }

  .nav-label.active {
    color: #1c1917;
  }

  /* Dark mode — applied via parent .dark context */
  :global(.dark) .nav-item:hover {
    background: #292524;
    color: #d6d3d1;
  }

  :global(.dark) .nav-item.active {
    color: #facc15;
  }

  :global(.dark) .icon-frame {
    background: #292524;
    border-color: blue;
    color: #a8a29e;
  }

  :global(.dark) .icon-frame :global(svg) {
    color: #a8a29e;
    stroke: #a8a29e;
  }

  :global(.dark) .icon-frame.active {
    background: #000000;
  }

  :global(.dark) .icon-frame.active :global(svg) {
    color: #facc15;
    stroke: #facc15;
  }

  :global(.dark) .nav-item:hover .icon-frame:not(.active) {
    background: #44403c;
    border-color: blue;
  }

  :global(.dark) .nav-item:hover .icon-frame:not(.active) :global(svg) {
    color: #d6d3d1;
    stroke: #d6d3d1;
  }

  :global(.dark) .nav-label {
    color: #78716c;
  }

  :global(.dark) .nav-label.active {
    color: #facc15;
  }

  /* Black mode */
  :global(.black) .icon-frame:not(.active) {
    background: #1a1a1a;
  }

  :global(.black) .icon-frame:not(.active) :global(svg) {
    color: #a8a29e;
    stroke: #a8a29e;
  }

  :global(.black) .nav-item:hover .icon-frame:not(.active) {
    background: #292524;
  }

  :global(.black) .nav-item:hover .icon-frame:not(.active) :global(svg) {
    color: #d6d3d1;
    stroke: #d6d3d1;
  }

  :global(.black) .nav-label:not(.active) {
    color: #44403c;
  }

  :global(.black) .nav-item:hover .nav-label:not(.active) {
    color: #78716c;
  }
</style>
