import type {
  AutomataRule,
  HSLColor,
  CellStateEntry,
  ComboSettings,
} from './automata.svelte';
import { VALID_COMBOS } from './automata.svelte';

const STORAGE_KEY = 'cellular-automata-settings';

// --- Rule serialization ---

export function serializeRule(rule: AutomataRule): string {
  if (rule.type === 'wolfram') return `W${rule.rule}`;
  return `B${rule.born.join('')}S${rule.survive.join('')}`;
}

export function deserializeRule(s: string): AutomataRule | null {
  if (s.startsWith('W')) {
    const num = parseInt(s.slice(1), 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    return { type: 'wolfram', rule: num };
  }
  const match = s.match(/^B(\d*)S(\d*)$/);
  if (!match) return null;
  const born = match[1] ? match[1].split('').map(Number) : [];
  const survive = match[2] ? match[2].split('').map(Number) : [];
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

  return params;
}

interface ParsedURL {
  dimension: number;
  viewer: number;
  settings: Partial<ComboSettings>;
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

  return { dimension, viewer, settings };
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

export function loadFromLocalStorage(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !data.combos) return null;
    return data as PersistedData;
  } catch {
    return null;
  }
}

// --- URL update (no navigation, no history pollution) ---

export function updateURL(dim: number, viewer: number, settings: ComboSettings): void {
  const params = buildURLParams(dim, viewer, settings);
  const url = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, '', url);
}
