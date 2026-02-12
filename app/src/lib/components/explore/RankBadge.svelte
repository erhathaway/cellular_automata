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
  <div class="badge" style="filter: drop-shadow(0 3px 8px rgba(0,0,0,0.6));">
    <svg width="48" height="66" viewBox="0 0 48 66" fill="none">
      <!-- Ribbon V-fold: left strip (behind) -->
      <path d="M9 0 H19 L25 26 H22 Z" fill="url(#{uid}-rl)"/>
      <path d="M11 0 L23 26" stroke="#4a2828" stroke-width="1.5" opacity="0.5"/>
      <path d="M17 0 L24.5 26" stroke="#4a2828" stroke-width="1.5" opacity="0.5"/>
      <!-- Ribbon V-fold: right strip (in front, overlapping) -->
      <path d="M29 0 H39 L23 26 H26 Z" fill="url(#{uid}-rr)"/>
      <path d="M31 0 L23.5 26" stroke="#4a2828" stroke-width="1.5" opacity="0.5"/>
      <path d="M37 0 L25 26" stroke="#4a2828" stroke-width="1.5" opacity="0.5"/>
      <!-- Fold shadow at V point -->
      <path d="M22 22 L25.5 26 H22 Z" fill="rgba(0,0,0,0.3)"/>

      <!-- Metal ring connecting ribbon to medal -->
      <circle cx="24" cy="29" r="3" fill="#3a3530" stroke="#8a8380" stroke-width="1.2"/>
      <circle cx="24" cy="29" r="1.2" fill="#6b6560"/>

      <!-- Medal outer disc -->
      <circle cx="24" cy="48" r="17" fill="url(#{uid}-disc)" stroke="#8a8380" stroke-width="1.8"/>
      <!-- Outer rim highlight -->
      <circle cx="24" cy="48" r="16" fill="none" stroke="rgba(210,205,200,0.12)" stroke-width="0.6"/>
      <!-- Raised inner rim -->
      <circle cx="24" cy="48" r="13.5" fill="none" stroke="#6b6560" stroke-width="1.2"/>
      <circle cx="24" cy="48" r="12.8" fill="none" stroke="rgba(210,205,200,0.08)" stroke-width="0.4"/>
      <!-- Inner medallion -->
      <circle cx="24" cy="48" r="12.5" fill="url(#{uid}-inner)"/>

      <!-- Specular highlight -->
      <ellipse cx="19" cy="42" rx="6" ry="8" fill="white" opacity="0.07"/>

      <!-- Rank number -->
      <text x="24" y="53" text-anchor="middle" font-family="'Space Mono', monospace" font-size="15" font-weight="700" fill="#e7e5e4" stroke="#292524" stroke-width="0.3">{rank}</text>

      <defs>
        <linearGradient id="{uid}-rl" x1="9" y1="0" x2="19" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#5a3535"/>
          <stop offset="50%" stop-color="#7a4a4a"/>
          <stop offset="100%" stop-color="#5a3535"/>
        </linearGradient>
        <linearGradient id="{uid}-rr" x1="29" y1="0" x2="39" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#5a3535"/>
          <stop offset="50%" stop-color="#7a4a4a"/>
          <stop offset="100%" stop-color="#5a3535"/>
        </linearGradient>
        <radialGradient id="{uid}-disc" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#a8a29e"/>
          <stop offset="30%" stop-color="#78716c"/>
          <stop offset="70%" stop-color="#57534e"/>
          <stop offset="100%" stop-color="#3a3530"/>
        </radialGradient>
        <radialGradient id="{uid}-inner" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stop-color="#6b6560"/>
          <stop offset="100%" stop-color="#44403c"/>
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
