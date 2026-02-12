<script lang="ts">
  import ViewPlayer from '$lib/components/ViewPlayer.svelte';
  import MenuPanel from '$lib/components/MenuPanel.svelte';
  import ViewModeSwitcher from '$lib/components/ViewModeSwitcher.svelte';
  import ViewControls from '$lib/components/ViewControls.svelte';
  import RandomRuleButton from '$lib/components/RandomRuleButton.svelte';
  import MiningLevelButton from '$lib/components/MiningLevelButton.svelte';
  import LatticePickerButton from '$lib/components/LatticePickerButton.svelte';
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
  </section>
  <div class="pointer-events-none absolute bottom-0 left-0 right-0 z-30 translate-y-1/2">
    <div class="controls-row">
      <div class="controls-left pointer-events-auto">
        <div class="pipe-backdrop"></div>
        <MiningLevelButton />
      </div>
      <div class="controls-center pointer-events-auto">
        <RandomRuleButton />
      </div>
      <div class="controls-right pointer-events-auto">
        <div class="pipe-backdrop-right"></div>
        <LatticePickerButton />
      </div>
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

  .controls-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;
  }

  .controls-left {
    justify-self: end;
    margin-right: 38px;
    position: relative;
  }

  .controls-center {
    justify-self: center;
    position: relative;
  }

  .controls-right {
    justify-self: start;
    margin-left: 38px;
    position: relative;
  }

  .controls-left :global(.level-root) {
    transform: translateX(-2px);
  }

  /* Glowing connector pipe from level button to mine button */
  .controls-left::after {
    content: '';
    position: absolute;
    left: calc(100% - 4px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 42px;
    height: 14px;
    border-radius: 3px;
    border: 2px solid #0e7490;
    background:
      linear-gradient(
        90deg,
        #0c4a6e 0%,
        #22d3ee 50%,
        #0c4a6e 100%
      );
    box-shadow:
      0 0 10px rgba(34, 211, 238, 0.75),
      inset 0 0 6px rgba(103, 232, 249, 0.95);
    pointer-events: none;
    z-index: 2;
    animation: connector-pulse 1.1s ease-in-out infinite;
  }

  .controls-left::before {
    content: '';
    position: absolute;
    left: calc(100% + 38px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .controls-left .pipe-backdrop {
    position: absolute;
    left: calc(100% - 5px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 50px;
    height: 18px;
    border-radius: 3px;
    background: #1c1917;
    pointer-events: none;
    z-index: 1;
  }

  .controls-right :global(.lattice-root) {
    transform: translateX(2px);
  }

  /* Glowing connector pipe from mine button to lattice button */
  .controls-right::after {
    content: '';
    position: absolute;
    right: calc(100% - 4px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 42px;
    height: 14px;
    border-radius: 3px;
    border: 2px solid #0e7490;
    background:
      linear-gradient(
        90deg,
        #0c4a6e 0%,
        #22d3ee 50%,
        #0c4a6e 100%
      );
    box-shadow:
      0 0 10px rgba(34, 211, 238, 0.75),
      inset 0 0 6px rgba(103, 232, 249, 0.95);
    pointer-events: none;
    z-index: 2;
    animation: connector-pulse 1.1s ease-in-out infinite;
  }

  .controls-right::before {
    content: '';
    position: absolute;
    right: calc(100% + 38px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .controls-right .pipe-backdrop-right {
    position: absolute;
    right: calc(100% - 5px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 50px;
    height: 18px;
    border-radius: 3px;
    background: #1c1917;
    pointer-events: none;
    z-index: 1;
  }

  .controls-center::before,
  .controls-center::after {
    content: '';
    position: absolute;
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .controls-center::before {
    left: -22px;
  }

  .controls-center::after {
    right: -22px;
  }

  @keyframes connector-pulse {
    0% {
      box-shadow:
        0 0 8px rgba(34, 211, 238, 0.45),
        inset 0 0 4px rgba(34, 211, 238, 0.45);
    }
    50% {
      box-shadow:
        0 0 14px rgba(34, 211, 238, 0.9),
        inset 0 0 8px rgba(103, 232, 249, 0.85);
    }
    100% {
      box-shadow:
        0 0 8px rgba(34, 211, 238, 0.45),
        inset 0 0 4px rgba(34, 211, 238, 0.45);
    }
  }
</style>
