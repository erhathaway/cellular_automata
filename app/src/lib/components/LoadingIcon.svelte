<script lang="ts">
  import { onMount } from 'svelte';

  let {
    size = 32,
    mode = 'dark' as 'dark' | 'light',
    class: className = ''
  }: {
    size?: number;
    mode?: 'dark' | 'light';
    class?: string;
  } = $props();

  const NODE_R = 1.6;
  const CHARGE_R = 2.4;
  const GOLD = '#facc15';

  const nodeColor = $derived(mode === 'light' ? '#1c1917' : '#e7e5e4');
  const wireColor = $derived(mode === 'light' ? '#1c1917' : '#e7e5e4');

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

  let svgEl: SVGSVGElement;

  onMount(() => {
    const ns = 'http://www.w3.org/2000/svg';
    let spawnTimeout: ReturnType<typeof setTimeout>;
    let alive = true;
    const pulsesGroup = svgEl.querySelector('.pulses')!;
    const baseColor = mode === 'light' ? '#1c1917' : '#e7e5e4';

    // --- lerp a hex color ---
    function lerpColor(a: string, b: string, t: number): string {
      const pa = parseInt(a.slice(1), 16);
      const pb = parseInt(b.slice(1), 16);
      const r = Math.round(((pa >> 16) & 0xff) * (1 - t) + ((pb >> 16) & 0xff) * t);
      const g = Math.round(((pa >> 8) & 0xff) * (1 - t) + ((pb >> 8) & 0xff) * t);
      const bl = Math.round((pa & 0xff) * (1 - t) + (pb & 0xff) * t);
      return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
    }

    // --- animate a node's r and fill over time via rAF ---
    function animateNode(
      nodeIdx: number,
      durMs: number,
      rCurve: (t: number) => number,
      colorCurve: (t: number) => string
    ) {
      const el = svgEl.querySelector(`[data-node="${nodeIdx}"]`);
      if (!el) return;
      const start = performance.now();
      function tick() {
        const t = Math.min((performance.now() - start) / durMs, 1);
        el!.setAttribute('r', String(rCurve(t)));
        el!.setAttribute('fill', colorCurve(t));
        if (t < 1 && alive) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function chargeNode(nodeIdx: number) {
      // 280ms: grow base→gold, hold at peak, shrink+snap back
      animateNode(nodeIdx, 280,
        (t) => {
          if (t < 0.35) return NODE_R + (CHARGE_R - NODE_R) * (t / 0.35);
          if (t < 0.55) return CHARGE_R;
          return CHARGE_R + (NODE_R - CHARGE_R) * ((t - 0.55) / 0.45);
        },
        (t) => {
          if (t < 0.35) return lerpColor(baseColor, GOLD, t / 0.35);
          if (t < 0.55) return GOLD;
          return lerpColor(GOLD, baseColor, (t - 0.55) / 0.45);
        }
      );
    }

    function impactNode(nodeIdx: number) {
      // 500ms: snap big + gold fast, hold, then slowly shrink + fade back
      animateNode(nodeIdx, 500,
        (t) => {
          if (t < 0.08) return NODE_R + (CHARGE_R - NODE_R) * (t / 0.08);
          if (t < 0.3) return CHARGE_R;
          return CHARGE_R + (NODE_R - CHARGE_R) * ((t - 0.3) / 0.7);
        },
        (t) => {
          if (t < 0.3) return GOLD;
          return lerpColor(GOLD, baseColor, (t - 0.3) / 0.7);
        }
      );
    }

    function spawnPulse() {
      if (!alive) return;

      const edge = edges[Math.floor(Math.random() * edges.length)];
      const [fi, ti] = Math.random() < 0.5 ? [edge[0], edge[1]] : [edge[1], edge[0]];
      const [x1, y1] = nodes[fi];
      const [x2, y2] = nodes[ti];
      const travelDur = 0.35 + Math.random() * 0.4;
      const travelMs = travelDur * 1000;

      chargeNode(fi);

      // bullet launches at peak of charge
      setTimeout(() => {
        if (!alive) return;

        const bullet = document.createElementNS(ns, 'circle');
        bullet.setAttribute('r', '1.1');
        bullet.setAttribute('fill', GOLD);
        bullet.setAttribute('stroke', 'none');

        const motion = document.createElementNS(ns, 'animateMotion');
        motion.setAttribute('dur', `${travelDur}s`);
        motion.setAttribute('path', `M${x1} ${y1} L${x2} ${y2}`);
        motion.setAttribute('fill', 'freeze');
        motion.setAttribute('begin', 'indefinite');

        bullet.appendChild(motion);
        pulsesGroup.appendChild(bullet);
        (motion as any).beginElement();

        // impact triggered by timeout, not SMIL event
        setTimeout(() => {
          bullet.remove();
          if (alive) impactNode(ti);
        }, travelMs);
      }, 100);

      spawnTimeout = setTimeout(spawnPulse, 250 + Math.random() * 400);
    }

    spawnPulse();

    return () => {
      alive = false;
      clearTimeout(spawnTimeout);
    };
  });
</script>

<svg
  bind:this={svgEl}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="loading-icon {className}"
>
  <!-- Wireframe edges -->
  <g opacity="0.15" stroke-width="1.5" stroke={wireColor}>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
    <line x1="12" y1="22" x2="12" y2="15.5" />
    <polyline points="22 8.5 12 15.5 2 8.5" />
    <polyline points="2 15.5 12 8.5 22 15.5" />
    <line x1="12" y1="2" x2="12" y2="8.5" />
  </g>

  <!-- Pulse layer (populated by JS) -->
  <g class="pulses"></g>

  <!-- Nodes -->
  <g class="nodes">
    {#each nodes as [x, y], i}
      <circle data-node={i} cx={x} cy={y} r={NODE_R} fill={nodeColor} stroke="none" />
    {/each}
  </g>
</svg>
