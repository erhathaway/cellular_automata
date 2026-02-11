<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore, VALID_COMBOS } from '$lib/stores/automata.svelte';
  import {
    parseURLParams,
    loadFromLocalStorage,
    saveToLocalStorage,
    updateURL,
  } from '$lib/stores/persistence';

  let initialized = false;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    const urlParsed = parseURLParams(new URLSearchParams(window.location.search));
    const stored = loadFromLocalStorage();

    // Hydrate all combos from localStorage
    if (stored?.combos) {
      for (const [dim, viewer] of VALID_COMBOS) {
        const key = `${dim}-${viewer}`;
        const combo = stored.combos[key];
        if (combo) {
          automataStore.hydrateCombo(dim, viewer, combo);
        }
      }
    }

    // If URL has params, override that combo's settings
    if (urlParsed) {
      automataStore.hydrateCombo(urlParsed.dimension, urlParsed.viewer, urlParsed.settings);
      automataStore.hydrateActive(urlParsed.dimension, urlParsed.viewer);
    } else if (stored) {
      // Restore active combo from localStorage
      automataStore.hydrateActive(stored.activeDimension, stored.activeViewer);
    }
    // else: keep defaults (2-2)

    initialized = true;
  });

  // Reactive sync: save to localStorage + update URL (debounced)
  $effect(() => {
    if (!initialized) return;

    // Read reactive dependencies
    const dim = automataStore.dimension;
    const viewer = automataStore.viewer;
    const _shape = automataStore.populationShape;
    const _rule = automataStore.rule;
    const _cellStates = automataStore.cellStates;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const allCombos = automataStore.getAllComboSettings();
      saveToLocalStorage(allCombos, dim, viewer);

      const activeKey = `${dim}-${viewer}`;
      const activeSettings = allCombos[activeKey];
      if (activeSettings) {
        updateURL(dim, viewer, activeSettings);
      }
    }, 300);
  });
</script>
