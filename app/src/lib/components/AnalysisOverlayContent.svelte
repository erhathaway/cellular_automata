<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

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

  function computeAnalysis() {
    const getAt = automataStore.getPopulationAtIndex;
    const currentIndex = automataStore.generationIndex;
    const currentTrail = getTrailSize(automataStore.dimension, automataStore.viewer);

    if (!getAt || currentIndex < 0) {
      return { totalCells: 0, livingCells: 0, deadCells: 0, bins: [] as number[] };
    }

    const currentPopulation = getAt(currentIndex);
    if (!currentPopulation) {
      return { totalCells: 0, livingCells: 0, deadCells: 0, bins: [] as number[] };
    }

    const current = flattenPopulation(currentPopulation);
    const totalCells = current.length;

    let livingCells = 0;
    for (let i = 0; i < current.length; i++) {
      livingCells += current[i];
    }
    const deadCells = totalCells - livingCells;

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

    return { totalCells, livingCells, deadCells, bins: histogram };
  }

  let analysis = $derived.by(() => {
    automataStore.generationIndex;
    automataStore.dimension;
    automataStore.viewer;
    automataStore.resetCounter;
    automataStore.historyCapacity;
    automataStore.getPopulationAtIndex;
    return computeAnalysis();
  });

  let totalCells = $derived(analysis.totalCells);
  let livingCells = $derived(analysis.livingCells);
  let deadCells = $derived(analysis.deadCells);
  let bins = $derived(analysis.bins);

  let maxBin = $derived.by(() => {
    if (bins.length === 0) return 1;
    const max = Math.max(...bins);
    return max > 0 ? max : 1;
  });

  let spectrum = $derived.by(() => {
    // Exclude the overflow bucket (>trail) from spectral analysis.
    const signal = bins.length > 1 ? bins.slice(0, bins.length - 1) : [];
    const n = signal.length;
    if (n < 4) return { amplitudes: [] as number[], periods: [] as number[] };

    const mean = signal.reduce((acc, v) => acc + v, 0) / n;
    const centered = signal.map((v) => v - mean);
    const kMax = Math.floor(n / 2);

    const amplitudes: number[] = [];
    const periods: number[] = [];
    for (let k = 1; k <= kMax; k++) {
      let re = 0;
      let im = 0;
      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        re += centered[t] * Math.cos(angle);
        im -= centered[t] * Math.sin(angle);
      }
      const amp = Math.sqrt(re * re + im * im) / n;
      amplitudes.push(amp);
      periods.push(n / k);
    }
    return { amplitudes, periods };
  });

  let maxSpectrum = $derived.by(() => {
    if (spectrum.amplitudes.length === 0) return 1;
    const max = Math.max(...spectrum.amplitudes);
    return max > 0 ? max : 1;
  });

  let topPeaks = $derived.by(() => {
    const strongest = spectrum.amplitudes
      .map((amp, i) => ({ amp, period: spectrum.periods[i], bin: i + 1 }))
      .filter((x) => x.amp > 0)
      .sort((a, b) => b.amp - a.amp)
      .slice(0, 3);
    // Keep displayed numbering stable by ordering selected peaks by period.
    return strongest.sort((a, b) => a.period - b.period);
  });
</script>

<div class="analysis-body">
  {#if automataStore.allAutomataDied}
    <div class="warning-row">
      <div class="extinction-card">
        <div class="iw-k">All automata died</div>
        <div class="iw-v">No living cells for 5 consecutive generations.</div>
      </div>
    </div>
  {:else if automataStore.interventionTaken}
    <div class="warning-row">
      <div class="intervention-card">
        <div class="iw-k">{automataStore.interventionTitle}</div>
        <div class="iw-v">{automataStore.interventionReason}</div>
      </div>
    </div>
  {/if}

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

  <div class="spectral-wrap">
    <div class="hist-title">Period Spectrum (Harmonics)</div>
    {#if topPeaks.length > 0}
      <div class="peaks">
        {#each topPeaks as p, i (i)}
          <span>Peak {i + 1}: ~{p.period.toFixed(1)} turns</span>
        {/each}
      </div>
    {/if}
    {#if spectrum.amplitudes.length > 0}
      <div class="hist-scroll">
        <div class="spectrum" style={`--count:${spectrum.amplitudes.length};`}>
          {#each spectrum.amplitudes as amp, i (i)}
            <div class="bar-col">
              <div class="bar-track">
                <div class="spec-fill" style={`height:${Math.max(2, (amp / maxSpectrum) * 100)}%;`}></div>
              </div>
              <div class="bar-label">{spectrum.periods[i].toFixed(0)}</div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="empty">Need more samples to resolve harmonics...</div>
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
    overflow-y: auto;
  }

  .counts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .warning-row {
    display: flex;
    justify-content: flex-end;
  }

  .intervention-card {
    width: 100%;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 10px;
    background: rgba(245, 158, 11, 0.12);
    box-shadow:
      0 0 0 1px rgba(250, 204, 21, 0.18) inset,
      0 0 12px rgba(245, 158, 11, 0.24);
  }

  .extinction-card {
    width: 100%;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 10px;
    background: rgba(239, 68, 68, 0.16);
    box-shadow:
      0 0 0 1px rgba(248, 113, 113, 0.2) inset,
      0 0 12px rgba(239, 68, 68, 0.28);
  }

  .iw-k {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fef3c7;
  }

  .iw-v {
    margin-top: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    line-height: 1.35;
    color: #fde68a;
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
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.35);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .spectral-wrap {
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

  .spectrum {
    display: grid;
    grid-template-columns: repeat(var(--count), minmax(9px, 9px));
    gap: 4px;
    align-items: end;
    min-height: 150px;
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

  .spec-fill {
    width: 100%;
    background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%);
    box-shadow: 0 0 7px rgba(245, 158, 11, 0.45);
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

  .peaks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #fcd34d;
  }
</style>
