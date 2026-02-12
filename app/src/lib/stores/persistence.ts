import type {
  AutomataRule,
  HSLColor,
  CellStateEntry,
  ComboSettings,
} from './automata.svelte';
import { VALID_COMBOS, defaultRule } from './automata.svelte';
import { replaceState } from '$app/navigation';

const STORAGE_KEY = 'cellular-automata-settings';

// --- Base64 <-> Uint8Array ---

export function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// --- Rule serialization ---

export function serializeRule(rule: AutomataRule): string {
  if (rule.type === 'wolfram') return `W${rule.rule}`;
  return `B${rule.born.join(',')}S${rule.survive.join(',')}`;
}

export function deserializeRule(s: string): AutomataRule | null {
  if (s.startsWith('W')) {
    const num = parseInt(s.slice(1), 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    return { type: 'wolfram', rule: num };
  }
  const match = s.match(/^B([0-9,]*)S([0-9,]*)$/);
  if (!match) return null;
  const parseNums = (str: string): number[] => {
    if (!str) return [];
    // Comma-separated (new format) vs individual digits (legacy)
    return str.includes(',')
      ? str.split(',').map(Number)
      : str.split('').map(Number);
  };
  const born = parseNums(match[1]);
  const survive = parseNums(match[2]);
  if (born.some(isNaN) || survive.some(isNaN)) return null;
  return { type: 'conway', born, survive };
}

// --- Color serialization ---

export function serializeColor(color: HSLColor): string {
  const h = Math.round(color.h);
  const s = Math.round(color.s * 100);
  const l = Math.round(color.l * 100);
  return `${h}.${s}.${l}`;
}

export function deserializeColor(s: string): HSLColor | null {
  const parts = s.split('.');
  if (parts.length !== 3) return null;
  const [h, s_pct, l_pct] = parts.map(Number);
  if ([h, s_pct, l_pct].some(isNaN)) return null;
  if (h < 0 || h > 360 || s_pct < 0 || s_pct > 100 || l_pct < 0 || l_pct > 100) return null;
  return { h, s: s_pct / 100, l: l_pct / 100, a: 1 };
}

// --- URL params ---

export function buildURLParams(
  dim: number,
  viewer: number,
  settings: ComboSettings,
  generation?: number,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('d', String(dim));
  params.set('v', String(viewer));

  const shape = settings.populationShape;
  if (shape.x !== undefined) params.set('x', String(shape.x));
  if (shape.y !== undefined) params.set('y', String(shape.y));
  if (shape.z !== undefined) params.set('z', String(shape.z));

  params.set('r', serializeRule(settings.rule));

  for (const cs of settings.cellStates) {
    params.set(`c${cs.number}`, serializeColor(cs.color));
  }

  if (settings.neighborhoodRadius !== undefined && settings.neighborhoodRadius > 1) {
    params.set('nr', String(settings.neighborhoodRadius));
  }

  if (generation && generation > 0) {
    params.set('g', String(generation));
  }

  return params;
}

interface ParsedURL {
  dimension: number;
  viewer: number;
  settings: Partial<ComboSettings>;
  generation?: number;
}

export function parseURLParams(params: URLSearchParams): ParsedURL | null {
  const dStr = params.get('d');
  const vStr = params.get('v');
  if (!dStr || !vStr) return null;

  const dimension = parseInt(dStr, 10);
  const viewer = parseInt(vStr, 10);

  // Validate combo
  if (!VALID_COMBOS.some(([d, v]) => d === dimension && v === viewer)) return null;

  const settings: Partial<ComboSettings> = {};

  // Parse shape
  const shape: Record<string, number> = {};
  let hasShape = false;
  for (const key of ['x', 'y', 'z']) {
    const val = params.get(key);
    if (val !== null) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        shape[key] = num;
        hasShape = true;
      }
    }
  }
  if (hasShape) settings.populationShape = shape;

  // Parse rule
  const rStr = params.get('r');
  if (rStr) {
    const rule = deserializeRule(rStr);
    if (rule) settings.rule = rule;
  }

  // Parse colors
  const cellStates: CellStateEntry[] = [];
  for (let i = 0; i <= 9; i++) {
    const cStr = params.get(`c${i}`);
    if (cStr) {
      const color = deserializeColor(cStr);
      if (color) cellStates.push({ number: i, color });
    }
  }
  if (cellStates.length > 0) settings.cellStates = cellStates;

  // Parse neighborhood radius
  const nrStr = params.get('nr');
  if (nrStr) {
    const nr = parseInt(nrStr, 10);
    if (!isNaN(nr) && nr >= 1 && nr <= 10) {
      settings.neighborhoodRadius = nr;
    }
  }

  // Parse generation
  const gStr = params.get('g');
  let generation: number | undefined;
  if (gStr) {
    const g = parseInt(gStr, 10);
    if (!isNaN(g) && g > 0) generation = g;
  }

  return { dimension, viewer, settings, generation };
}

// --- localStorage ---

export interface PersistedData {
  combos: Record<string, ComboSettings>;
  activeDimension: number;
  activeViewer: number;
}

export function saveToLocalStorage(
  combos: Record<string, ComboSettings>,
  activeDimension: number,
  activeViewer: number,
): void {
  try {
    const data: PersistedData = { combos, activeDimension, activeViewer };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or unavailable — silently fail
  }
}

function hasDuplicates(arr: number[]): boolean {
  return new Set(arr).size !== arr.length;
}

function migrateCorruptedRules(data: PersistedData): PersistedData {
  for (const key of Object.keys(data.combos)) {
    const combo = data.combos[key];
    if (combo.rule?.type === 'conway') {
      if (hasDuplicates(combo.rule.born) || hasDuplicates(combo.rule.survive)) {
        // Rule was corrupted by old single-char serialization of multi-digit values.
        // Parse dimension from key (e.g. "2-2" → dim=2) and reset to default.
        const dim = parseInt(key.split('-')[0], 10);
        combo.rule = defaultRule(dim);
        combo.neighborhoodRadius = 1;
      }
    }
  }
  return data;
}

export function loadFromLocalStorage(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !data.combos) return null;
    return migrateCorruptedRules(data as PersistedData);
  } catch {
    return null;
  }
}

// --- URL update (no navigation, no history pollution) ---

export function updateURL(dim: number, viewer: number, settings: ComboSettings, generation?: number): void {
  const params = buildURLParams(dim, viewer, settings, generation);
  const url = new URL(window.location.href);
  url.search = params.toString();
  try {
    replaceState(url, {});
  } catch {
    // Router not yet initialized (e.g. during HMR reload)
  }
}
