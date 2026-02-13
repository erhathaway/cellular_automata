import type { CellStateEntry, TrailConfig } from './automata.svelte';
import { migrateCellStatesData } from './persistence';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  dimension: number;
  viewer: number;
  ruleType: 'wolfram' | 'conway';
  ruleDefinition: string;
  neighborhoodRadius: number;
  lattice?: string;
  populationShape: Record<string, number>;
  cellStates: CellStateEntry[];
  trailConfig?: TrailConfig;
  thumbnail?: string;
  liked?: boolean;
  bookmarked?: boolean;
  claimed?: boolean;
}

const MAX_ENTRIES = 100;
const STORAGE_KEY = 'cellular-automata-history';
const CURSOR_KEY = 'cellular-automata-history-cursor';

function entriesMatch(a: HistoryEntry, b: HistoryEntry): boolean {
  return (
    a.dimension === b.dimension &&
    a.viewer === b.viewer &&
    a.ruleDefinition === b.ruleDefinition &&
    a.neighborhoodRadius === b.neighborhoodRadius &&
    JSON.stringify(a.populationShape) === JSON.stringify(b.populationShape) &&
    JSON.stringify(a.cellStates) === JSON.stringify(b.cellStates)
  );
}

/**
 * History store using a plain array for entries (NOT $state) to avoid
 * Svelte 5 deep-proxy issues with JSON serialization and array spreading.
 * Reactivity is driven by a $state version counter that increments on mutations.
 */
class HistoryStore {
  // Plain array — no $state proxy. All serialization/iteration works on plain objects.
  private _entries: HistoryEntry[] = [];
  // Reactive version counter — read this in templates/effects to create a dependency
  private _version = $state(0);
  // Cursor uses $state since it's a simple primitive (no proxy issues)
  cursorIndex = $state(-1);
  private loaded = false;

  /** Reactive entries getter — reading this creates a Svelte dependency via _version */
  get entries(): HistoryEntry[] {
    // Touch _version to establish reactive dependency
    void this._version;
    return this._entries;
  }

  private bump() {
    this._version++;
  }

  get canGoBack(): boolean {
    // Don't call load() here — writing $state during $derived evaluation is unsafe.
    // Rely on ensureLoaded() being called from PersistenceManager.onMount.
    // Touch _version to establish reactive dependency on entries changes
    void this._version;
    // At live (-1): need at least 2 entries (entry 0 is current, entry 1 is previous)
    if (this.cursorIndex === -1) return this._entries.length > 1;
    return this.cursorIndex < this._entries.length - 1;
  }

  get canGoForward(): boolean {
    // Touch _version to establish reactive dependency
    void this._version;
    // Can go forward only if we've navigated past entry 0
    return this.cursorIndex > 0;
  }

  goBack(): HistoryEntry | null {
    this.load();
    if (this.cursorIndex === -1) {
      // Entry 0 is current config — skip to entry 1 (previous)
      if (this._entries.length < 2) return null;
      this.cursorIndex = 1;
    } else if (this.cursorIndex < this._entries.length - 1) {
      this.cursorIndex++;
    } else {
      return null;
    }
    this.persistCursor();
    return this._entries[this.cursorIndex] ?? null;
  }

  goForward(): HistoryEntry | null {
    if (this.cursorIndex <= 0) return null;
    this.cursorIndex--;
    if (this.cursorIndex <= 0) {
      // Reached most recent entry — return to live
      this.cursorIndex = -1;
      this.persistCursor();
      return this._entries[0] ?? null;
    }
    this.persistCursor();
    return this._entries[this.cursorIndex] ?? null;
  }

  goToIndex(index: number): HistoryEntry | null {
    this.load();
    if (index < 0 || index >= this._entries.length) return null;
    // Entry 0 is current config — treat as live
    this.cursorIndex = index === 0 ? -1 : index;
    this.persistCursor();
    return this._entries[index] ?? null;
  }

  resetCursor() {
    this.cursorIndex = -1;
    this.persistCursor();
  }

  /** Eagerly load entries from localStorage. Safe to call multiple times. */
  ensureLoaded() {
    this.load();
  }

