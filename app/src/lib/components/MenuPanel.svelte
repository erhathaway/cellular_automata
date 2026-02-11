<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import MenuItemDisplay from './menu/MenuItemDisplay.svelte';
  import ShapePopup from './menu/ShapePopup.svelte';
  import StatesPopup from './menu/StatesPopup.svelte';
  import RulePopup from './menu/RulePopup.svelte';
  import NeighborhoodPopup from './menu/NeighborhoodPopup.svelte';

  const MENU_WIDTH = 160;
  const UNDOCKED_MENU_HEIGHT = 420;
  const CLOSED_MENU_HEIGHT = 70;
  const DOCKED_HORIZONTAL_HEIGHT = 140;
  const DOCK_THRESHOLD = 10;

  let isOpen = $state(true);
  let activePopup: string | null = $state(null);

  // Popup anchor: the bounding rect of the clicked menu item
  let popupAnchorRect: DOMRect | null = $state(null);

  // Refs for click-outside detection (not reactive, just DOM refs)
  let navEl = $state<HTMLElement>(undefined!);
  let popupEl = $state<HTMLElement>(undefined!);

  function closePopup() {
    activePopup = null;
    popupAnchorRect = null;
  }

  function onWindowClick(e: MouseEvent) {
    if (!activePopup) return;
    const target = e.target as Node;
    if (popupEl?.contains(target)) return;
    closePopup();
  }

  onMount(() => {
    window.addEventListener('click', onWindowClick);
    return () => window.removeEventListener('click', onWindowClick);
  });

  // Drag state
  let isDragging = $state(false);
  let menuX = $state(50);
  let menuY = $state(70);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartMenuX = 0;
  let dragStartMenuY = 0;

  function getContainerRect(): DOMRect {
    const parent = navEl?.parentElement;
    if (parent) return parent.getBoundingClientRect();
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  }

  // Dock state
  type MenuPlacement = undefined | 'willDockTop' | 'willDockLeft' | 'willDockRight' | 'hasDockedTop' | 'hasDockedLeft' | 'hasDockedRight';
  let menuPlacement: MenuPlacement = $state(undefined);

  // Track whether we just docked/undocked to apply transition briefly
  let isTransitioning = $state(false);
  let transitionTimer: ReturnType<typeof setTimeout> | undefined;

  function triggerTransition() {
    isTransitioning = true;
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => { isTransitioning = false; }, 350);
  }

  let isDocked = $derived(menuPlacement?.startsWith('hasDocked') ?? false);
  let isDockedTop = $derived(menuPlacement === 'hasDockedTop');
  let isDockedLeft = $derived(menuPlacement === 'hasDockedLeft');
  let isDockedRight = $derived(menuPlacement === 'hasDockedRight');

  function onDragStart(e: MouseEvent) {
    isDragging = true;
    isTransitioning = false;
    clearTimeout(transitionTimer);
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartMenuX = menuX;
    dragStartMenuY = menuY;

    if (isDocked) {
      const cr = getContainerRect();
      menuPlacement = undefined;
      menuX = e.clientX - cr.left - MENU_WIDTH / 2;
      menuY = e.clientY - cr.top - 17;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartMenuX = menuX;
      dragStartMenuY = menuY;
    }

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }

  function onDragMove(e: MouseEvent) {
    if (!isDragging) return;
    menuX = dragStartMenuX + (e.clientX - dragStartX);
    menuY = dragStartMenuY + (e.clientY - dragStartY);

    const cr = getContainerRect();
    const localX = e.clientX - cr.left;
    const localY = e.clientY - cr.top;

    if (localY < DOCK_THRESHOLD) {
      if (menuPlacement !== 'willDockTop') menuPlacement = 'willDockTop';
    } else if (localX < DOCK_THRESHOLD) {
      if (menuPlacement !== 'willDockLeft') menuPlacement = 'willDockLeft';
    } else if (localX > cr.width - MENU_WIDTH - DOCK_THRESHOLD) {
      if (menuPlacement !== 'willDockRight') menuPlacement = 'willDockRight';
    } else if (menuPlacement !== undefined) {
      menuPlacement = undefined;
    }
  }

  function onDragEnd() {
    isDragging = false;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);

    if (menuPlacement === 'willDockLeft') {
      triggerTransition();
      menuPlacement = 'hasDockedLeft';
    } else if (menuPlacement === 'willDockRight') {
      triggerTransition();
      menuPlacement = 'hasDockedRight';
    } else if (menuPlacement === 'willDockTop') {
      triggerTransition();
      menuPlacement = 'hasDockedTop';
    }
  }

  function togglePopup(name: string, el: HTMLElement) {
    if (activePopup === name) {
      activePopup = null;
      popupAnchorRect = null;
    } else {
      activePopup = name;
      popupAnchorRect = el.getBoundingClientRect();
    }
  }

  function truncateNumber(n: number): string {
    const num = Math.floor(n);
    const mils = Math.floor(num / 1000000);
    const thousands = Math.floor((num - mils * 1000000) / 1000);
    if (mils > 0) return `${mils}m`;
    if (thousands > 0) return `${thousands}k`;
    return `${num}`;
  }

  // Compute display values
  let statesDisplay = $derived(`${automataStore.cellStates.length}`);
  let neighborsDisplay = $derived(
    automataStore.neighborhoodRadius > 1
      ? `${automataStore.neighbors.length} (r=${automataStore.neighborhoodRadius})`
      : `${automataStore.neighbors.length}`
  );
  let ruleDisplay = $derived(() => {
    const rule = automataStore.rule;
    if (rule.type === 'wolfram') return `${rule.rule}`;
    return `S${rule.survive.join('')} B${rule.born.join('')}`;
  });
  let shapeDisplay = $derived(() => {
    const shape = automataStore.populationShape;
    return Object.entries(shape)
      .map(([k, v]) => `${k} ${truncateNumber(v)}`)
      .join('  ');
  });

  // Popup position: anchored to the clicked menu item via getBoundingClientRect
  let popupStyle = $derived.by(() => {
    if (!popupAnchorRect) return '';
    const r = popupAnchorRect;

    if (isDockedRight) {
      // Popup to the left of the menu item
      return `right: ${window.innerWidth - r.x + 10}px; top: ${r.y}px;`;
    }
    if (isDockedTop) {
      // Popup below the menu item
      return `left: ${r.x}px; top: ${r.y + r.height + 10}px;`;
    }
    // Undocked or docked left: popup to the right of the menu item
    return `left: ${r.x + r.width + 10}px; top: ${r.y}px;`;
  });

  // Nav style
  let navStyle = $derived.by(() => {
    const base = 'background-color: white; overflow: hidden;';
    const transition = isTransitioning
      ? 'transition: left 0.3s ease-out, top 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out, border-radius 0.3s ease-out;'
      : '';

    if (isDockedLeft) {
      return `${base} ${transition} left: 0; top: 0; width: ${MENU_WIDTH}px; height: 100%; border-radius: 0; box-shadow: 2px 0 6px rgba(0,0,0,0.15), 6px 0 14px rgba(0,0,0,0.1);`;
    }
    if (isDockedRight) {
      return `${base} ${transition} right: 0; top: 0; width: ${MENU_WIDTH}px; height: 100%; border-radius: 0; box-shadow: -2px 0 6px rgba(0,0,0,0.15), -6px 0 14px rgba(0,0,0,0.1);`;
    }
    if (isDockedTop) {
      return `${base} ${transition} left: 0; top: 0; width: 100%; height: ${DOCKED_HORIZONTAL_HEIGHT}px; border-radius: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.1);`;
    }
    const h = isOpen ? UNDOCKED_MENU_HEIGHT : CLOSED_MENU_HEIGHT;
    return `${base} ${transition} left: ${menuX}px; top: ${menuY}px; width: ${MENU_WIDTH}px; height: ${h}px; border-radius: 6px; border: 1px solid rgba(220,220,220,0.8); box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.1);`;
  });
