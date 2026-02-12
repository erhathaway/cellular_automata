<script lang="ts">
  import ViewPlayer from '$lib/components/ViewPlayer.svelte';
  import MenuPanel from '$lib/components/MenuPanel.svelte';
  import ViewModeSwitcher from '$lib/components/ViewModeSwitcher.svelte';
  import ViewControls from '$lib/components/ViewControls.svelte';
  import StableModal from '$lib/components/StableModal.svelte';
  import RandomRuleButton from '$lib/components/RandomRuleButton.svelte';
  import ViewerDescription from '$lib/components/ViewerDescription.svelte';
  import ViewerComments from '$lib/components/ViewerComments.svelte';
  import CornerBlocks from '$lib/components/CornerBlocks.svelte';
</script>

<div class="relative m-4" style="height: 75vh;">
  <CornerBlocks />
  <!-- Electric containment edges over the black border -->
  <span class="edge top"></span>
  <span class="edge bottom"></span>
  <span class="edge left"></span>
  <span class="edge right"></span>
  <section class="relative h-full overflow-hidden rounded-2xl" style="border: 14px solid #000;">
    <ViewPlayer />
    <div class="pointer-events-none absolute inset-0 z-10 rounded-2xl" style="box-shadow: inset 0 0 30px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.1);"></div>
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-lg p-1" style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);">
      <ViewModeSwitcher />
      <div class="mx-1 h-5 w-px" style="background: rgba(255,255,255,0.15);"></div>
      <MenuPanel />
    </div>
    <ViewControls />
    <StableModal />
  </section>
  <div class="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex translate-y-1/2 justify-center">
    <div class="pointer-events-auto relative">
      <RandomRuleButton />
    </div>
  </div>
</div>

<section class="relative z-10 bg-white">
  <ViewerDescription />
  <ViewerComments />
</section>

<style>
  /* Electric edges overlaying the black border */
  .edge {
    position: absolute;
    z-index: 15;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(250, 204, 21, 0.5));
  }

  .edge.top, .edge.bottom {
    left: 60px;
    right: 60px;
    height: 2px;
    background: repeating-linear-gradient(
      90deg, #facc15 0px, #facc15 4px, transparent 4px, transparent 9px
    );
    background-size: 18px 2px;
    animation: electric-h 0.6s linear infinite;
  }

  .edge.top { top: 6px; }
  .edge.bottom { bottom: 6px; }

  .edge.left, .edge.right {
    top: 60px;
    bottom: 60px;
    width: 2px;
    background: repeating-linear-gradient(
      180deg, #facc15 0px, #facc15 4px, transparent 4px, transparent 9px
    );
    background-size: 2px 18px;
    animation: electric-v 0.6s linear infinite;
  }

  .edge.left { left: 6px; }
  .edge.right { right: 6px; }

  @keyframes electric-h {
    0%   { background-position: 0 0; }
    100% { background-position: 18px 0; }
  }

  @keyframes electric-v {
    0%   { background-position: 0 0; }
    100% { background-position: 0 18px; }
  }
</style>
