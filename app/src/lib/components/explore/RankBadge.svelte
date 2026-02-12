<script lang="ts">
  let { rank }: { rank: number } = $props();

  const trophyColors = [
    { cup: '#facc15', cupDark: '#ca8a04', shine: '#fef9c3', base: '#b45309', baseDark: '#92400e', glow: 'rgba(250, 204, 21, 0.4)' },
    { cup: '#d6d3d1', cupDark: '#78716c', shine: '#fafaf9', base: '#57534e', baseDark: '#44403c', glow: 'rgba(168, 162, 158, 0.3)' },
    { cup: '#d4a06a', cupDark: '#8b5e3c', shine: '#e8bc88', base: '#704828', baseDark: '#5c3a1e', glow: 'rgba(180, 120, 60, 0.3)' },
  ];

  let isTrophy = $derived(rank >= 1 && rank <= 3);
  let c = $derived(isTrophy ? trophyColors[rank - 1] : null);

  // Unique ID prefix to avoid SVG gradient collisions when multiple badges exist
  let uid = $derived(`rb-${rank}`);
</script>

{#if isTrophy && c}
  <div class="badge" style="filter: drop-shadow(0 0 6px {c.glow});">
    <svg width="54" height="60" viewBox="0 0 36 40" fill="none">
      <!-- Handles -->
      <path d="M5 8 C5 8 1 8 1 13 C1 18 5 18 5 18" stroke="{c.cup}" stroke-width="2" fill="none"/>
      <path d="M31 8 C31 8 35 8 35 13 C35 18 31 18 31 18" stroke="{c.cup}" stroke-width="2" fill="none"/>
      <!-- Cup body -->
      <path d="M7 6 L7 20 C7 26 12 30 18 30 C24 30 29 26 29 20 L29 6 Z" fill="url(#{uid}-cup)" stroke="{c.cupDark}" stroke-width="1"/>
      <!-- Shine -->
      <ellipse cx="14" cy="14" rx="3" ry="6" fill="{c.shine}" opacity="0.25"/>
      <!-- Stem -->
      <rect x="16" y="29" width="4" height="5" rx="1" fill="{c.cupDark}"/>
      <!-- Base -->
      <rect x="11" y="33" width="14" height="4" rx="2" fill="url(#{uid}-base)" stroke="{c.baseDark}" stroke-width="0.5"/>
      <!-- Number -->
      <text x="18" y="21" text-anchor="middle" font-family="'Space Mono', monospace" font-size="16" font-weight="700" fill="#1c1917" stroke="#1c1917" stroke-width="0.5">{rank}</text>
      <defs>
        <linearGradient id="{uid}-cup" x1="7" y1="6" x2="29" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="{c.shine}" stop-opacity="0.6"/>
          <stop offset="40%" stop-color="{c.cup}"/>
          <stop offset="100%" stop-color="{c.cupDark}"/>
        </linearGradient>
        <linearGradient id="{uid}-base" x1="11" y1="33" x2="11" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="{c.base}"/>
          <stop offset="100%" stop-color="{c.baseDark}"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
{:else}
  <div class="badge" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));">
    <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
      <!-- Ribbon left drape -->
      <path d="M14 0 L8 0 L2 28 L8 24 L14 28 Z" fill="url(#{uid}-rl)"/>
      <path d="M14 0 L14 28 L8 24 L2 28" stroke="#57534e" stroke-width="0.5" opacity="0.3"/>
      <!-- Ribbon right drape -->
      <path d="M30 0 L36 0 L42 28 L36 24 L30 28 Z" fill="url(#{uid}-rr)"/>
      <path d="M30 0 L30 28 L36 24 L42 28" stroke="#57534e" stroke-width="0.5" opacity="0.3"/>
      <!-- Ribbon center band -->
      <rect x="13" y="0" width="18" height="22" rx="1" fill="url(#{uid}-rc)"/>
      <line x1="16" y1="0" x2="16" y2="22" stroke="#78716c" stroke-width="0.5" opacity="0.3"/>
      <line x1="22" y1="0" x2="22" y2="22" stroke="#78716c" stroke-width="0.5" opacity="0.2"/>
      <line x1="28" y1="0" x2="28" y2="22" stroke="#78716c" stroke-width="0.5" opacity="0.3"/>
      <!-- Medal disc -->
      <circle cx="22" cy="40" r="17" fill="url(#{uid}-disc)" stroke="#57534e" stroke-width="1.5"/>
      <!-- Raised rim -->
      <circle cx="22" cy="40" r="14" fill="none" stroke="#78716c" stroke-width="1" opacity="0.5"/>
      <circle cx="22" cy="40" r="14.5" fill="none" stroke="#292524" stroke-width="0.5" opacity="0.4"/>
      <!-- Highlight -->
      <ellipse cx="18" cy="35" rx="4" ry="6" fill="white" opacity="0.06"/>
      <!-- Number -->
      <text x="22" y="45" text-anchor="middle" font-family="'Space Mono', monospace" font-size="15" font-weight="700" fill="#d6d3d1" stroke="#292524" stroke-width="0.3">{rank}</text>
      <defs>
        <linearGradient id="{uid}-rl" x1="2" y1="0" x2="14" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#44403c"/>
          <stop offset="100%" stop-color="#57534e"/>
        </linearGradient>
        <linearGradient id="{uid}-rr" x1="30" y1="0" x2="42" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#57534e"/>
          <stop offset="100%" stop-color="#44403c"/>
        </linearGradient>
        <linearGradient id="{uid}-rc" x1="13" y1="0" x2="31" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#57534e"/>
          <stop offset="30%" stop-color="#78716c"/>
          <stop offset="70%" stop-color="#78716c"/>
          <stop offset="100%" stop-color="#57534e"/>
        </linearGradient>
        <radialGradient id="{uid}-disc" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stop-color="#78716c"/>
          <stop offset="50%" stop-color="#57534e"/>
          <stop offset="100%" stop-color="#292524"/>
        </radialGradient>
      </defs>
    </svg>
  </div>
{/if}

<style>
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
</style>