  private load() {
    if (this.loaded) return;
    // Don't mark as loaded during SSR — storage APIs aren't available
    if (typeof window === 'undefined') return;
    this.loaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Migrate old number-based cell states to role-based
          this._entries = parsed.slice(0, MAX_ENTRIES).map((entry: any) => {
            if (entry.cellStates) {
              const result = migrateCellStatesData(entry.cellStates);
              entry.cellStates = result.states;
              if (!entry.trailConfig) {
                entry.trailConfig = result.trail;
              }
            }
            return entry;
          });
          this.bump();
        }
      }
    } catch {
      // localStorage unavailable or corrupt — start empty
    }
    try {
      const cursor = localStorage.getItem(CURSOR_KEY);
      if (cursor !== null) {
        const idx = parseInt(cursor, 10);
        if (!isNaN(idx) && idx >= -1 && idx < this._entries.length) {
          this.cursorIndex = idx;
        }
      }
    } catch {
      // cursor restore failed
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      const truncated = this._entries.slice(0, MAX_ENTRIES);
      if (truncated.length !== this._entries.length) {
        this._entries = truncated;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(truncated));
    } catch {
      // quota exceeded — silently fail
    }
    this.persistCursor();
  }

  private persistCursor() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CURSOR_KEY, String(this.cursorIndex));
    } catch {
      // cursor persist failed
    }
  }

  addEntry(entry: HistoryEntry) {
    this.load();
    // Don't record while navigating history
    if (this.cursorIndex >= 0) return;

    // Deduplicate: skip if identical to most recent
    if (this._entries.length > 0 && entriesMatch(this._entries[0], entry)) {
      return;
    }

    this._entries = [entry, ...this._entries].slice(0, MAX_ENTRIES);
    this.bump();
    this.persist();
  }

  updateActiveThumbnail(thumbnail: string) {
    if (this._entries.length === 0) return;
    const idx = this.cursorIndex === -1 ? 0 : this.cursorIndex;
    if (idx >= this._entries.length) return;
    const hadThumbnail = !!this._entries[idx].thumbnail;
    this._entries[idx].thumbnail = thumbnail;
    // Bump reactivity when a thumbnail is first set so the UI shows it
    if (!hadThumbnail) {
      this.bump();
    }
  }

  flush() {
    this.load();
    this.persist();
  }

  removeEntry(id: string) {
    this.load();
    this._entries = this._entries.filter((e) => e.id !== id);
    this.bump();
    this.persist();
  }

  removeCorrupted() {
    this.load();
    const before = this._entries.length;
    this._entries = this._entries.filter((e) => {
      if (e.ruleType !== 'conway') return true;
      // Old format without commas that could have multi-digit corruption
      const match = e.ruleDefinition.match(/^B([0-9,]*)S([0-9,]*)$/);
      if (!match) return false;
      // If no commas and any digit sequence could be multi-digit, can't verify — keep single-digit-only entries
      const bornStr = match[1];
      const surviveStr = match[2];
      if (!bornStr.includes(',') && !surviveStr.includes(',')) {
        // Legacy format — check for duplicates (impossible from generator)
        const born = bornStr.split('').map(Number);
        const survive = surviveStr.split('').map(Number);
        if (new Set(born).size !== born.length || new Set(survive).size !== survive.length) {
          return false;
        }
      }
      return true;
    });
    if (this._entries.length !== before) {
      this.bump();
      this.persist();
    }
  }

  /** Update liked/bookmarked/claimed flags on all entries matching the given config */
  updateFlags(
    ruleDefinition: string,
    dimension: number,
    neighborhoodRadius: number,
    flags: { liked?: boolean; bookmarked?: boolean; claimed?: boolean }
  ) {
    this.load();
    let changed = false;
    for (const entry of this._entries) {
      if (
        entry.ruleDefinition === ruleDefinition &&
        entry.dimension === dimension &&
        entry.neighborhoodRadius === neighborhoodRadius
      ) {
        if (flags.liked !== undefined) { entry.liked = flags.liked; changed = true; }
        if (flags.bookmarked !== undefined) { entry.bookmarked = flags.bookmarked; changed = true; }
        if (flags.claimed !== undefined) { entry.claimed = flags.claimed; changed = true; }
      }
    }
    if (changed) {
      this.bump();
      this.persist();
    }
  }

  clearHistory() {
    this._entries = [];
    this.cursorIndex = -1;
    this.loaded = true;
    this.bump();
    this.persist();
  }
}

export const historyStore = new HistoryStore();