</script>

<!-- Dock preview overlays -->
{#if menuPlacement === 'willDockLeft'}
  <div
    class="pointer-events-none absolute left-0 top-0 z-[998]"
    style="width: {MENU_WIDTH}px; height: 100%; background-color: rgba(94, 80, 80, 0.2);"
  ></div>
{/if}
{#if menuPlacement === 'willDockRight'}
  <div
    class="pointer-events-none absolute right-0 top-0 z-[998]"
    style="width: {MENU_WIDTH}px; height: 100%; background-color: rgba(94, 80, 80, 0.2);"
  ></div>
{/if}
{#if menuPlacement === 'willDockTop'}
  <div
    class="pointer-events-none absolute left-0 top-0 z-[998]"
    style="width: 100%; height: {DOCKED_HORIZONTAL_HEIGHT}px; background-color: rgba(94, 80, 80, 0.2);"
  ></div>
{/if}

<!-- Menu nav -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<nav
  bind:this={navEl}
  class="absolute z-[999] flex items-center {isDockedTop ? 'flex-row' : 'flex-col'}"
  style={navStyle}
>
  <!-- Drag handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex cursor-grab items-center justify-center {isDockedTop ? 'flex-col' : 'flex-row'}"
    style="{isDockedTop ? 'width: 50px; height: 100%;' : isDocked ? 'width: 100%; height: 60px;' : 'width: 100%; height: 35px; min-height: 35px;'}"
    onmousedown={onDragStart}
  >
    <div class="mx-[3px] my-[5px] h-[6px] w-[6px] rounded-full bg-gray-400"></div>
    <div class="mx-[3px] my-[5px] h-[6px] w-[6px] rounded-full bg-gray-400"></div>
    <div class="mx-[3px] my-[5px] h-[6px] w-[6px] rounded-full bg-gray-400"></div>
  </div>

  {#if isOpen || isDocked}
    <!-- Content container -->
    <div
      class="flex flex-1 items-center justify-center"
      style="width: 100%; height: 100%; align-content: stretch; {isDockedTop ? 'flex-direction: row;' : 'flex-direction: column;'}"
    >
      <!-- Menu items -->
      <div
        class="flex items-center"
        style="flex: 1; {isDockedTop ? 'flex-direction: row; height: 100%;' : 'flex-direction: column; width: 100%;'}"
      >
        <MenuItemDisplay
          title="States"
          value={statesDisplay}
          isMenuMoving={isDragging}
          {menuPlacement}
          onclick={(el) => togglePopup('states', el)}
        />
        <MenuItemDisplay
          title="Population"
          value={shapeDisplay()}
          isMenuMoving={isDragging}
          {menuPlacement}
          onclick={(el) => togglePopup('shape', el)}
        />
        <MenuItemDisplay
          title="Neighbors"
          value={neighborsDisplay}
          isMenuMoving={isDragging}
          {menuPlacement}
          onclick={(el) => togglePopup('neighbors', el)}
        />
        <MenuItemDisplay
          title="Rule"
          value={ruleDisplay()}
          isMenuMoving={isDragging}
          {menuPlacement}
          onclick={(el) => togglePopup('rule', el)}
        />
        <MenuItemDisplay
          title="Genesis"
          value="Random"
          isMenuMoving={isDragging}
          {menuPlacement}
        />
      </div>

    </div>
  {/if}
</nav>

<!-- Popup area (fixed, anchored to the clicked menu item) -->
{#if activePopup && popupAnchorRect}
  <div
    bind:this={popupEl}
    class="fixed z-[1000]"
    style="min-width: 270px; {popupStyle}"
  >
    <div
      class="flex flex-col items-center justify-center rounded-sm"
      style="background-color: white;
             box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.1);
             border: 1px solid rgba(220,220,220,0.8);
             margin: 3px; padding: 16px;"
    >
      {#if activePopup === 'shape'}
        <ShapePopup />
      {:else if activePopup === 'states'}
        <StatesPopup />
      {:else if activePopup === 'neighbors'}
        <NeighborhoodPopup />
      {:else if activePopup === 'rule'}
        <RulePopup />
      {/if}
    </div>
  </div>
{/if}
