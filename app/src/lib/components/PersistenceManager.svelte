<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { automataStore, VALID_COMBOS } from '$lib/stores/automata.svelte';
  import {
    parseURLParams,
    loadFromLocalStorage,
    saveToLocalStorage,
    serializeRule,
    deserializeRule,
    updateURL,
    urlFingerprint,
    base64ToUint8Array,
  } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import { historyStore } from '$lib/stores/history.svelte';

  let initialized = $state(false);
  let configDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  let genDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  let thumbnailInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    // Eagerly load history before any hydration so entries and cursor are populated
    historyStore.ensureLoaded();

    const urlParsed = parseURLParams(new URLSearchParams(window.location.search));
    const stored = loadFromLocalStorage();

    // Detect whether the URL is a new/shared link vs our own from last session.
    // Compare URL params (ignoring g= generation) to what we last saved.
    const currentFingerprint = urlFingerprint(window.location.search);
    const isNewUrl = urlParsed != null && currentFingerprint !== (stored?.lastUrlFingerprint ?? '');

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

    // Restore user preferences (only when NOT loading from a new/shared URL)
    if (isNewUrl) {
      // Reset mining preferences so they don't interfere with the loaded automata
      automataStore.resetMiningToRandom();
    } else if (stored) {
      // Mining button preferences
      if (stored.miningDifficulty) automataStore.setMiningDifficulty(stored.miningDifficulty);
      if (stored.miningLattice) automataStore.setMiningLattice(stored.miningLattice);

      // Advanced lock state
      const locks = stored.advancedLocks;
      if (locks) {
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

    // Restore neighbor enabled state AFTER hydration (hydrateActive resets them via _setFullNeighbors)
    if (!isNewUrl && stored?.advancedLocks) {
      const locks = stored.advancedLocks;
      if (locks.neighborEnabled && locks.neighborEnabled.length === automataStore.neighborEnabled.length) {
        automataStore.neighborEnabled = [...locks.neighborEnabled];
      }
      if (locks.shapeNeighborEnabled && locks.shapeNeighborEnabled.length === automataStore.shapeNeighborEnabled.length) {
        automataStore.shapeNeighborEnabled = locks.shapeNeighborEnabled.map(a => [...a]);
      }
    }
    // Note: neighbor enabled must stay separate from the main preference block above
    // because hydrateActive() (which runs between them) resets these arrays.

    // Rehydrate history cursor position across reloads
    if (historyStore.cursorIndex >= 0) {
      const cursorEntry = historyStore.entries[historyStore.cursorIndex];
      if (cursorEntry) {
        // Compare current hydrated config against the cursor entry
        const currentRule = serializeRule(automataStore.rule);
        const urlMatchesCursor =
          automataStore.dimension === cursorEntry.dimension &&
          automataStore.viewer === cursorEntry.viewer &&
          currentRule === cursorEntry.ruleDefinition &&
          automataStore.neighborhoodRadius === cursorEntry.neighborhoodRadius;

        if (urlMatchesCursor) {
          // URL matches cursor entry — keep cursor position, config is already correct
        } else {
          // URL differs from cursor — add URL config to top of history, go live
          historyStore.resetCursor();
          const rule = automataStore.rule;
          const ruleDefinition = serializeRule(rule);
          historyStore.addEntry({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            dimension: automataStore.dimension,
            viewer: automataStore.viewer,
            ruleType: rule.type,
            ruleDefinition,
            neighborhoodRadius: automataStore.neighborhoodRadius,
            lattice: automataStore.lattice,
            populationShape: { ...automataStore.populationShape },
            cellStates: automataStore.cellStates.map((s: any) => ({ ...s })),
            trailConfig: { ...automataStore.trailConfig },
          });
        }
      } else {
        // Cursor index out of bounds — reset to live
        historyStore.resetCursor();
      }
    }

    // Clear corrupted history entries from old serialization format
    historyStore.removeCorrupted();

    // If URL has a generation run ID, fetch the seed snapshot before hydrating.
    // This must complete before ViewPlayer renders so it uses the correct seed.
    const finishHydration = () => {
      automataStore.hydrated = true;
      initialized = true;
    };

    if (urlParsed?.generationRunId) {
      automataStore.generationRunId = urlParsed.generationRunId;
      api<{ seedPopulation: string | null; claimPopulation: string | null }>('GET', `/api/seed?id=${urlParsed.generationRunId}`)
        .then(({ seedPopulation, claimPopulation }) => {
          const popToUse = claimPopulation ?? seedPopulation;
          automataStore.savedSeed = popToUse ? base64ToUint8Array(popToUse) : null;
          automataStore.useSavedSeed = true;
        })
        .catch(() => {
          // Seed fetch failed — clear ID, fall back to random seed
          automataStore.generationRunId = null;
          automataStore.savedSeed = null;
        })
        .finally(finishHydration);
    } else {
      // Signal that URL/localStorage state has been applied — ViewPlayer waits for this
      finishHydration();
    }

    // Capture thumbnail for the active history entry (500ms if <20 entries, 5s otherwise)
    const tickThumbnail = () => {
      const thumb = automataStore.captureThumbnail?.();
      if (thumb) {
        historyStore.updateActiveThumbnail(thumb);
      }
      const ms = historyStore.entries.length < 20 ? 500 : 5000;
      thumbnailInterval = setTimeout(tickThumbnail, ms);
    };
    thumbnailInterval = setTimeout(tickThumbnail, 500);

    // Persist history on page unload so latest thumbnail is saved
    const flushHistory = () => historyStore.flush();
    window.addEventListener('beforeunload', flushHistory);

    return () => {
      clearTimeout(thumbnailInterval);
      window.removeEventListener('beforeunload', flushHistory);
    };
  });

  afterNavigate(({ to }) => {
    if (initialized && to?.url.pathname === '/mine') {
      doURLUpdate();
    }
  });

  function doURLUpdate() {
    if (window.location.pathname !== '/mine') return;
    const dim = automataStore.dimension;
    const viewer = automataStore.viewer;
    const allCombos = automataStore.getAllComboSettings();
    const activeKey = `${dim}-${viewer}`;
    const activeSettings = allCombos[activeKey];
    if (activeSettings) {
      updateURL(dim, viewer, activeSettings, automataStore.totalGenerations, automataStore.generationRunId);
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
    const _trailConfig = automataStore.trailConfig;
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
    const _neighborEnabled = automataStore.neighborEnabled;
    const _shapeNeighborEnabled = automataStore.shapeNeighborEnabled;
    const _generationRunId = automataStore.generationRunId;

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
        neighborEnabled: [...automataStore.neighborEnabled],
        shapeNeighborEnabled: automataStore.shapeNeighborEnabled.map(a => [...a]),
      };
      doURLUpdate();
      const fingerprint = urlFingerprint(window.location.search);
      saveToLocalStorage(allCombos, dim, viewer, automataStore.miningDifficulty, automataStore.miningLattice, advancedLocks, fingerprint);
    }, 300);
  });

  // Generation changes: update URL only (2s debounce — generations tick rapidly)
  $effect(() => {
    if (!initialized) return;

    const _gen = automataStore.totalGenerations;

    clearTimeout(genDebounceTimer);
    genDebounceTimer = setTimeout(doURLUpdate, 2000);
  });

  // History recording is handled directly by RandomRuleButton (on mine)
  // rather than via a reactive $effect, to avoid hydration timing issues
  // that caused entries to be overwritten on page reload.
</script>
