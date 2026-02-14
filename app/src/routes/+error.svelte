<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import ViewPlayer from '$lib/components/ViewPlayer.svelte';

  onMount(() => {
    // Configure store for Game of Life (B3/S23), white bg, black alive, random trail
    automataStore.dimension = 2;
    automataStore.viewer = 2;
    automataStore.lattice = 'square';
    automataStore.populationShape = { x: 200, y: 100 };
    automataStore.rule = { type: 'conway', survive: [2, 3], born: [3] };
    automataStore.cellStates = [
      { role: 'dead', color: { h: 360, s: 1, l: 1, a: 1 } },
      { role: 'alive', color: { h: 0, s: 0, l: 0, a: 1 } },
    ];
    automataStore.trailConfig = {
      color: { h: Math.random() * 360, s: 1, l: 0.65, a: 1 },
      size: 10,
      stepFn: 'linear',
    };

    // Trigger ViewPlayer initialization
    automataStore.hydrated = true;
  });

  onDestroy(() => {
    // Gate so PersistenceManager re-initializes properly on viewer pages
    automataStore.hydrated = false;
  });
</script>

<div class="relative h-full w-full overflow-hidden">
  <ViewPlayer />

  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <h1 class="error-title">404</h1>
    <p class="error-subtitle">you got lost in the mines</p>
    <a href="/" class="error-button pointer-events-auto">return to base</a>
  </div>
</div>

<style>
  .error-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 900;
    font-size: 10rem;
    line-height: 1;
    color: #facc15;
    text-shadow:
      -6px -6px 0 #000,
       6px -6px 0 #000,
      -6px  6px 0 #000,
       6px  6px 0 #000,
       0   -6px 0 #000,
       0    6px 0 #000,
      -6px  0   0 #000,
       6px  0   0 #000,
      -4px -6px 0 #000,
       4px -6px 0 #000,
      -4px  6px 0 #000,
       4px  6px 0 #000,
      -6px -4px 0 #000,
       6px -4px 0 #000,
      -6px  4px 0 #000,
       6px  4px 0 #000;
    margin: 0;
  }

  .error-subtitle {
    font-family: 'Space Mono', monospace;
    font-size: 2rem;
    color: #facc15;
    text-shadow:
      -3px -3px 0 #000,
       3px -3px 0 #000,
      -3px  3px 0 #000,
       3px  3px 0 #000,
       0   -3px 0 #000,
       0    3px 0 #000,
      -3px  0   0 #000,
       3px  0   0 #000;
    margin: 0.5rem 0 2rem;
  }

  .error-button {
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #facc15;
    color: #0c0a09;
    padding: 0.75rem 2rem;
    border: 3px solid #000;
    border-radius: 6px;
    text-decoration: none;
    transition: box-shadow 0.2s ease;
  }

  .error-button:hover {
    background: #fbbf24;
    box-shadow: 0 0 16px rgba(250, 204, 21, 0.3);
  }
</style>
