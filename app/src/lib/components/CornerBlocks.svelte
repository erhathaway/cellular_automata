<script lang="ts">
  // Cellular automata pixel-art blocks that frame the viewer corners.
  // Each block is a 4x4 grid showing a recognizable CA pattern fragment.
  // 0 = dead cell, 1 = alive cell

  type Block = {
    pattern: number[]; // 4x4 binary grid (16 entries, row-major)
    alive: string;     // alive cell color
    dead: string;      // dead cell color
  };

  const S = 20; // block size in px

  // Pattern blocks — named after classic Game of Life / CA motifs
  const BLOCKS: Record<string, Block> = {
    // Game of Life patterns
    glider: {
      alive: '#22d660', dead: '#0a1f10',
      pattern: [
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    block: {
      alive: '#22d660', dead: '#0a1f10',
      pattern: [
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    blinker: {
      alive: '#22d660', dead: '#0a1f10',
      pattern: [
        0, 0, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
      ],
    },
    beehive: {
      alive: '#22d660', dead: '#0a1f10',
      pattern: [
        0, 1, 1, 0,
        1, 0, 0, 1,
        0, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    tub: {
      alive: '#22d660', dead: '#0a1f10',
      pattern: [
        0, 1, 0, 0,
        1, 0, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,
      ],
    },

    // Blue variants — same patterns, different palette
    gliderB: {
      alive: '#38bdf8', dead: '#0c1a2e',
      pattern: [
        0, 0, 1, 0,
        1, 0, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    blockB: {
      alive: '#38bdf8', dead: '#0c1a2e',
      pattern: [
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    blinkerB: {
      alive: '#38bdf8', dead: '#0c1a2e',
      pattern: [
        0, 0, 0, 0,
        0, 1, 1, 1,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ],
    },

    // Amber/orange variants
    gliderA: {
      alive: '#f59e0b', dead: '#1a1408',
      pattern: [
        0, 0, 0, 0,
        1, 1, 1, 0,
        1, 0, 0, 0,
        0, 1, 0, 0,
      ],
    },
    blockA: {
      alive: '#f59e0b', dead: '#1a1408',
      pattern: [
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    beehiveA: {
      alive: '#f59e0b', dead: '#1a1408',
      pattern: [
        0, 0, 0, 0,
        0, 1, 1, 0,
        1, 0, 0, 1,
        0, 1, 1, 0,
      ],
    },

    // Purple/magenta variants
    gliderP: {
      alive: '#c084fc', dead: '#1a0e2e',
      pattern: [
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    blockP: {
      alive: '#c084fc', dead: '#1a0e2e',
      pattern: [
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
      ],
    },
    tubP: {
      alive: '#c084fc', dead: '#1a0e2e',
      pattern: [
        0, 0, 0, 0,
        0, 1, 0, 0,
        1, 0, 1, 0,
        0, 1, 0, 0,
      ],
    },
  };

  type CornerBlock = { block: string; col: number; row: number };
  type Corner = {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    cols: number;
    rows: number;
    blocks: CornerBlock[];
  };

  // Helper: fill a corner shape from a binary mask (row-major, 1=block)
  function fillCorner(
    mask: number[],
    cols: number,
    palette: string[],
  ): CornerBlock[] {
    const result: CornerBlock[] = [];
    let pi = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        result.push({
          block: palette[pi % palette.length],
          col: i % cols,
          row: Math.floor(i / cols),
        });
        pi++;
      }
    }
    return result;
  }

  const corners: Corner[] = [
    {
      // Top-left (green): solid corner, trails right and down
      //  X X X X X
      //  X X X X .
      //  X X X . .
      //  X X . . .
      top: `-${S}px`,
      left: `-${S}px`,
      cols: 5, rows: 4,
      blocks: fillCorner([
        1, 1, 1, 1, 1,
        1, 1, 1, 1, 0,
        1, 1, 1, 0, 0,
        1, 1, 0, 0, 0,
      ], 5, ['glider', 'block', 'beehive', 'tub', 'blinker']),
    },
    {
      // Top-right (blue): solid corner, trails left and down
      //  X X X X
      //  . X X X
      //  . . X X
      //  . . . X
      //  . . . X
      top: `-${S}px`,
      right: `-${S}px`,
      cols: 4, rows: 5,
      blocks: fillCorner([
        1, 1, 1, 1,
        0, 1, 1, 1,
        0, 0, 1, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
      ], 4, ['gliderB', 'blockB', 'blinkerB']),
    },
    {
      // Bottom-right (amber): solid corner, trails left and up
      //  . . . . X
      //  . . . X X
      //  . . X X X
      //  . X X X X
      //  X X X X X
      bottom: `-${S}px`,
      right: `-${S}px`,
      cols: 5, rows: 5,
      blocks: fillCorner([
        0, 0, 0, 0, 1,
        0, 0, 0, 1, 1,
        0, 0, 1, 1, 1,
        0, 1, 1, 1, 1,
        1, 1, 1, 1, 1,
      ], 5, ['gliderA', 'blockA', 'beehiveA']),
    },
    {
      // Bottom-left (purple): solid corner, trails right and up
      //  X . . .
      //  X X . .
      //  X X . .
      //  X X X .
      //  X X X X
      bottom: `-${S}px`,
      left: `-${S}px`,
      cols: 4, rows: 5,
      blocks: fillCorner([
        1, 0, 0, 0,
        1, 1, 0, 0,
        1, 1, 0, 0,
        1, 1, 1, 0,
        1, 1, 1, 1,
      ], 4, ['gliderP', 'blockP', 'tubP']),
    },
  ];
</script>

{#each corners as corner}
  <div
    class="pointer-events-none absolute z-40"
    style:top={corner.top}
    style:bottom={corner.bottom}
    style:left={corner.left}
    style:right={corner.right}
  >
    <div class="relative" style="width: {corner.cols * S}px; height: {corner.rows * S}px;">
      {#each corner.blocks as { block, col, row }}
        {@const b = BLOCKS[block]}
        <div
          class="absolute grid"
          style="
            width: {S}px;
            height: {S}px;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(4, 1fr);
            left: {col * S}px;
            top: {row * S}px;
            image-rendering: pixelated;
          "
        >
          {#each b.pattern as cell}
            <div style="background: {cell ? b.alive : b.dead};"></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
{/each}
