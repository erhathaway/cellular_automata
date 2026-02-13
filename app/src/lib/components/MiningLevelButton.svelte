<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import SteelPanel from '$lib/components/SteelPanel.svelte';
  import type { MiningDifficulty } from '$lib/stores/automata.svelte';

  let { disabled = false }: { disabled?: boolean } = $props();

  let open = $state(false);
  let rootEl = $state<HTMLDivElement>();

  const options: Array<{
    key: MiningDifficulty;
    label: string;
    range: string;
    note: string;
  }> = [
    { key: 'random', label: 'Random', range: '', note: '' },
    { key: 'easy', label: 'Easy', range: '', note: '' },
    { key: 'medium', label: 'Medium', range: '', note: '' },
    { key: 'hard', label: 'Hard', range: '', note: '' },
  ];

  const current = $derived.by(
    () => options.find((o) => o.key === automataStore.miningDifficulty) ?? options[1]
  );

  function toggle() {
    if (disabled) return;
    open = !open;
  }

  function selectDifficulty(key: MiningDifficulty) {
    automataStore.setMiningDifficulty(key);
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

<div class="level-root" bind:this={rootEl}>
  <SteelPanel variant="cyan" active={open} {disabled} onclick={toggle}>
    <div class="level-btn" class:is-disabled={disabled}>
      <span class="pretitle">Level</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="dial" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle class="dial-rim" cx="12" cy="12" r="9" />
        <circle class="dial-face" cx="12" cy="12" r="7" />
        <line class="dial-tick" x1="7.7" y1="16.3" x2="9.1" y2="14.9" />
        <line class="dial-tick" x1="12" y1="6.1" x2="12" y2="8.1" />
        <line class="dial-tick" x1="16.3" y1="16.3" x2="14.9" y2="14.9" />
        <circle class="dial-hub" cx="12" cy="12" r="2.2" />
        <line
          class="dial-needle"
          x1="12"
          y1="12"
          x2={current.key === 'easy' ? '8.4' : current.key === 'hard' ? '15.6' : '12'}
          y2={current.key === 'easy' ? '8.6' : current.key === 'hard' ? '8.6' : '6.6'}
        />
        <path
          class="dial-tip"
          d={current.key === 'easy'
            ? 'M8.1 8.3 L9.1 8.5 L8.5 9.1 Z'
            : current.key === 'hard'
              ? 'M15.9 8.3 L15.5 9.1 L14.9 8.5 Z'
              : 'M11.5 6.2 L12.5 6.2 L12 5.2 Z'}
        />
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
  </SteelPanel>

  {#if open}
    <div class="popup">
      <div class="popup-title">Mining Level</div>
      {#each options as option}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="option {automataStore.miningDifficulty === option.key ? 'active' : ''}"
          onclick={() => selectDifficulty(option.key)}
        >
          <div class="option-left">
            <div class="option-label" class:option-label-gold={option.key === 'random'}>{option.label}</div>
          </div>
          <div class="option-range">{option.range}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .level-root {
    position: relative;
  }

  .level-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: clamp(10px, 2vw, 18px) clamp(12px, 2vw, 22px);
    color: #67e8f9;
    min-height: 0;
  }

  .level-btn.is-disabled {
    cursor: not-allowed;
    pointer-events: auto;
    color: #44403c;
  }

  .level-btn.is-disabled .dial {
    filter: none;
  }

  .level-btn.is-disabled .dial-rim {
    stroke: #44403c;
  }

  .level-btn.is-disabled .dial-face {
    stroke: #292524;
  }

  .level-btn.is-disabled .dial-tick {
    stroke: #44403c;
    opacity: 0.5;
  }

  .level-btn.is-disabled .dial-hub {
    fill: #44403c;
    stroke: #292524;
  }

  .level-btn.is-disabled .dial-needle {
    stroke: #57534e;
  }

  .level-btn.is-disabled .dial-tip {
    fill: #57534e;
    stroke: #44403c;
  }

  .level-btn.is-disabled .label {
    color: #44403c;
  }

  .level-btn.is-disabled .pretitle {
    color: #78590a;
  }

  .dial {
    width: clamp(24px, 4vw, 40px);
    height: clamp(24px, 4vw, 40px);
    flex-shrink: 0;
    filter: drop-shadow(0 0 7px rgba(103, 232, 249, 0.6));
  }

  .dial-rim {
    stroke: #67e8f9;
    stroke-width: 2.1;
  }

  .dial-face {
    stroke: #164e63;
    stroke-width: 1.8;
  }

  .dial-tick {
    stroke: #a5f3fc;
    stroke-width: 1.7;
    opacity: 0.95;
  }

  .dial-hub {
    fill: #67e8f9;
    stroke: #082f49;
    stroke-width: 1.1;
  }

  .dial-needle {
    stroke: #e0f2fe;
    stroke-width: 2.6;
  }

  .dial-tip {
    fill: #e0f2fe;
    stroke: #bae6fd;
    stroke-width: 0.45;
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
    left: 0;
    bottom: calc(100% + 10px);
    width: 240px;
    background: #1c1917;
    border: 2px solid #0e7490;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    padding: 8px;
    z-index: 40;
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
    transform: translateX(1px);
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

  .option-range {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #67e8f9;
    white-space: nowrap;
    flex-shrink: 0;
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
