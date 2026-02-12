<script lang="ts">
  let {
    icon,
    locked = false,
    size = 40,
  }: {
    icon: string;
    locked?: boolean;
    size?: number;
  } = $props();

  const uid = Math.random().toString(36).slice(2, 8);
  const patternId = `ca-pattern-${uid}`;
  const strokeAttr = `url(#${patternId})`;

  // Taste: pinks, magentas, warm violets
  const tasteColors = ['#ff0080', '#ff3cac', '#c850c0', '#ff6eb4', '#e040fb', '#f48fb1', '#ce93d8', '#f06292', '#ab47bc'];
  // Rank: golds, ambers, warm oranges
  const rankColors = ['#fbbf24', '#f59e0b', '#fb923c', '#fcd34d', '#f97316', '#fde68a', '#fdba74', '#facc15', '#ea580c'];
  // Work: greens, teals, emeralds
  const workColors = ['#34d399', '#10b981', '#22d3ee', '#6ee7b7', '#059669', '#2dd4bf', '#a7f3d0', '#14b8a6', '#047857'];
  // Operator: blues, cyans, electric purples
  const operatorColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#818cf8', '#22d3ee', '#a78bfa', '#38bdf8', '#6366f1', '#67e8f9'];
  // Fallback: mixed rainbow
  const fallbackColors = ['#ff0080', '#00ffcc', '#8b5cf6', '#fbbf24', '#22d3ee', '#f43f5e', '#34d399', '#c084fc', '#fb923c'];

  function getColors(): string[] {
    if (icon.startsWith('taste')) return tasteColors;
    if (icon.startsWith('rank')) return rankColors;
    if (icon.startsWith('work')) return workColors;
    if (icon.startsWith('operator')) return operatorColors;
    return fallbackColors;
  }

  const colors = getColors();
</script>

<!-- Hidden SVG for the psychedelic square-grid pattern -->
<svg style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">
  <defs>
    <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
      <rect x="0" y="0" width="2" height="2" fill={colors[0]} />
      <rect x="2" y="0" width="2" height="2" fill={colors[1]} />
      <rect x="4" y="0" width="2" height="2" fill={colors[2]} />
      <rect x="0" y="2" width="2" height="2" fill={colors[3]} />
      <rect x="2" y="2" width="2" height="2" fill={colors[4]} />
      <rect x="4" y="2" width="2" height="2" fill={colors[5]} />
      <rect x="0" y="4" width="2" height="2" fill={colors[6]} />
      <rect x="2" y="4" width="2" height="2" fill={colors[7]} />
      <rect x="4" y="4" width="2" height="2" fill={colors[8]} />
    </pattern>
  </defs>
</svg>

<div class="achievement-icon" class:locked style="width: {size}px; height: {size}px;">
  {#if icon.startsWith('taste')}
    <svg viewBox="0 0 24 24" fill="none" stroke={locked ? 'currentColor' : strokeAttr} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  {:else if icon.startsWith('rank')}
    <svg viewBox="0 0 24 24" fill="none" stroke={locked ? 'currentColor' : strokeAttr} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
  {:else if icon.startsWith('work')}
    <svg viewBox="0 0 24 24" fill="none" stroke={locked ? 'currentColor' : strokeAttr} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
      <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
      <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
      <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
    </svg>
  {:else if icon.startsWith('operator')}
    <svg viewBox="0 0 24 24" fill="none" stroke={locked ? 'currentColor' : strokeAttr} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke={locked ? 'currentColor' : strokeAttr} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  {/if}
</div>

<style>
  .achievement-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .achievement-icon.locked {
    color: #57534e;
    filter: grayscale(1);
    opacity: 0.5;
  }

  .achievement-icon :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
