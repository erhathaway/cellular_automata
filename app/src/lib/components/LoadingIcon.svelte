<script lang="ts">
  import { onMount } from 'svelte';

  let {
    size = 32,
    class: className = ''
  }: {
    size?: number;
    class?: string;
  } = $props();

  const nodes: [number, number][] = [
    [12, 2],      // 0: top
    [22, 8.5],    // 1: upper-right
    [22, 15.5],   // 2: lower-right
    [12, 22],     // 3: bottom
    [2, 15.5],    // 4: lower-left
    [2, 8.5],     // 5: upper-left
    [12, 8.5],    // 6: center-top
    [12, 15.5],   // 7: center-bottom
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 6], [3, 7], [1, 7], [7, 5], [4, 6], [6, 2],
  ];

  const gradId = `sphere-${Math.random().toString(36).slice(2, 8)}`;

  let svgEl: SVGSVGElement;

  onMount(() => {
    const ns = 'http://www.w3.org/2000/svg';
    let timeoutId: ReturnType<typeof setTimeout>;
    let alive = true;
    const pulsesGroup = svgEl.querySelector('.pulses');

    function spawnPulse() {
      if (!alive || !pulsesGroup) return;

      const edge = edges[Math.floor(Math.random() * edges.length)];
      const [fi, ti] = Math.random() < 0.5 ? [edge[0], edge[1]] : [edge[1], edge[0]];
      const [x1, y1] = nodes[fi];
      const [x2, y2] = nodes[ti];
      const dur = 0.4 + Math.random() * 0.5;

      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('r', '1');
      circle.setAttribute('fill', 'currentColor');
      circle.setAttribute('stroke', 'none');
      circle.setAttribute('opacity', '0');

      const motion = document.createElementNS(ns, 'animateMotion');
      motion.setAttribute('dur', `${dur}s`);
      motion.setAttribute('path', `M${x1} ${y1} L${x2} ${y2}`);
      motion.setAttribute('fill', 'freeze');
      motion.setAttribute('begin', 'indefinite');

      const fade = document.createElementNS(ns, 'animate');
      fade.setAttribute('attributeName', 'opacity');
      fade.setAttribute('values', '0;0.9;0.9;0');
      fade.setAttribute('keyTimes', '0;0.15;0.75;1');
      fade.setAttribute('dur', `${dur}s`);
      fade.setAttribute('fill', 'freeze');
      fade.setAttribute('begin', 'indefinite');

      motion.addEventListener('end', () => circle.remove());

      circle.appendChild(motion);
      circle.appendChild(fade);
      pulsesGroup.appendChild(circle);
      (motion as any).beginElement();
      (fade as any).beginElement();

      timeoutId = setTimeout(spawnPulse, 150 + Math.random() * 300);
    }

    spawnPulse();

    return () => {
      alive = false;
      clearTimeout(timeoutId);
    };
  });
</script>

<svg
  bind:this={svgEl}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="loading-icon {className}"
>
  <defs>
    <radialGradient id={gradId} cx="38%" cy="38%">
      <stop offset="0%" stop-color="currentColor" stop-opacity="1" />
      <stop offset="100%" stop-color="currentColor" stop-opacity="0.35" />
    </radialGradient>
  </defs>

  <!-- Wireframe edges -->
  <g opacity="0.2" stroke-width="0.75">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
    <line x1="12" y1="22" x2="12" y2="15.5" />
    <polyline points="22 8.5 12 15.5 2 8.5" />
    <polyline points="2 15.5 12 8.5 22 15.5" />
    <line x1="12" y1="2" x2="12" y2="8.5" />
  </g>

  <!-- Pulse layer (populated by JS) -->
  <g class="pulses"></g>

  <!-- Node spheres -->
  {#each nodes as [x, y]}
    <circle cx={x} cy={y} r="1.6" fill="url(#{gradId})" stroke="none" />
  {/each}
</svg>
