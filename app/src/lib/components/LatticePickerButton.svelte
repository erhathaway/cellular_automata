<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { LATTICE_REGISTRY } from '$lib-core';
  import type { LatticeType } from '$lib-core';

  let { disabled = false }: { disabled?: boolean } = $props();

  let open = $state(false);
  let rootEl = $state<HTMLDivElement>();

  type LatticeOption = {
    key: LatticeType | 'random';
    label: string;
    dim: string;
  };

  const options: LatticeOption[] = [
    { key: 'random', label: 'Random', dim: '' },
    ...Object.entries(LATTICE_REGISTRY)
      .filter(([, def]) => def.dimension === 2)
      .map(([key, def]) => ({
        key: key as LatticeType,
        label: def.label,
        dim: '',
      })),
  ];

  const current = $derived.by(
    () => options.find((o) => o.key === automataStore.miningLattice) ?? options[0]
  );

  function toggle() {
    if (disabled) return;
    open = !open;
  }

  function selectLattice(key: LatticeType | 'random') {
    automataStore.setMiningLattice(key);
    open = false;
  }

  function onWindowPointerDown(e: PointerEvent) {
    if (!open || !rootEl) return;
    const target = e.target as Node | null;
    if (target && !rootEl.contains(target)) {
      open = false;
    }
  }

  onMount(() => {
    window.addEventListener('pointerdown', onWindowPointerDown);
    return () => {
      window.removeEventListener('pointerdown', onWindowPointerDown);
    };
  });
</script>

<div class="lattice-root" bind:this={rootEl}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lattice-btn {open ? 'open' : ''} {disabled ? 'is-disabled' : ''}" onclick={toggle}>
    <div class="nails">
      <div class="nail"></div>
      <div class="nail"></div>
    </div>
    <div class="nails nails-bottom">
      <div class="nail"></div>
      <div class="nail"></div>
    </div>

    <span class="pretitle">Lattice</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="grid-icon" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- 3x3 grid of dots connected by lines -->
      <line class="grid-line" x1="6" y1="6" x2="18" y2="6" />
      <line class="grid-line" x1="6" y1="12" x2="18" y2="12" />
      <line class="grid-line" x1="6" y1="18" x2="18" y2="18" />
      <line class="grid-line" x1="6" y1="6" x2="6" y2="18" />
      <line class="grid-line" x1="12" y1="6" x2="12" y2="18" />
      <line class="grid-line" x1="18" y1="6" x2="18" y2="18" />
      <circle class="grid-dot" cx="6" cy="6" r="1.8" />
      <circle class="grid-dot" cx="12" cy="6" r="1.8" />
      <circle class="grid-dot" cx="18" cy="6" r="1.8" />
      <circle class="grid-dot" cx="6" cy="12" r="1.8" />
      <circle class="grid-dot" cx="12" cy="12" r="1.8" />
      <circle class="grid-dot" cx="18" cy="12" r="1.8" />
      <circle class="grid-dot" cx="6" cy="18" r="1.8" />
      <circle class="grid-dot" cx="12" cy="18" r="1.8" />
      <circle class="grid-dot" cx="18" cy="18" r="1.8" />
    </svg>

    <span class="label">{current.label}</span>

    {#if disabled}
      <div class="disabled-overlay">
        <div class="cross-line cross-line-1"></div>
        <div class="cross-line cross-line-2"></div>
        <div class="disabled-pill">Advanced Mode</div>
      </div>
    {/if}
  </div>

  {#if open}
    <div class="popup">
      <div class="popup-title">Lattice</div>
      {#each options as option}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="option {automataStore.miningLattice === option.key ? 'active' : ''}"
          onclick={() => selectLattice(option.key)}
        >
          <div class="option-left">
            <div class="option-label" class:option-label-gold={option.key === 'random'}>{option.label}</div>
          </div>
          {#if option.dim}
            <div class="option-dim">{option.dim}</div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lattice-root {
    position: relative;
  }

  .lattice-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: clamp(10px, 2vw, 18px) clamp(12px, 2vw, 22px);
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 1px solid #44403c;
    border-radius: 6px;
    color: #67e8f9;
    transition: border-color 0.15s, background-color 0.15s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
    min-height: 0;
  }

  .lattice-btn:hover:not(.is-disabled),
  .lattice-btn.open {
    border-color: #67e8f9;
    background-color: #292524;
  }

  .lattice-btn.is-disabled {
    cursor: not-allowed;
    pointer-events: auto;
    border-color: #292524;
    color: #44403c;
  }

  .lattice-btn.is-disabled .grid-icon {
    filter: none;
  }

  .lattice-btn.is-disabled .grid-line {
    stroke: #292524;
  }

  .lattice-btn.is-disabled .grid-dot {
    fill: #44403c;
    stroke: #292524;
  }

  .lattice-btn.is-disabled .label {
    color: #44403c;
  }

  .lattice-btn.is-disabled .pretitle {
    color: #78590a;
  }

  .lattice-btn.is-disabled .nail {
    background: #44403c;
    box-shadow: none;
  }

  .grid-icon {
    width: clamp(24px, 4vw, 40px);
    height: clamp(24px, 4vw, 40px);
    flex-shrink: 0;
    filter: drop-shadow(0 0 7px rgba(103, 232, 249, 0.6));
  }

  .grid-line {
    stroke: #164e63;
    stroke-width: 1.5;
  }

  .grid-dot {
    fill: #67e8f9;
    stroke: #082f49;
    stroke-width: 0.8;
  }

  .pretitle {
    position: absolute;
    top: 8px;
    left: 74px;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    pointer-events: none;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.5vw, 13px);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #cffafe;
    white-space: nowrap;
  }

  .popup {
    position: absolute;
    right: 0;
    bottom: calc(100% + 10px);
    width: 240px;
    background: #1c1917;
    border: 2px solid #0e7490;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    padding: 8px;
    z-index: 40;
    max-height: 400px;
    overflow-y: auto;
  }

  .popup-title {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a5f3fc;
    margin: 2px 4px 8px 4px;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #44403c;
    background: #292524;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s, transform 0.12s;
    margin-bottom: 6px;
  }

  .option:last-child {
    margin-bottom: 0;
  }

  .option:hover {
    border-color: #22d3ee;
    background: #292524;
    transform: translateX(-1px);
  }

  .option.active {
    border-color: #67e8f9;
    box-shadow: inset 0 0 0 1px rgba(103, 232, 249, 0.3);
    background: #0c4a6e33;
  }

  .option-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .option-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #e0f2fe;
    line-height: 1.1;
  }

  .option-label-gold {
    color: #facc15;
  }

  .option-dim {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #67e8f9;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nails {
    position: absolute;
    top: 5px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 5px;
  }

  .nail {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #67e8f9;
    box-shadow: 0 0 3px rgba(103, 232, 249, 0.25);
  }

  .disabled-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 2;
  }

  .cross-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 110%;
    height: 1px;
    background: #44403c;
    transform-origin: center;
  }

  .cross-line-1 {
    transform: translate(-50%, -50%) rotate(25deg);
  }

  .cross-line-2 {
    transform: translate(-50%, -50%) rotate(-25deg);
  }

  .disabled-pill {
    position: relative;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
    background: #1c1917;
    border: 1px solid #44403c;
    border-radius: 10px;
    padding: 3px 10px;
    white-space: nowrap;
  }

  @media (max-width: 700px) {
    .label {
      display: none;
    }
  }
</style>
