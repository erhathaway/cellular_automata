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
    if (this.cursorIndex === -1) return this.entries.length > 0;
    return this.cursorIndex < this.entries.length - 1;
  }

  get canGoForward(): boolean {
    return this.cursorIndex >= 0;
  }

  goBack(): HistoryEntry | null {
    this.load();
    if (this.cursorIndex === -1) {
      if (this.entries.length === 0) return null;
      this.cursorIndex = 0;
    } else if (this.cursorIndex < this.entries.length - 1) {
      this.cursorIndex++;
    } else {
      return null;
    }
    return this.entries[this.cursorIndex] ?? null;
  }

  goForward(): HistoryEntry | null {
    if (this.cursorIndex < 0) return null;
    this.cursorIndex--;
    if (this.cursorIndex < 0) return null;
    return this.entries[this.cursorIndex] ?? null;
  }

  resetCursor() {
    this.cursorIndex = -1;
  }

  private load() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.entries = parsed;
        }
      }
    } catch {
      // localStorage unavailable or corrupt — start empty
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // quota exceeded — silently fail
    }
  }

  addEntry(entry: HistoryEntry) {
    this.load();
    // Deduplicate: skip if identical to most recent
    if (this.entries.length > 0 && entriesMatch(this.entries[0], entry)) {
      return;
    }

    this.entries = [entry, ...this.entries].slice(0, MAX_ENTRIES);
    this.cursorIndex = -1;
    this.persist();
  }

  updateLatestThumbnail(thumbnail: string) {
    if (this.entries.length === 0) return;
    this.entries[0].thumbnail = thumbnail;
  }

  flush() {
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
    this.loaded = true;
    this.persist();
  }
}

export const historyStore = new HistoryStore();
