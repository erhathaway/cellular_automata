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
  let livingPct = $derived(totalCells > 0 ? (livingCells / totalCells) * 100 : 0);
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
    <div class="status-card extinction-card">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      <div class="iw-k">All automata died</div>
      <div class="iw-v">No living cells for 5 consecutive generations.</div>
    </div>
  {:else if automataStore.stableKind === 'exact' && automataStore.stablePeriod <= 1}
    <div class="status-card frozen-card">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      <div class="iw-k">Frozen automata detected</div>
      <div class="iw-v">No cells are being born or dying</div>
    </div>
  {:else if automataStore.interventionTaken}
    <div class="status-card intervention-card">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      <div class="iw-k">{automataStore.interventionTitle}</div>
      <div class="iw-v">{automataStore.interventionReason}</div>
    </div>
  {:else}
    <div class="status-card healthy-card">
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
      <div class="iw-k">All systems healthy</div>
    </div>
  {/if}

  <div class="count-card">
    <div class="nails"><div class="nail"></div><div class="nail"></div></div>
    <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
    <div class="count-header">
      <div class="section-title">Population</div>
      <div class="count-total">{totalCells.toLocaleString()} cells</div>
    </div>
    <div class="life-bar">
      <div class="life-bar-living" style={`width:${livingPct}%`}></div>
      <div class="life-bar-dead" style={`width:${100 - livingPct}%`}></div>
    </div>
    <div class="life-labels">
      <div class="life-label living">
        <span class="life-label-k">Living</span>
        <span class="life-label-v">{livingCells.toLocaleString()}</span>
      </div>
      <div class="life-label dead">
        <span class="life-label-k">Dead</span>
        <span class="life-label-v">{deadCells.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div class="hist-wrap">
    <div class="nails"><div class="nail"></div><div class="nail"></div></div>
    <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
    <div class="section-title">Decay Rate</div>
    <div class="section-subtitle">Turns Since Death Histogram (trail {trail})</div>
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
    <div class="nails"><div class="nail"></div><div class="nail"></div></div>
    <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
    <div class="section-title">Harmonics</div>
    <div class="section-subtitle">Period Spectrum</div>
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
    {#if topPeaks.length > 0}
      <div class="peaks">
        {#each topPeaks as p, i (i)}
          <span>Peak {i + 1}: ~{p.period.toFixed(1)} turns</span>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .analysis-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    padding: 12px 12px 24px;
    overflow-y: auto;
  }

  .status-card {
    position: relative;
    border-radius: 6px;
    padding: 18px;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .healthy-card {
    border: 1px solid #44403c;
    background: rgba(0, 0, 0, 0.35);
  }

  .healthy-card .iw-k {
    color: #57534e;
  }

  .intervention-card {
    border: 1px solid #f59e0b;
    background: rgba(245, 158, 11, 0.12);
    box-shadow:
      0 0 0 1px rgba(250, 204, 21, 0.18) inset,
      0 0 12px rgba(245, 158, 11, 0.24);
  }

  .extinction-card {
    border: 1px solid #ef4444;
    background: rgba(239, 68, 68, 0.16);
    box-shadow:
      0 0 0 1px rgba(248, 113, 113, 0.2) inset,
      0 0 12px rgba(239, 68, 68, 0.28);
  }

  .frozen-card {
    border: 1px solid #60a5fa;
    background: rgba(59, 130, 246, 0.16);
    box-shadow:
      0 0 0 1px rgba(96, 165, 250, 0.2) inset,
      0 0 12px rgba(59, 130, 246, 0.24);
  }

  .iw-k {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fef3c7;
  }

  .iw-v {
    margin-top: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    line-height: 1.4;
    color: #d6d3d1;
  }

  .count-card {
    position: relative;
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(250, 204, 21, 0.04);
    padding: 16px;
  }

  .count-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .count-total {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: #a8a29e;
  }

  .life-bar {
    display: flex;
    height: 14px;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid #44403c;
  }

  .life-bar-living {
    background: linear-gradient(180deg, #fef08a 0%, #facc15 100%);
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
    transition: width 0.3s ease;
    min-width: 1px;
  }

  .life-bar-dead {
    background: #292524;
    transition: width 0.3s ease;
    min-width: 1px;
  }

  .life-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
  }

  .life-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .life-label.dead {
    text-align: right;
    align-items: flex-end;
  }

  .life-label-k {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
  }

  .life-label-v {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    line-height: 1;
    font-weight: 700;
    color: #fef08a;
  }

  .life-label.dead .life-label-v {
    color: #78716c;
  }

  .hist-wrap {
    position: relative;
    flex-shrink: 0;
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.35);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .spectral-wrap {
    position: relative;
    flex-shrink: 0;
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.35);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fde68a;
  }

  .section-subtitle {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
    margin-top: -4px;
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
    min-height: 0;
    min-width: fit-content;
  }

  .spectrum {
    display: grid;
    grid-template-columns: repeat(var(--count), minmax(9px, 9px));
    gap: 4px;
    align-items: end;
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
    height: 90px;
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

  /* Nails */
  .nails {
    position: absolute;
    top: 6px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 1;
  }

  .nails-bottom {
    top: auto;
    bottom: 6px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }
</style>
