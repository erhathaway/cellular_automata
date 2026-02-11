<script lang="ts">
  import RightDrawerContent from '$lib/components/RightDrawerContent.svelte';
  import PersistenceManager from '$lib/components/PersistenceManager.svelte';

  let { children } = $props();

  let rightOpen = $state(true);

  const RIGHT_WIDTH = 360;

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

<PersistenceManager />

<div class="flex h-full w-full">
  <!-- Center: viewer content -->
  <main class="relative h-full min-w-0 flex-1 overflow-y-auto">
    {@render children()}

    <!-- Right toggle tab -->
    <button
      class="absolute right-0 top-4 z-30 flex h-12 w-6 cursor-pointer items-center justify-center border-none bg-white text-neutral-400 shadow-md transition-colors hover:text-neutral-700"
      style="border-radius: 6px 0 0 6px;"
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
  </main>

  <!-- Right drawer -->
  <aside
    class="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
    style:width="{rightOpen ? RIGHT_WIDTH : 0}px"
    style:background="white"
    style:border-left="1px solid #e5e5e5"
  >
    <div class="h-full" style:width="{RIGHT_WIDTH}px">
      <RightDrawerContent />
    </div>
  </aside>
</div>
