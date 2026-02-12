<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { automataStore, VALID_COMBOS } from '$lib/stores/automata.svelte';
  import {
    parseURLParams,
    loadFromLocalStorage,
    saveToLocalStorage,
    serializeRule,
    updateURL,
  } from '$lib/stores/persistence';
  import { historyStore } from '$lib/stores/history.svelte';

  let initialized = $state(false);
  let configDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  let genDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  let historyDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  let thumbnailInterval: ReturnType<typeof setInterval> | undefined;

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
    // Drop corrupted rules from old single-char serialization (duplicates are impossible)
    if (urlParsed?.settings?.rule?.type === 'conway') {
      const { born, survive } = urlParsed.settings.rule;
      if (new Set(born).size !== born.length || new Set(survive).size !== survive.length) {
        delete urlParsed.settings.rule;
        delete urlParsed.settings.neighborhoodRadius;
      }
    }
    if (urlParsed) {
      automataStore.hydrateCombo(urlParsed.dimension, urlParsed.viewer, urlParsed.settings);
      automataStore.hydrateActive(urlParsed.dimension, urlParsed.viewer);
      if (urlParsed.generation) {
        automataStore.targetGeneration = urlParsed.generation;
      }
    } else if (stored) {
      // Restore active combo from localStorage
      automataStore.hydrateActive(stored.activeDimension, stored.activeViewer);
    }
    // else: keep defaults (2-2)

    // Clear corrupted history entries from old serialization format
    historyStore.removeCorrupted();

    initialized = true;

    // Capture thumbnail every 2s to keep latest history entry up to date
    thumbnailInterval = setInterval(() => {
      const thumb = automataStore.captureThumbnail?.();
      if (thumb) {
        historyStore.updateLatestThumbnail(thumb);
      }
    }, 2000);

    // Persist history on page unload so latest thumbnail is saved
    const flushHistory = () => historyStore.flush();
    window.addEventListener('beforeunload', flushHistory);

    return () => {
      clearInterval(thumbnailInterval);
      window.removeEventListener('beforeunload', flushHistory);
    };
  });

  afterNavigate(({ to }) => {
    if (initialized && to?.url.pathname === '/') {
      doURLUpdate();
    }
  });

  function doURLUpdate() {
    if (window.location.pathname !== '/') return;
    const dim = automataStore.dimension;
    const viewer = automataStore.viewer;
    const allCombos = automataStore.getAllComboSettings();
    const activeKey = `${dim}-${viewer}`;
    const activeSettings = allCombos[activeKey];
    if (activeSettings) {
      updateURL(dim, viewer, activeSettings, automataStore.totalGenerations);
    }
  }

  // Config changes: save to localStorage + update URL (300ms debounce)
  $effect(() => {
    if (!initialized) return;

    const dim = automataStore.dimension;
    const viewer = automataStore.viewer;
    const _shape = automataStore.populationShape;
    const _rule = automataStore.rule;
    const _cellStates = automataStore.cellStates;
    const _radius = automataStore.neighborhoodRadius;

    clearTimeout(configDebounceTimer);
    configDebounceTimer = setTimeout(() => {
      const allCombos = automataStore.getAllComboSettings();
      saveToLocalStorage(allCombos, dim, viewer);
      doURLUpdate();
    }, 300);
  });

  // Generation changes: update URL only (2s debounce — generations tick rapidly)
  $effect(() => {
    if (!initialized) return;

    const _gen = automataStore.totalGenerations;

    clearTimeout(genDebounceTimer);
    genDebounceTimer = setTimeout(doURLUpdate, 2000);
  });

  // History recording: capture config changes to browsable history (300ms debounce)
  $effect(() => {
    if (!initialized) return;

    const dim = automataStore.dimension;
    const viewer = automataStore.viewer;
    const shape = automataStore.populationShape;
    const rule = automataStore.rule;
    const cellStates = automataStore.cellStates;
    const radius = automataStore.neighborhoodRadius;

    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(() => {
      const ruleDefinition = serializeRule(rule);
      historyStore.addEntry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        dimension: dim,
        viewer,
        ruleType: rule.type,
        ruleDefinition,
        neighborhoodRadius: radius,
        populationShape: { ...shape },
        cellStates: cellStates.map((s) => ({ ...s })),
      });
    }, 300);
  });
</script>
