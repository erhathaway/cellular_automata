<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let title = $derived.by(() => {
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    const rule = automataStore.rule;

    let name = `${dim}D`;
    if (view === 3) name += ` (3D view)`;

    if (rule.type === 'wolfram') {
      return `${name} — Rule ${rule.rule}`;
    }
    const born = rule.born.join('');
    const survive = rule.survive.join('');
    return `${name} — B${born}/S${survive}`;
  });

  let description = $derived.by(() => {
    const rule = automataStore.rule;
    if (rule.type === 'wolfram') {
      return `Elementary cellular automaton using Wolfram's Rule ${rule.rule}. Each cell's next state is determined by its current state and its two immediate neighbors, producing one of 256 possible rule sets.`;
    }
    const born = rule.born.join(', ');
    const survive = rule.survive.join(', ');
    return `Life-like cellular automaton where a dead cell becomes alive with ${born} neighbors (birth) and a living cell survives with ${survive} neighbors (survival). All other cells die from loneliness or overcrowding.`;
  });

  let shapeText = $derived(
    Object.entries(automataStore.populationShape)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' × ')
  );
</script>

<div class="mx-auto max-w-3xl px-6 py-10">
  <h1 class="text-2xl font-bold text-neutral-900">{title}</h1>

  <div class="mt-4 flex items-center gap-4 text-sm text-neutral-500">
    <span>Generation {automataStore.totalGenerations.toLocaleString()}</span>
    <span>·</span>
    <span>Grid {shapeText}</span>
  </div>

  <hr class="my-6 border-neutral-200" />

  <p class="leading-relaxed text-neutral-700">{description}</p>
</div>
