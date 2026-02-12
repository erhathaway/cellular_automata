<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import type { HSLColor } from '$lib/stores/automata.svelte';
  import { getLattice, latticesForDimension, generateNeighborhood, defaultLattice } from '$lib-core';
  import type { LatticeType, LatticeDefinition } from '$lib-core';

  let { onclose }: { onclose: () => void } = $props();

  // --- Helpers ---
  function hslToHex(c: HSLColor): string {
    const h = c.h, s = c.s, l = c.l;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * Math.max(0, Math.min(1, color)))
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function hexToHsl(hex: string): HSLColor {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l, a: 1 };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
    return { h, s, l, a: 1 };
  }

  // --- Derived state ---
  let dim = $derived(automataStore.dimension);
  let viewer = $derived(automataStore.viewer);
  let lattice = $derived(automataStore.lattice);
  let rule = $derived(automataStore.rule);
  let radius = $derived(automataStore.neighborhoodRadius);
  let shapeRules = $derived(automataStore.shapeRules);
  let isWolfram = $derived(dim === 1 && radius === 1);

  // Available lattices for current dimension
  let availableLattices = $derived(dim >= 2 ? latticesForDimension(dim as 2 | 3) : []);
  let latticeConfig = $derived(dim >= 2 ? getLattice(lattice) : null);
  let isMultiShape = $derived(latticeConfig?.shapes != null && latticeConfig.shapes.length > 1);

  // Full neighborhood config from lattice (includes per-shape data)
  let neighborhoodConfig = $derived.by(() => {
    if (dim === 1) return null;
    return generateNeighborhood(lattice, radius);
  });

  // Per-shape neighborhood info for multi-shape lattices
  interface ShapeNeighborInfo {
    label: string;
    offsets: [number, number][];
    count: number;
    geometry: string;
  }

  let shapeNeighborInfos = $derived.by((): ShapeNeighborInfo[] => {
    if (!isMultiShape || !latticeConfig?.shapes || !neighborhoodConfig) return [];
    const nc = neighborhoodConfig;
    return latticeConfig.shapes.map((shape, i) => ({
      label: shape.label,
      offsets: nc.shapeOffsets2D?.[i] ?? [],
      count: nc.shapeNeighborCounts?.[i] ?? 0,
      geometry: shape.geometry,
    }));
  });

  // Single-shape neighborhood (for non-multi-shape lattices and 1D)
  let singleOffsets = $derived.by((): number[][] => {
    if (dim === 1) {
      return automataStore.allNeighborsForRadius.map((s) =>
        s.split('|').map((part) => {
          const m = part.match(/[+-]\d+/);
          return m ? parseInt(m[0], 10) : 0;
        })
      );
    }
    if (neighborhoodConfig?.offsets2D) {
      return neighborhoodConfig.offsets2D.map(([dx, dy]) => [dx, dy]);
    }
    if (neighborhoodConfig?.offsets3D) {
      return neighborhoodConfig.offsets3D.map(([dx, dy, dz]) => [dx, dy, dz]);
    }
    return [];
  });

  let neighborEnabled = $derived(automataStore.neighborEnabled);
  let activeCount = $derived(neighborEnabled.filter(Boolean).length);
  let totalNeighborCount = $derived(automataStore.allNeighborsForRadius.length);

  // --- Grid cell type ---
  interface GridCell {
    x: number;
    y: number;
    isSelf: boolean;
    neighborIndex: number;
    enabled: boolean;
    shapeIndex?: number; // which shape this cell is (for multi-shape)
  }

  // Compute grid radius from offsets
  function gridRadiusFromOffsets(offsets: number[][]): number {
    let maxR = 1;
    for (const o of offsets) {
      for (const v of o) maxR = Math.max(maxR, Math.abs(v));
    }
    return maxR;
  }

  // Cell size that scales down for large grids
  function cellSizeForRadius(r: number): number {
    return Math.max(14, Math.min(28, Math.floor(120 / (2 * r + 1))));
  }

  // CSS clip-path for different lattice shapes
  function cellClipPath(geometry: string | undefined): string {
    if (geometry === 'hexprism') return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    if (geometry === 'triprism') return 'polygon(50% 0%, 100% 100%, 0% 100%)';
    if (geometry === 'octprism') return 'polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)';
    return ''; // square = no clip
  }

  // The geometry for the current single-shape lattice
  let singleGeometry = $derived(latticeConfig?.geometry ?? (dim === 1 ? 'box' : 'box'));

  // Whether to use hex staggered layout
  let isHexLayout = $derived(singleGeometry === 'hexprism');

  // Positioned cell for absolute-positioned hex/tri grids
  interface PositionedCell extends GridCell {
    left: number;
    top: number;
    isDown?: boolean;
  }

  // Build hex grid using the lattice's actual pointy-top hex positioning.
  // Odd-r offset coords: odd rows stagger right, row spacing = 1.5*r, col spacing = sqrt(3)*r
  const SQRT3 = Math.sqrt(3);

  function buildHexPositions(offsets: number[][], gRadius: number): { cells: PositionedCell[]; cellW: number; cellH: number; width: number; height: number } {
    // Scale hex "radius" based on grid radius so larger neighborhoods shrink
    const hexR = Math.max(8, Math.min(16, Math.floor(60 / (2 * gRadius + 1))));
    const cellW = Math.round(SQRT3 * hexR);
    const cellH = 2 * hexR;

    // Collect self + neighbors
    const allCoords: { dx: number; dy: number; ni: number }[] = [{ dx: 0, dy: 0, ni: -1 }];
    for (let i = 0; i < offsets.length; i++) {
      allCoords.push({ dx: offsets[i][0], dy: offsets[i][1], ni: i });
    }

    // Compute center pixel for each cell using pointy-top odd-r formula
    const positioned = allCoords.map(({ dx, dy, ni }) => {
      const parity = (((dy % 2) + 2) % 2);
      const cx = SQRT3 * hexR * (dx + parity * 0.5);
      const cy = -1.5 * hexR * dy; // negate so +y goes up
      return { dx, dy, ni, left: cx - cellW / 2, top: cy - cellH / 2 };
    });

    // Normalize to (0,0) origin
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of positioned) {
      minX = Math.min(minX, p.left);
      minY = Math.min(minY, p.top);
      maxX = Math.max(maxX, p.left + cellW);
      maxY = Math.max(maxY, p.top + cellH);
    }

    const cells: PositionedCell[] = positioned.map((p) => ({
      x: p.dx,
      y: p.dy,
      isSelf: p.dx === 0 && p.dy === 0,
      neighborIndex: p.ni,
      enabled: p.ni >= 0 && neighborEnabled[p.ni],
      left: p.left - minX,
      top: p.top - minY,
    }));

    return { cells, cellW, cellH, width: maxX - minX, height: maxY - minY };
  }

  // Build triangle grid using direct tessellation layout.
  // All cells in the same row share the same vertical band; clip-paths create interlocking triangles.
  // Column spacing = halfW, row spacing = triH, bounding box = 2*halfW × triH.
  function buildTriPositions(offsets: number[][], shapeIndex: number): { cells: PositionedCell[]; cellW: number; cellH: number; width: number; height: number } {
    const gRadius = gridRadiusFromOffsets(offsets);
    const triSize = Math.max(10, Math.min(18, Math.floor(70 / (2 * gRadius + 1))));
    const halfW = triSize * SQRT3 / 2;
    const triH = triSize * 1.5;
    const cellW = Math.round(halfW * 2);
    const cellH = Math.round(triH);

    // Collect self + neighbors only
    const allCoords: { dx: number; dy: number; ni: number }[] = [{ dx: 0, dy: 0, ni: -1 }];
    for (let i = 0; i < offsets.length; i++) {
      allCoords.push({ dx: offsets[i][0], dy: offsets[i][1], ni: i });
    }

    const positioned = allCoords.map(({ dx, dy, ni }) => {
      const isDown = (((shapeIndex + dx + dy) % 2) + 2) % 2 === 1;
      // Tessellation: col = dx, row = -dy (negate so +dy = visually up)
      // All cells in same row share vertical band, clip-path does the shaping
      const left = dx * halfW - halfW;
      const top = -dy * triH;
      return { dx, dy, ni, isDown, left, top };
    });

    // Normalize to (0,0) origin
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of positioned) {
      minX = Math.min(minX, p.left);
      minY = Math.min(minY, p.top);
      maxX = Math.max(maxX, p.left + cellW);
      maxY = Math.max(maxY, p.top + cellH);
    }

    const cells: PositionedCell[] = positioned.map((p) => ({
      x: p.dx,
      y: p.dy,
      isSelf: p.dx === 0 && p.dy === 0,
      neighborIndex: p.ni,
      enabled: p.ni >= 0,
      isDown: p.isDown,
      left: p.left - minX,
      top: p.top - minY,
    }));

    return { cells, cellW, cellH, width: maxX - minX, height: maxY - minY };
  }

  // Build a 2D grid layer from offsets (regular rectangular)
  function buildGrid(offsets: number[][], gRadius: number, shapeAtFn?: (x: number, y: number) => number): GridCell[][] {
    const rows: GridCell[][] = [];
    for (let y = gRadius; y >= -gRadius; y--) {
      const row: GridCell[] = [];
      for (let x = -gRadius; x <= gRadius; x++) {
        const isSelf = x === 0 && y === 0;
        const ni = offsets.findIndex((o) => o[0] === x && o[1] === y);
        const shapeIndex = shapeAtFn ? shapeAtFn(x, y) : undefined;
        row.push({ x, y, isSelf, neighborIndex: ni, enabled: ni >= 0, shapeIndex });
      }
      rows.push(row);
    }
    return rows;
  }

  // Build 1D grid
  function build1DGrid(offsets: number[][]): GridCell[][] {
    const gRadius = gridRadiusFromOffsets(offsets);
    const row: GridCell[] = [];
    for (let x = -gRadius; x <= gRadius; x++) {
      const isSelf = x === 0;
      const ni = offsets.findIndex((o) => o[0] === x);
      row.push({ x, y: 0, isSelf, neighborIndex: ni, enabled: ni >= 0 && neighborEnabled[ni] });
    }
    return [row];
  }

  // Build 3D grid layers
  function build3DLayers(offsets: number[][]): { z: number; grid: GridCell[][] }[] {
    const gRadius = gridRadiusFromOffsets(offsets);
    const layers: { z: number; grid: GridCell[][] }[] = [];
    for (let z = -gRadius; z <= gRadius; z++) {
      const rows: GridCell[][] = [];
      for (let y = gRadius; y >= -gRadius; y--) {
        const row: GridCell[] = [];
        for (let x = -gRadius; x <= gRadius; x++) {
          const isSelf = x === 0 && y === 0 && z === 0;
          const ni = offsets.findIndex((o) => o[0] === x && o[1] === y && o[2] === z);
          row.push({ x, y, isSelf, neighborIndex: ni, enabled: ni >= 0 && neighborEnabled[ni] });
        }
        rows.push(row);
      }
      layers.push({ z, grid: rows });
    }
    return layers;
  }

  // --- Rule toggle helpers (single shape) ---
  function toggleBorn(n: number) {
    if (rule.type !== 'conway') return;
    const born = rule.born.includes(n)
      ? rule.born.filter((v) => v !== n)
      : [...rule.born, n].sort((a, b) => a - b);
    automataStore.setRule({ type: 'conway', survive: [...rule.survive], born });
  }

  function toggleSurvive(n: number) {
    if (rule.type !== 'conway') return;
    const survive = rule.survive.includes(n)
      ? rule.survive.filter((v) => v !== n)
      : [...rule.survive, n].sort((a, b) => a - b);
    automataStore.setRule({ type: 'conway', survive, born: [...rule.born] });
  }

  function setWolframRule(val: number) {
    automataStore.setRule({ type: 'wolfram', rule: Math.max(0, Math.min(255, val)) });
  }

  // --- Rule toggle helpers (per-shape) ---
  function toggleShapeBorn(shapeIdx: number, n: number) {
    if (!shapeRules) return;
    const r = shapeRules[shapeIdx];
    const born = r.born.includes(n)
      ? r.born.filter((v) => v !== n)
      : [...r.born, n].sort((a, b) => a - b);
    automataStore.setShapeRule(shapeIdx, { survive: [...r.survive], born });
  }

  function toggleShapeSurvive(shapeIdx: number, n: number) {
    if (!shapeRules) return;
    const r = shapeRules[shapeIdx];
    const survive = r.survive.includes(n)
      ? r.survive.filter((v) => v !== n)
      : [...r.survive, n].sort((a, b) => a - b);
    automataStore.setShapeRule(shapeIdx, { survive, born: [...r.born] });
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="advanced-panel">
  <div class="nails">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>
  <div class="nails nails-bottom">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>

  <!-- Header -->
  <div class="panel-header">
    <div class="header-left">
      <span class="panel-title">ADVANCED MODE</span>
      <div class="adv-status-pill" onclick={onclose}>
        <span class="status-dot"></span>
        <span class="status-label">ON</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="status-x" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </div>
    <button class="close-btn" onclick={onclose} aria-label="Close advanced panel">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </div>

  <!-- Body -->
  <div class="panel-body">
    <!-- DIMENSIONS + LATTICE -->
    <div class="section">
      <div class="section-title">DIMENSIONS</div>

      <div class="field">
        <span class="field-label">Cell</span>
        <div class="toggle-row">
          {#each [1, 2, 3] as d}
            <button
              class="toggle-btn {dim === d ? 'active' : ''}"
              onclick={() => automataStore.setDimension(d as 1 | 2 | 3)}
            >{d}D</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Viewer</span>
        <div class="toggle-row">
          {#each [2, 3] as v}
            {@const valid = (dim === 1 && v === 2) || (dim === 2) || (dim === 3 && v === 3)}
            <button
              class="toggle-btn {viewer === v ? 'active' : ''} {!valid ? 'disabled' : ''}"
              onclick={() => valid && automataStore.setViewer(v as 2 | 3)}
              disabled={!valid}
            >{v}D</button>
          {/each}
        </div>
      </div>

      {#if availableLattices.length > 0}
        <div class="field">
          <span class="field-label">Lattice</span>
          <div class="toggle-row toggle-row-wrap">
            {#each availableLattices as lat}
              <button
                class="toggle-btn {lattice === lat.type ? 'active' : ''}"
                onclick={() => automataStore.setLattice(lat.type)}
              >{lat.label}</button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="field">
        <span class="field-label">Grid</span>
        <div class="grid-inputs">
          {#each Object.entries(automataStore.populationShape) as [key, val]}
            <div class="grid-input-wrap">
              <span class="grid-input-label">{key}</span>
              <input
                type="number"
                class="num-input"
                value={val}
                min="2"
                max="500"
                onchange={(e) => {
                  const v = parseInt((e.target as HTMLInputElement).value);
                  if (!isNaN(v) && v >= 2) {
                    automataStore.setPopulationShapeDimension(key, v);
                    automataStore.reset();
                  }
                }}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- RULES -->
    <div class="section section-rules">
      <div class="section-title">RULES</div>

      <div class="field">
        <span class="field-label">Radius</span>
        <input
          type="number"
          class="num-input num-input-sm"
          value={radius}
          min="1"
          max="10"
          onchange={(e) => {
            const v = parseInt((e.target as HTMLInputElement).value);
            if (!isNaN(v)) automataStore.setNeighborhoodRadius(v);
          }}
        />
      </div>

      {#if isWolfram}
        <div class="field">
          <span class="field-label">Rule #</span>
          <input
            type="number"
            class="num-input num-input-sm"
            value={rule.type === 'wolfram' ? rule.rule : 0}
            min="0"
            max="255"
            onchange={(e) => setWolframRule(parseInt((e.target as HTMLInputElement).value))}
          />
        </div>
      {:else if isMultiShape && shapeRules && latticeConfig?.shapes}
        <!-- Per-shape Born/Survive -->
        {#each latticeConfig.shapes as shape, si}
          {@const sr = shapeRules[si]}
          {@const maxN = shapeNeighborInfos[si]?.count ?? shape.neighborCount}
          <div class="shape-rule-group">
            <div class="shape-label">{shape.label}</div>
            <div class="field">
              <span class="field-label">Born</span>
              <div class="rule-toggles">
                {#each Array.from({ length: maxN + 1 }, (_, i) => i) as n}
                  <button
                    class="rule-btn {sr.born.includes(n) ? 'active' : ''}"
                    onclick={() => toggleShapeBorn(si, n)}
                  >{n}</button>
                {/each}
              </div>
            </div>
            <div class="field">
              <span class="field-label">Survive</span>
              <div class="rule-toggles">
                {#each Array.from({ length: maxN + 1 }, (_, i) => i) as n}
                  <button
                    class="rule-btn {sr.survive.includes(n) ? 'active' : ''}"
                    onclick={() => toggleShapeSurvive(si, n)}
                  >{n}</button>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <!-- Single-shape Born/Survive -->
        <div class="field">
          <span class="field-label">Born</span>
          <div class="rule-toggles">
            {#each Array.from({ length: totalNeighborCount + 1 }, (_, i) => i) as n}
              <button
                class="rule-btn {rule.type === 'conway' && rule.born.includes(n) ? 'active' : ''} {n > activeCount ? 'dimmed' : ''}"
                onclick={() => toggleBorn(n)}
              >{n}</button>
            {/each}
          </div>
        </div>
        <div class="field">
          <span class="field-label">Survive</span>
          <div class="rule-toggles">
            {#each Array.from({ length: totalNeighborCount + 1 }, (_, i) => i) as n}
              <button
                class="rule-btn {rule.type === 'conway' && rule.survive.includes(n) ? 'active' : ''} {n > activeCount ? 'dimmed' : ''}"
                onclick={() => toggleSurvive(n)}
              >{n}</button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- NEIGHBORHOOD -->
    <div class="section">
      <div class="section-title">NEIGHBORHOOD</div>

      {#if isMultiShape && shapeNeighborInfos.length > 0}
        <!-- Per-shape neighborhood grids -->
        {#each shapeNeighborInfos as info, si}
          {@const isTri = info.geometry === 'triprism'}
          <div class="shape-neighborhood">
            <div class="shape-label">{info.label}</div>
            <div class="neighbor-count">{info.count} neighbors</div>
            {#if isTri}
              {@const triData = buildTriPositions(info.offsets.map(([dx, dy]) => [dx, dy]), si)}
              <div class="hex-container" style="width: {triData.width}px; height: {triData.height}px;">
                {#each triData.cells as cell}
                  {@const triClip = cell.isDown ? 'polygon(0% 0%, 100% 0%, 50% 100%)' : 'polygon(50% 0%, 100% 100%, 0% 100%)'}
                  {#if cell.isSelf}
                    <div class="n-cell n-self hex-abs" style="width: {triData.cellW}px; height: {triData.cellH}px; left: {cell.left}px; top: {cell.top}px; clip-path: {triClip};">
                      <span class="self-dot"></span>
                    </div>
                  {:else}
                    <div
                      class="n-cell n-neighbor n-on hex-abs"
                      style="width: {triData.cellW}px; height: {triData.cellH}px; left: {cell.left}px; top: {cell.top}px; clip-path: {triClip};"
                    ></div>
                  {/if}
                {/each}
              </div>
            {:else}
              {@const gRadius = gridRadiusFromOffsets(info.offsets.map(([dx, dy]) => [dx, dy]))}
              {@const cs = cellSizeForRadius(gRadius)}
              {@const cols = 2 * gRadius + 1}
              {@const clip = cellClipPath(info.geometry)}
              {@const grid = buildGrid(
                info.offsets.map(([dx, dy]) => [dx, dy]),
                gRadius,
                neighborhoodConfig?.shapeAt
              )}
              <div class="neighbor-grid" style="--cell-size: {cs}px; --grid-cols: {cols};">
                {#each grid as row}
                  {#each row as cell}
                    {#if cell.isSelf}
                      <div class="n-cell n-self" style="width: {cs}px; height: {cs}px; {clip ? `clip-path: ${clip};` : ''}">
                        <span class="self-dot"></span>
                      </div>
                    {:else if cell.neighborIndex >= 0}
                      <div
                        class="n-cell n-neighbor n-on"
                        style="width: {cs}px; height: {cs}px; {clip ? `clip-path: ${clip};` : ''}"
                      ></div>
                    {:else}
                      <div class="n-cell n-empty" style="width: {cs}px; height: {cs}px;"></div>
                    {/if}
                  {/each}
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {:else}
        <!-- Single-shape neighborhood -->
        <div class="neighbor-count">{activeCount} / {totalNeighborCount} active</div>
        {@const clip = cellClipPath(singleGeometry)}

        {#if dim === 1}
          {@const grid1D = build1DGrid(singleOffsets)}
          {@const gRadius = gridRadiusFromOffsets(singleOffsets)}
          {@const cs = cellSizeForRadius(gRadius)}
          {@const cols = 2 * gRadius + 1}
          <div class="neighbor-grid" style="--cell-size: {cs}px; --grid-cols: {cols};">
            {#each grid1D as row}
              {#each row as cell}
                {#if cell.isSelf}
                  <div class="n-cell n-self" style="width: {cs}px; height: {cs}px;">
                    <span class="self-dot"></span>
                  </div>
                {:else if cell.neighborIndex >= 0}
                  <div
                    class="n-cell n-neighbor {cell.enabled ? 'n-on' : 'n-off'}"
                    style="width: {cs}px; height: {cs}px;"
                    onclick={() => automataStore.toggleNeighbor(cell.neighborIndex)}
                  ></div>
                {:else}
                  <div class="n-cell n-empty" style="width: {cs}px; height: {cs}px;"></div>
                {/if}
              {/each}
            {/each}
          </div>
        {:else if dim === 3}
          {@const layers = build3DLayers(singleOffsets)}
          {@const gRadius = gridRadiusFromOffsets(singleOffsets)}
          {@const cs = cellSizeForRadius(gRadius)}
          {@const cols = 2 * gRadius + 1}
          <div class="neighbor-grid-wrap">
            {#each layers as layer}
              <div class="layer-label">z={layer.z}</div>
              <div class="neighbor-grid" style="--cell-size: {cs}px; --grid-cols: {cols};">
                {#each layer.grid as row}
                  {#each row as cell}
                    {#if cell.isSelf}
                      <div class="n-cell n-self" style="width: {cs}px; height: {cs}px; {clip ? `clip-path: ${clip};` : ''}">
                        <span class="self-dot"></span>
                      </div>
                    {:else if cell.neighborIndex >= 0}
                      <div
                        class="n-cell n-neighbor {cell.enabled ? 'n-on' : 'n-off'}"
                        style="width: {cs}px; height: {cs}px; {clip ? `clip-path: ${clip};` : ''}"
                        onclick={() => automataStore.toggleNeighbor(cell.neighborIndex)}
                      ></div>
                    {:else}
                      <div class="n-cell n-empty" style="width: {cs}px; height: {cs}px;"></div>
                    {/if}
                  {/each}
                {/each}
              </div>
            {/each}
          </div>
        {:else if isHexLayout}
          {@const gRadius = gridRadiusFromOffsets(singleOffsets)}
          {@const hexData = buildHexPositions(singleOffsets, gRadius)}
          {@const hexClip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}
          <div class="hex-container" style="width: {hexData.width}px; height: {hexData.height}px;">
            {#each hexData.cells as cell}
              {#if cell.isSelf}
                <div class="n-cell n-self hex-abs" style="width: {hexData.cellW}px; height: {hexData.cellH}px; left: {cell.left}px; top: {cell.top}px; clip-path: {hexClip};">
                  <span class="self-dot"></span>
                </div>
              {:else}
                <div
                  class="n-cell n-neighbor hex-abs {cell.enabled ? 'n-on' : 'n-off'}"
                  style="width: {hexData.cellW}px; height: {hexData.cellH}px; left: {cell.left}px; top: {cell.top}px; clip-path: {hexClip};"
                  onclick={() => automataStore.toggleNeighbor(cell.neighborIndex)}
                ></div>
              {/if}
            {/each}
          </div>
        {:else}
          {@const gRadius = gridRadiusFromOffsets(singleOffsets)}
          {@const cs = cellSizeForRadius(gRadius)}
          {@const cols = 2 * gRadius + 1}
          {@const grid2D = buildGrid(singleOffsets, gRadius)}
          <div class="neighbor-grid" style="--cell-size: {cs}px; --grid-cols: {cols};">
            {#each grid2D as row}
              {#each row as cell}
                {#if cell.isSelf}
                  <div class="n-cell n-self" style="width: {cs}px; height: {cs}px; {clip ? `clip-path: ${clip};` : ''}">
                    <span class="self-dot"></span>
                  </div>
                {:else if cell.neighborIndex >= 0}
                  <div
                    class="n-cell n-neighbor {cell.enabled ? 'n-on' : 'n-off'}"
                    style="width: {cs}px; height: {cs}px; {clip ? `clip-path: ${clip};` : ''}"
                    onclick={() => automataStore.toggleNeighbor(cell.neighborIndex)}
                  ></div>
                {:else}
                  <div class="n-cell n-empty" style="width: {cs}px; height: {cs}px;"></div>
                {/if}
              {/each}
            {/each}
          </div>
        {/if}

        <div class="neighbor-actions">
          <button class="small-btn" onclick={() => automataStore.setAllNeighborsEnabled(true)}>All On</button>
          <button class="small-btn" onclick={() => automataStore.setAllNeighborsEnabled(false)}>All Off</button>
        </div>
      {/if}
    </div>

    <!-- COLORS -->
    <div class="section">
      <div class="section-title">COLORS</div>
      {#each automataStore.cellStates as cs}
        <div class="color-row">
          <span class="color-label">{cs.number === 0 ? 'Dead' : 'Alive'}</span>
          <input
            type="color"
            class="color-input"
            value={hslToHex(cs.color)}
            oninput={(e) => {
              const hex = (e.target as HTMLInputElement).value;
              automataStore.setCellStateColor(cs.number, hexToHsl(hex));
            }}
          />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .advanced-panel {
    position: relative;
    margin: 0 1rem;
    padding: 20px 20px 16px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 2px solid #44403c;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    animation: slide-down 0.25s ease-out;
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .nails {
    position: absolute;
    top: 7px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 7px;
  }

  .nail {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #67e8f9;
    box-shadow: 0 0 4px rgba(103, 232, 249, 0.3);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .panel-title {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #a5f3fc;
    text-transform: uppercase;
  }

  .adv-status-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border: 1px solid #065f46;
    border-radius: 10px;
    background: rgba(16, 185, 129, 0.1);
    cursor: pointer;
    transition: all 0.15s;
  }

  .adv-status-pill:hover {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .adv-status-pill:hover .status-dot {
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
  }

  .adv-status-pill:hover .status-label {
    color: #fca5a5;
  }

  .adv-status-pill:hover .status-x {
    opacity: 1;
    color: #fca5a5;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    transition: all 0.15s;
  }

  .status-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #6ee7b7;
    transition: color 0.15s;
  }

  .status-x {
    opacity: 0.4;
    transition: all 0.15s;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid #44403c;
    border-radius: 4px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .close-btn:hover {
    border-color: #67e8f9;
    color: #67e8f9;
  }

  .panel-body {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 20px 28px;
    align-items: start;
  }

  @media (max-width: 800px) {
    .panel-body {
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-rules {
    min-width: 0;
  }

  .section-title {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #78716c;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .toggle-row {
    display: flex;
    gap: 4px;
  }

  .toggle-row-wrap {
    flex-wrap: wrap;
  }

  .toggle-btn {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    padding: 4px 10px;
    border: 1px solid #44403c;
    border-radius: 4px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    transition: all 0.12s;
  }

  .toggle-btn:hover:not(.disabled) {
    border-color: #67e8f9;
    color: #cffafe;
  }

  .toggle-btn.active {
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.15);
    color: #67e8f9;
    box-shadow: 0 0 8px rgba(34, 211, 238, 0.2);
  }

  .toggle-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .grid-inputs {
    display: flex;
    gap: 6px;
  }

  .grid-input-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .grid-input-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #78716c;
  }

  .num-input {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    width: 60px;
    padding: 3px 6px;
    border: 1px solid #44403c;
    border-radius: 4px;
    background: #0c0a09;
    color: #e7e5e4;
    outline: none;
    transition: border-color 0.15s;
  }

  .num-input:focus {
    border-color: #22d3ee;
  }

  .num-input-sm {
    width: 52px;
  }

  /* Shape rule groups */
  .shape-rule-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border: 1px solid #33302e;
    border-radius: 5px;
    background: rgba(41, 37, 36, 0.5);
  }

  .shape-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: #fbbf24;
    text-transform: uppercase;
  }

  .rule-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .rule-btn {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border: 1px solid #44403c;
    border-radius: 3px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    transition: all 0.12s;
  }

  .rule-btn:hover {
    border-color: #67e8f9;
  }

  .rule-btn.active {
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.2);
    color: #67e8f9;
  }

  .rule-btn.dimmed {
    opacity: 0.35;
  }

  /* Neighborhood */
  .neighbor-count {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
  }

  .shape-neighborhood {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border: 1px solid #33302e;
    border-radius: 5px;
    background: rgba(41, 37, 36, 0.5);
  }

  .neighbor-grid-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: start;
  }

  .layer-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #78716c;
    width: 100%;
    margin-top: 4px;
  }

  .hex-container {
    position: relative;
  }

  .hex-abs {
    position: absolute;
  }

  .neighbor-grid {
    display: inline-grid;
    grid-template-columns: repeat(var(--grid-cols), var(--cell-size));
    gap: 2px;
  }

  .n-cell {
    border-radius: 2px;
    transition: all 0.12s;
  }

  .n-self {
    background: #44403c;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .self-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #fbbf24;
  }

  .n-neighbor {
    cursor: pointer;
  }

  .n-on {
    background: rgba(34, 211, 238, 0.45);
    border: 1px solid #22d3ee;
  }

  .n-on:hover {
    background: rgba(34, 211, 238, 0.65);
  }

  .n-off {
    background: #292524;
    border: 1px solid #44403c;
  }

  .n-off:hover {
    background: #3a3530;
    border-color: #57534e;
  }

  .n-empty {
    background: transparent;
  }

  .neighbor-actions {
    display: flex;
    gap: 6px;
  }

  .small-btn {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    padding: 3px 8px;
    border: 1px solid #44403c;
    border-radius: 3px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.12s;
  }

  .small-btn:hover {
    border-color: #67e8f9;
    color: #cffafe;
  }

  /* Colors */
  .color-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
    min-width: 40px;
  }

  .color-input {
    width: 32px;
    height: 24px;
    border: 1px solid #44403c;
    border-radius: 3px;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
</style>
