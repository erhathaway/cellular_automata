import type { CellStateEntry } from './automata.svelte';

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

class HistoryStore {
  entries: HistoryEntry[] = $state([]);
  cursorIndex = $state(-1);
  private loaded = false;

  get canGoBack(): boolean {
    this.load();
    // At live (-1): need at least 2 entries (entry 0 is current, entry 1 is previous)
    if (this.cursorIndex === -1) return this.entries.length > 1;
    return this.cursorIndex < this.entries.length - 1;
  }

  get canGoForward(): boolean {
    // Can go forward only if we've navigated past entry 0
    return this.cursorIndex > 0;
  }

  goBack(): HistoryEntry | null {
    this.load();
    if (this.cursorIndex === -1) {
      // Entry 0 is current config — skip to entry 1 (previous)
      if (this.entries.length < 2) return null;
      this.cursorIndex = 1;
    } else if (this.cursorIndex < this.entries.length - 1) {
      this.cursorIndex++;
    } else {
      return null;
    }
    this.persistCursor();
    return this.entries[this.cursorIndex] ?? null;
  }

  goForward(): HistoryEntry | null {
    if (this.cursorIndex <= 0) return null;
    this.cursorIndex--;
    if (this.cursorIndex <= 0) {
      // Reached most recent entry — return to live
      this.cursorIndex = -1;
      this.persistCursor();
      return this.entries[0] ?? null;
    }
    this.persistCursor();
    return this.entries[this.cursorIndex] ?? null;
  }

  goToIndex(index: number): HistoryEntry | null {
    this.load();
    if (index < 0 || index >= this.entries.length) return null;
    // Entry 0 is current config — treat as live
    this.cursorIndex = index === 0 ? -1 : index;
    this.persistCursor();
    return this.entries[index] ?? null;
  }

  resetCursor() {
    this.cursorIndex = -1;
    this.persistCursor();
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
          this.entries = parsed.slice(0, MAX_ENTRIES);
        }
      }
    } catch {
      // localStorage unavailable or corrupt — start empty
    }
    try {
      const cursor = localStorage.getItem(CURSOR_KEY);
      if (cursor !== null) {
        const idx = parseInt(cursor, 10);
        if (!isNaN(idx) && idx >= -1 && idx < this.entries.length) {
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
      const truncated = this.entries.slice(0, MAX_ENTRIES);
      if (truncated.length !== this.entries.length) {
        this.entries = truncated;
      }
      // Safety: never overwrite a larger stored history with a smaller one
      // (guards against persist being called before entries are fully loaded)
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (Array.isArray(parsed) && parsed.length > truncated.length) {
            return;
          }
        } catch { /* corrupt — ok to overwrite */ }
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

    // Skip the first recording after page load — it's just hydration from URL/localStorage,
    // not a genuine new config from mining
    if (this.hydratingFromLoad) {
      this.hydratingFromLoad = false;
      return;
    }

    // Deduplicate: skip if identical to most recent
    if (this.entries.length > 0 && entriesMatch(this.entries[0], entry)) {
      return;
    }

    this.entries = [entry, ...this.entries].slice(0, MAX_ENTRIES);
    this.persist();
  }

  updateLatestThumbnail(thumbnail: string) {
    if (this.entries.length === 0) return;
    this.entries[0].thumbnail = thumbnail;
  }

  flush() {
    this.load();
    this.persist();
  }

  removeEntry(id: string) {
    this.load();
    this.entries = this.entries.filter((e) => e.id !== id);
    this.persist();
  }

  removeCorrupted() {
    this.load();
    const before = this.entries.length;
    this.entries = this.entries.filter((e) => {
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
    if (this.entries.length !== before) {
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
    for (const entry of this.entries) {
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
    if (changed) this.persist();
  }

  clearHistory() {
    this.entries = [];
    this.cursorIndex = -1;
    this.loaded = true;
    this.persist();
  }
}

export const historyStore = new HistoryStore();
