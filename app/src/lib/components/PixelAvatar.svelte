<script lang="ts">
  import { getAvatarById } from '$lib/avatars';

  let {
    avatarId = null,
    size = 32,
    fallbackInitials = '?'
  }: {
    avatarId?: string | null;
    size?: number;
    fallbackInitials?: string;
  } = $props();

  let avatar = $derived(avatarId ? getAvatarById(avatarId) : undefined);
</script>

{#if avatar}
  <svg
    width={size}
    height={size}
    viewBox="0 0 8 8"
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
