<script lang="ts">
  let { children } = $props();

  let leftOpen = $state(true);
  let rightOpen = $state(false);

  const DRAWER_WIDTH = 260;

  function toggleLeft() {
    leftOpen = !leftOpen;
    animateResize();
  }

  function toggleRight() {
    rightOpen = !rightOpen;
    animateResize();
  }

  function animateResize() {
    const start = performance.now();
    const duration = 320;
    function loop() {
      window.dispatchEvent(new Event('resize'));
      if (performance.now() - start < duration) {
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);
  }
</script>

<div class="flex h-full w-full">
  <!-- Left drawer -->
  <aside
    class="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
    style:width="{leftOpen ? DRAWER_WIDTH : 0}px"
    style:background="linear-gradient(to right, rgb(0,0,0), rgba(0,0,0,0.92))"
  >
    <div class="h-full" style:width="{DRAWER_WIDTH}px">
      <!-- Left drawer content -->
    </div>
  </aside>

  <!-- Left toggle tab -->
  <button
    class="z-10 flex h-12 w-6 shrink-0 cursor-pointer items-center justify-center self-center border-none text-neutral-500 transition-colors hover:text-white"
    style="background: rgba(0,0,0,0.7); border-radius: 0 6px 6px 0;"
    onclick={toggleLeft}
    aria-label={leftOpen ? 'Close left panel' : 'Open left panel'}
  >
    <svg class="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
      {#if leftOpen}
        <path d="M7.5 2L4.5 6L7.5 10" />
      {:else}
        <path d="M4.5 2L7.5 6L4.5 10" />
      {/if}
    </svg>
  </button>

  <!-- Center: viewer content -->
  <main class="relative h-full min-w-0 flex-1 overflow-hidden">
    {@render children()}
  </main>

  <!-- Right toggle tab -->
  <button
    class="z-10 flex h-12 w-6 shrink-0 cursor-pointer items-center justify-center self-center border-none text-neutral-500 transition-colors hover:text-white"
    style="background: rgba(0,0,0,0.7); border-radius: 6px 0 0 6px;"
    onclick={toggleRight}
    aria-label={rightOpen ? 'Close right panel' : 'Open right panel'}
  >
    <svg class="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
      {#if rightOpen}
        <path d="M4.5 2L7.5 6L4.5 10" />
      {:else}
        <path d="M7.5 2L4.5 6L7.5 10" />
      {/if}
    </svg>
  </button>

  <!-- Right drawer -->
  <aside
    class="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
    style:width="{rightOpen ? DRAWER_WIDTH : 0}px"
    style:background="linear-gradient(to left, rgb(0,0,0), rgba(0,0,0,0.92))"
  >
    <div class="h-full" style:width="{DRAWER_WIDTH}px">
      <!-- Right drawer content (placeholder) -->
    </div>
  </aside>
</div>
