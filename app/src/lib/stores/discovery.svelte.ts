import { automataStore } from '$lib/stores/automata.svelte';
import { historyStore } from '$lib/stores/history.svelte';
import { serializeRule } from '$lib/stores/persistence';
import { defaultLattice } from '$lib-core';

export interface DiscoveryInfo {
  found: boolean;
  discoveredBy?: string;
  discoveredByImageUrl?: string | null;
  discoveredByAvatarId?: string | null;
  discoveredByMinerConfig?: string | null;
  discoveredAt?: string;
  saveCount?: number;
  totalLikes?: number;
  totalBookmarks?: number;
  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  entityId?: string | null;
  entityType?: 'generation_run' | 'cell_population' | null;
}

class DiscoveryStore {
  discoveryInfo: DiscoveryInfo | null = $state(null);
  saving = $state(false);
  saved = $state(false);
  saveError = $state('');

  // Animation state — claim gem flies OUT to chest
  gemExiting = $state(false);
  avatarEntering = $state(false);

  private _lookupTimer: ReturnType<typeof setTimeout> | undefined;
  private _lastConfigKey = '';

  get isSurveying(): boolean {
    return this.discoveryInfo === null || automataStore.isMining;
  }

  get notViable(): boolean {
    return !automataStore.isViableAutomata && !automataStore.isMining;
  }

  get isUnclaimed(): boolean {
    return (
      this.discoveryInfo !== null &&
      !this.discoveryInfo.found &&
      !automataStore.isMining &&
      !this.notViable
    );
  }

  /** Call from an $effect — triggers discovery lookup when config changes */
  checkDiscovery() {
    const rule = automataStore.rule;
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    const lat = automataStore.lattice;
    const _claimed = automataStore.claimAnimationCounter;

    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

    const configKey = `${dim}:${ruleType}:${ruleDefinition}:${nr}:${lat}`;
    if (configKey !== this._lastConfigKey) {
      this._lastConfigKey = configKey;
      this.discoveryInfo = null;
      this.saved = false;
      this.saveError = '';
      this.gemExiting = false;
      this.avatarEntering = false;
    }

    clearTimeout(this._lookupTimer);
    this._lookupTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          d: String(dim),
          rt: ruleType,
          rd: ruleDefinition,
          nr: String(nr),
          ...(lat !== defaultLattice(dim) ? { lt: lat } : {}),
        });
        const res = await fetch(`/api/discovery?${params}`);
        if (res.ok) {
          const data = await res.json();
          this.discoveryInfo = data;
          // Sync initial like/bookmark state + claimed status to history
          this._syncHistoryFlags({ claimed: data.found ? true : undefined });
        } else {
          this.discoveryInfo = null;
        }
      } catch {
        this.discoveryInfo = null;
      }
    }, 500);
  }

  async claim() {
    if (this.saving || this.saved) return;

    // Capture gem position NOW while it's still in the DOM
    // The caller should provide gemEl if needed
    let gemOrigin: { x: number; y: number } | null = null;
    const gemEl = this._gemElRef;
    if (gemEl) {
      const rect = gemEl.getBoundingClientRect();
      gemOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    this.saving = true;
    this.saveError = '';
    try {
      const data = automataStore.exportForSave();
      const thumbnail = automataStore.getCanvasDataURL?.() ?? undefined;

      const res = await fetch('/api/generation-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, thumbnail })
      });
      if (res.status === 409) {
        // Already exists — treat as success
      } else if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try {
          const body = await res.json();
          msg = body.message ?? msg;
        } catch {
          msg = (await res.text()) || msg;
        }
        throw new Error(msg);
      }

      // Hide gem and launch the flying gem from the captured position
      if (gemOrigin) {
        automataStore.claimGemOrigin = gemOrigin;
      }
      this.gemExiting = true;
      // Trigger the sidebar flying gem
      automataStore.claimAnimationCounter++;

      // After the full flight lands (~1.4s flight + buffer), show avatar
      setTimeout(() => {
        this.saved = true;
        this.avatarEntering = true;
      }, 1800);

      const seedSnapshot = automataStore.getSeedSnapshot?.();
      if (seedSnapshot) {
        automataStore.savedSeed = seedSnapshot;
        automataStore.useSavedSeed = true;
      }
    } catch (e: any) {
      this.saveError = e.message ?? 'Failed to save';
    } finally {
      this.saving = false;
    }
  }

  /** Set the gem element reference so claim() can capture its position */
  private _gemElRef: HTMLElement | null = null;
  setGemEl(el: HTMLElement | null) {
    this._gemElRef = el;
  }

  private _syncHistoryFlags(overrides?: { liked?: boolean; bookmarked?: boolean; claimed?: boolean }) {
    const rd = serializeRule(automataStore.rule);
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    historyStore.updateFlags(rd, dim, nr, {
      liked: overrides?.liked ?? this.discoveryInfo?.isLikedByMe ?? false,
      bookmarked: overrides?.bookmarked ?? this.discoveryInfo?.isBookmarkedByMe ?? false,
      ...(overrides?.claimed !== undefined ? { claimed: overrides.claimed } : {}),
    });
  }
}

export const discoveryStore = new DiscoveryStore();
