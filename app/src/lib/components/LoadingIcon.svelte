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
    let timeoutId: ReturnType<typeof setTimeout>;
    let alive = true;
    const pulsesGroup = svgEl.querySelector('.pulses')!;
    const nodeColor_ = mode === 'light' ? '#1c1917' : '#e7e5e4';

    function smil(el: Element, attr: string, values: string, dur: string, extra?: Record<string, string>) {
      const a = document.createElementNS(ns, 'animate');
      a.setAttribute('attributeName', attr);
      a.setAttribute('values', values);
      a.setAttribute('dur', dur);
      a.setAttribute('begin', 'indefinite');
      a.setAttribute('fill', 'remove');
      if (extra) for (const [k, v] of Object.entries(extra)) a.setAttribute(k, v);
      a.addEventListener('end', () => a.remove());
      el.appendChild(a);
      (a as any).beginElement();
      return a;
    }

    function chargeNode(nodeIdx: number) {
      const el = svgEl.querySelector(`[data-node="${nodeIdx}"]`);
      if (!el) return;

      smil(el, 'r', `${NODE_R};${CHARGE_R};${CHARGE_R};${NODE_R}`, '0.28s', {
        keyTimes: '0;0.35;0.55;1'
      });

      // ramp base → gold during growth, hold at peak, snap back on release
      smil(el, 'fill', `${nodeColor_};${GOLD};${GOLD};${nodeColor_}`, '0.28s', {
        keyTimes: '0;0.35;0.55;1'
      });
    }

    function impactNode(nodeIdx: number) {
      const el = svgEl.querySelector(`[data-node="${nodeIdx}"]`);
      if (!el) return;

      // explode big on impact, then slowly shrink back
      smil(el, 'r', `${NODE_R};${CHARGE_R};${CHARGE_R};${NODE_R}`, '0.5s', {
        keyTimes: '0;0.08;0.3;1'
      });

      // strong gold on hit, hold, then fade back to base
      smil(el, 'fill', `${GOLD};${GOLD};${nodeColor_}`, '0.5s', {
        keyTimes: '0;0.3;1'
      });
    }

    function spawnPulse() {
      if (!alive) return;

      const edge = edges[Math.floor(Math.random() * edges.length)];
      const [fi, ti] = Math.random() < 0.5 ? [edge[0], edge[1]] : [edge[1], edge[0]];
      const [x1, y1] = nodes[fi];
      const [x2, y2] = nodes[ti];
      const travelDur = 0.35 + Math.random() * 0.4;

      chargeNode(fi);

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

        motion.addEventListener('end', () => {
          bullet.remove();
          impactNode(ti);
        });

        bullet.appendChild(motion);
        pulsesGroup.appendChild(bullet);
        (motion as any).beginElement();
      }, 100);

      timeoutId = setTimeout(spawnPulse, 250 + Math.random() * 400);
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
