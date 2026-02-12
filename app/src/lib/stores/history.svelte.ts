import type { CellStateEntry } from './automata.svelte';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  dimension: number;
  viewer: number;
  ruleType: 'wolfram' | 'conway';
  ruleDefinition: string;
  neighborhoodRadius: number;
  populationShape: Record<string, number>;
  cellStates: CellStateEntry[];
  thumbnail?: string;
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

  constructor() {
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
    this.persist();
  }

  removeEntry(id: string) {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.persist();
  }

  clearHistory() {
    this.entries = [];
    this.persist();
  }
}

export const historyStore = new HistoryStore();
