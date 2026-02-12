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
</script>

<!-- Hidden SVG for the psychedelic square-grid pattern -->
<svg style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">
  <defs>
    <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
      <rect x="0" y="0" width="2" height="2" fill="#ff0080" />
      <rect x="2" y="0" width="2" height="2" fill="#00ffcc" />
      <rect x="4" y="0" width="2" height="2" fill="#8b5cf6" />
      <rect x="0" y="2" width="2" height="2" fill="#fbbf24" />
      <rect x="2" y="2" width="2" height="2" fill="#22d3ee" />
      <rect x="4" y="2" width="2" height="2" fill="#f43f5e" />
      <rect x="0" y="4" width="2" height="2" fill="#34d399" />
      <rect x="2" y="4" width="2" height="2" fill="#c084fc" />
      <rect x="4" y="4" width="2" height="2" fill="#fb923c" />
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
