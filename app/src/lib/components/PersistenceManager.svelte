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

    // Restore mining preferences
    if (stored?.miningDifficulty) {
      automataStore.setMiningDifficulty(stored.miningDifficulty);
    }
    if (stored?.miningLattice) {
      automataStore.setMiningLattice(stored.miningLattice);
    }

    // Restore advanced lock state (only when NOT loading from a shared URL)
    if (!urlParsed && stored?.advancedLocks) {
      const locks = stored.advancedLocks;
      if (locks.advancedMode) automataStore.setAdvancedMode(true);
      if (locks.lockCell) automataStore.setLockCell(true);
      if (locks.lockViewer) automataStore.setLockViewer(true);
      if (locks.lockLattice) automataStore.setLockLattice(true);
      if (locks.lockRadius) automataStore.setLockRadius(true);
      if (locks.lockBorn) automataStore.setLockBorn(true);
      if (locks.lockSurvive) automataStore.setLockSurvive(true);
      if (locks.lockShapeBorn) automataStore.lockShapeBorn = [...locks.lockShapeBorn];
      if (locks.lockShapeSurvive) automataStore.lockShapeSurvive = [...locks.lockShapeSurvive];
      if (locks.lockNeighborhood) automataStore.setLockNeighborhood(true);
      if (locks.lockColors) automataStore.setLockColors(true);
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

    // Signal that URL/localStorage state has been applied — ViewPlayer waits for this
    automataStore.hydrated = true;
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
    const _lattice = automataStore.lattice;
    const _miningDifficulty = automataStore.miningDifficulty;
    const _miningLattice = automataStore.miningLattice;
    // Track advanced lock state for persistence
    const _advancedMode = automataStore.advancedMode;
    const _lockCell = automataStore.lockCell;
    const _lockViewer = automataStore.lockViewer;
    const _lockLattice = automataStore.lockLattice;
    const _lockRadius = automataStore.lockRadius;
    const _lockBorn = automataStore.lockBorn;
    const _lockSurvive = automataStore.lockSurvive;
    const _lockShapeBorn = automataStore.lockShapeBorn;
    const _lockShapeSurvive = automataStore.lockShapeSurvive;
    const _lockNeighborhood = automataStore.lockNeighborhood;
    const _lockColors = automataStore.lockColors;

    clearTimeout(configDebounceTimer);
    configDebounceTimer = setTimeout(() => {
      const allCombos = automataStore.getAllComboSettings();
      const advancedLocks = {
        advancedMode: automataStore.advancedMode,
        lockCell: automataStore.lockCell,
        lockViewer: automataStore.lockViewer,
        lockLattice: automataStore.lockLattice,
        lockRadius: automataStore.lockRadius,
        lockBorn: automataStore.lockBorn,
        lockSurvive: automataStore.lockSurvive,
        lockShapeBorn: [...automataStore.lockShapeBorn],
        lockShapeSurvive: [...automataStore.lockShapeSurvive],
        lockNeighborhood: automataStore.lockNeighborhood,
        lockColors: automataStore.lockColors,
      };
      saveToLocalStorage(allCombos, dim, viewer, automataStore.miningDifficulty, automataStore.miningLattice, advancedLocks);
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
    const lattice = automataStore.lattice;

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
        lattice,
        populationShape: { ...shape },
        cellStates: cellStates.map((s) => ({ ...s })),
      });
    }, 300);
  });
</script>
