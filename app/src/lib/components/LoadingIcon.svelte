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

  const uid = Math.random().toString(36).slice(2, 8);
  const sphereGradId = `sphere-${uid}`;
  const chargeGradId = `charge-${uid}`;

  let svgEl: SVGSVGElement;

  onMount(() => {
    const ns = 'http://www.w3.org/2000/svg';
    let timeoutId: ReturnType<typeof setTimeout>;
    let alive = true;
    const pulsesGroup = svgEl.querySelector('.pulses')!;
    const glowsGroup = svgEl.querySelector('.glows')!;

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

    function makeGlowRing(x: number, y: number, peakOpacity: string, endR: string, dur: string) {
      const ring = document.createElementNS(ns, 'circle');
      ring.setAttribute('cx', String(x));
      ring.setAttribute('cy', String(y));
      ring.setAttribute('r', String(NODE_R));
      ring.setAttribute('fill', GOLD);
      ring.setAttribute('stroke', 'none');
      ring.setAttribute('opacity', '0');

      const expand = document.createElementNS(ns, 'animate');
      expand.setAttribute('attributeName', 'r');
      expand.setAttribute('values', `${NODE_R};${endR}`);
      expand.setAttribute('dur', dur);
      expand.setAttribute('begin', 'indefinite');
      expand.setAttribute('fill', 'freeze');

      const fade = document.createElementNS(ns, 'animate');
      fade.setAttribute('attributeName', 'opacity');
      fade.setAttribute('values', `0;${peakOpacity};0`);
      fade.setAttribute('keyTimes', '0;0.25;1');
      fade.setAttribute('dur', dur);
      fade.setAttribute('begin', 'indefinite');
      fade.setAttribute('fill', 'freeze');
      fade.addEventListener('end', () => ring.remove());

      ring.appendChild(expand);
      ring.appendChild(fade);
      glowsGroup.appendChild(ring);
      (expand as any).beginElement();
      (fade as any).beginElement();
    }

    function chargeNode(nodeIdx: number) {
      const el = svgEl.querySelector(`[data-node="${nodeIdx}"]`);
      if (!el) return;
      const [x, y] = nodes[nodeIdx];

      // swell the node
      smil(el, 'r', `${NODE_R};${CHARGE_R};${CHARGE_R};${NODE_R}`, '0.28s', {
        keyTimes: '0;0.35;0.55;1'
      });

      // gold aura while charging
      makeGlowRing(x, y, '0.5', '3.2', '0.3s');

      // briefly tint node to gold via fill swap
      smil(el, 'fill', `url(#${chargeGradId});url(#${chargeGradId});url(#${sphereGradId})`, '0.28s', {
        keyTimes: '0;0.55;1'
      });
    }

    function impactNode(nodeIdx: number) {
      const el = svgEl.querySelector(`[data-node="${nodeIdx}"]`);
      if (!el) return;
      const [x, y] = nodes[nodeIdx];

      // node briefly swells
      smil(el, 'r', `${NODE_R};2.1;${NODE_R}`, '0.25s', {
        keyTimes: '0;0.3;1'
      });

      // gold glow ring on impact
      makeGlowRing(x, y, '0.55', '4', '0.4s');

      // briefly tint node gold on absorb
      smil(el, 'fill', `url(#${chargeGradId});url(#${sphereGradId})`, '0.3s', {
        keyTimes: '0;1'
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
        bullet.setAttribute('opacity', '0');

        const motion = document.createElementNS(ns, 'animateMotion');
        motion.setAttribute('dur', `${travelDur}s`);
        motion.setAttribute('path', `M${x1} ${y1} L${x2} ${y2}`);
        motion.setAttribute('fill', 'freeze');
        motion.setAttribute('begin', 'indefinite');

        const fade = document.createElementNS(ns, 'animate');
        fade.setAttribute('attributeName', 'opacity');
        fade.setAttribute('values', '0;0.95;0.9;0');
        fade.setAttribute('keyTimes', '0;0.08;0.85;1');
        fade.setAttribute('dur', `${travelDur}s`);
        fade.setAttribute('fill', 'freeze');
        fade.setAttribute('begin', 'indefinite');

        motion.addEventListener('end', () => {
          bullet.remove();
          impactNode(ti);
        });

        bullet.appendChild(motion);
        bullet.appendChild(fade);
        pulsesGroup.appendChild(bullet);
        (motion as any).beginElement();
        (fade as any).beginElement();
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
  <defs>
    <radialGradient id={sphereGradId} cx="38%" cy="38%">
      <stop offset="0%" stop-color={nodeColor} stop-opacity="1" />
      <stop offset="100%" stop-color={nodeColor} stop-opacity="0.35" />
    </radialGradient>
    <radialGradient id={chargeGradId} cx="38%" cy="38%">
      <stop offset="0%" stop-color={GOLD} stop-opacity="1" />
      <stop offset="60%" stop-color={GOLD} stop-opacity="0.7" />
      <stop offset="100%" stop-color={nodeColor} stop-opacity="0.4" />
    </radialGradient>
  </defs>

  <!-- Wireframe edges -->
  <g opacity="0.15" stroke-width="0.75" stroke={wireColor}>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
    <line x1="12" y1="22" x2="12" y2="15.5" />
    <polyline points="22 8.5 12 15.5 2 8.5" />
    <polyline points="2 15.5 12 8.5 22 15.5" />
    <line x1="12" y1="2" x2="12" y2="8.5" />
  </g>

  <!-- Glow layer (behind nodes, populated by JS) -->
  <g class="glows"></g>

  <!-- Pulse layer (populated by JS) -->
  <g class="pulses"></g>

  <!-- Node spheres -->
  <g class="nodes">
    {#each nodes as [x, y], i}
      <circle data-node={i} cx={x} cy={y} r={NODE_R} fill="url(#{sphereGradId})" stroke="none" />
    {/each}
  </g>
</svg>
