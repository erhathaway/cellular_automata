<script lang="ts">
  import { getAvatarById } from '$lib/avatars';
  import type { MinerConfig } from '$lib/miner/types';
  import { renderMinerToDataURL } from '$lib/miner/renderer';

  let {
    avatarId = null,
    size = 32,
    fallbackInitials = '?',
    centered = false,
    minerConfig = null
  }: {
    avatarId?: string | null;
    size?: number;
    fallbackInitials?: string;
    centered?: boolean;
    minerConfig?: string | MinerConfig | null;
  } = $props();

  let avatar = $derived(avatarId && avatarId !== '__miner__' ? getAvatarById(avatarId) : undefined);

  let isMiner = $derived(avatarId === '__miner__' && minerConfig != null);

  let minerDataUrl = $derived.by(() => {
    if (!isMiner || !minerConfig) return '';
    try {
      const config: MinerConfig = typeof minerConfig === 'string' ? JSON.parse(minerConfig) : minerConfig;
      // Scale factor: size / 24 (canvas height), minimum 2
      const scale = Math.max(2, Math.round(size / 24));
      return renderMinerToDataURL(config, scale);
    } catch {
      return '';
    }
  });

  let viewBox = $derived.by(() => {
    if (!avatar || !centered) return '0 0 8 8';
    const grid = avatar.grid;
    let minX = 8, minY = 8, maxX = -1, maxY = -1;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return '0 0 8 8';
    const contentW = maxX - minX + 1;
    const contentH = maxY - minY + 1;
    const side = Math.max(contentW, contentH);
    const pad = 0.5;
    const cx = minX + contentW / 2;
    const cy = minY + contentH / 2;
    const half = side / 2 + pad;
    return `${cx - half} ${cy - half} ${half * 2} ${half * 2}`;
  });
</script>

{#if isMiner && minerDataUrl}
  <img
    src={minerDataUrl}
    alt="Miner avatar"
    width={size}
    height={size * 1.5}
    class="shrink-0"
    style="image-rendering: pixelated; object-fit: contain; height: {size}px; width: auto;"
  />
{:else if avatar}
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    class="shrink-0"
    style="image-rendering: pixelated;"
  >
    {#each avatar.grid as row, y}
      {#each row as cell, x}
        {#if cell}
          <rect {x} {y} width="1" height="1" fill={avatar.color} />
        {/if}
      {/each}
    {/each}
  </svg>
{:else}
  <div
    class="flex shrink-0 items-center justify-center rounded-full bg-neutral-200 font-semibold text-neutral-500"
    style="width: {size}px; height: {size}px; font-size: {Math.max(size * 0.4, 10)}px;"
  >
    {fallbackInitials.slice(0, 2).toUpperCase()}
  </div>
{/if}
