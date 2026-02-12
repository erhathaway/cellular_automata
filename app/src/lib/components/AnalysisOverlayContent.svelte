<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let totalCells = $state(0);
  let livingCells = $state(0);
  let deadCells = $state(0);
  let bins = $state<number[]>([]);
  let trail = $derived(getTrailSize(automataStore.dimension, automataStore.viewer));

  function getTrailSize(dim: number, view: number): number {
    if (dim === 2 && view === 2) return 40;
    if (dim === 2 && view === 3) return 60;
    if (dim === 1 && view === 2) return 100;
    if (dim === 3 && view === 3) return 20;
    return 20;
  }

  function flattenPopulation(population: any): number[] {
    const out: number[] = [];
    const stack: any[] = [population];
    while (stack.length > 0) {
      const node = stack.pop();
      if (Array.isArray(node)) {
        for (let i = node.length - 1; i >= 0; i--) {
          stack.push(node[i]);
        }
      } else {
        out.push(node === 1 ? 1 : 0);
      }
    }
    return out;
  }

  function recompute() {
    const getAt = automataStore.getPopulationAtIndex;
    const currentIndex = automataStore.generationIndex;
    const currentTrail = getTrailSize(automataStore.dimension, automataStore.viewer);

    if (!getAt || currentIndex < 0) {
      totalCells = 0;
      livingCells = 0;
      deadCells = 0;
      bins = [];
      return;
    }

    const currentPopulation = getAt(currentIndex);
    if (!currentPopulation) {
      totalCells = 0;
      livingCells = 0;
      deadCells = 0;
      bins = [];
      return;
    }

    const current = flattenPopulation(currentPopulation);
    totalCells = current.length;

    livingCells = 0;
    for (let i = 0; i < current.length; i++) {
      livingCells += current[i];
    }
    deadCells = totalCells - livingCells;

    const availableBack = Math.min(currentTrail, currentIndex);
    const past: number[][] = [];
    for (let step = 1; step <= availableBack; step++) {
      const population = getAt(currentIndex - step);
      if (!population) break;
      past.push(flattenPopulation(population));
    }

    const histogram = new Array(currentTrail + 1).fill(0);
    for (let cell = 0; cell < current.length; cell++) {
      if (current[cell] === 1) continue;

      let matched = false;
      for (let step = 1; step <= past.length; step++) {
        if (past[step - 1][cell] === 1) {
          histogram[step - 1]++;
          matched = true;
          break;
        }
      }
      if (!matched) {
        histogram[currentTrail]++;
      }
    }

    bins = histogram;
  }

  let maxBin = $derived.by(() => {
    if (bins.length === 0) return 1;
    const max = Math.max(...bins);
    return max > 0 ? max : 1;
  });

  $effect(() => {
    const _generationIndex = automataStore.generationIndex;
    const _dimension = automataStore.dimension;
    const _viewer = automataStore.viewer;
    const _resetCounter = automataStore.resetCounter;
    const _historyCapacity = automataStore.historyCapacity;
    const _getAt = automataStore.getPopulationAtIndex;
    recompute();
  });
</script>

<div class="analysis-body">
  <div class="counts">
    <div class="count-card">
      <div class="k">Total Cells</div>
      <div class="v">{totalCells.toLocaleString()}</div>
    </div>
    <div class="count-card">
      <div class="k">Living</div>
      <div class="v">{livingCells.toLocaleString()}</div>
    </div>
    <div class="count-card">
      <div class="k">Dead</div>
      <div class="v">{deadCells.toLocaleString()}</div>
    </div>
  </div>

  <div class="hist-wrap">
    <div class="hist-title">Turns Since Death Histogram (trail {trail})</div>
    {#if bins.length > 0}
      <div class="hist-scroll">
        <div class="histogram" style={`--count:${bins.length};`}>
          {#each bins as count, i (i)}
            <div class="bar-col">
              <div class="bar-track">
                <div class="bar-fill" style={`height:${Math.max(2, (count / maxBin) * 100)}%;`}></div>
              </div>
              <div class="bar-label">{i < trail ? i + 1 : `>${trail}`}</div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="empty">Waiting for generation data...</div>
    {/if}
  </div>
</div>

<style>
  .analysis-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: calc(100% - 62px);
    padding: 12px;
  }

  .counts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .count-card {
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(250, 204, 21, 0.04);
    padding: 10px;
  }

  .k {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fde68a;
  }

  .v {
    margin-top: 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
    color: #fef08a;
  }

  .hist-wrap {
    min-height: 0;
    flex: 1;
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.35);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .hist-title {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fde68a;
  }

  .hist-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 6px;
  }

  .histogram {
    display: grid;
    grid-template-columns: repeat(var(--count), minmax(9px, 9px));
    gap: 4px;
    align-items: end;
    min-height: 210px;
    min-width: fit-content;
  }

  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .bar-track {
    width: 9px;
    height: 182px;
    border-radius: 2px;
    background: rgba(120, 113, 108, 0.2);
    border: 1px solid rgba(120, 113, 108, 0.35);
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }

  .bar-fill {
    width: 100%;
    background: linear-gradient(180deg, #fef08a 0%, #facc15 100%);
    box-shadow: 0 0 7px rgba(250, 204, 21, 0.45);
  }

  .bar-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #a8a29e;
    white-space: nowrap;
  }

  .empty {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #a8a29e;
    margin-top: 16px;
  }
</style>
