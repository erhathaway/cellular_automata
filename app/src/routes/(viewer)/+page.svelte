<script lang="ts">
  import ViewPlayer from '$lib/components/ViewPlayer.svelte';
  import MenuPanel from '$lib/components/MenuPanel.svelte';
  import ViewModeSwitcher from '$lib/components/ViewModeSwitcher.svelte';
  import ViewControls from '$lib/components/ViewControls.svelte';
  import StableModal from '$lib/components/StableModal.svelte';
  import RandomRuleButton from '$lib/components/RandomRuleButton.svelte';
  import ViewerDescription from '$lib/components/ViewerDescription.svelte';
  import ViewerComments from '$lib/components/ViewerComments.svelte';
</script>

<div class="relative m-4" style="height: 75vh;">
  <section class="relative h-full overflow-hidden rounded-2xl">
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
    <div class="pointer-events-auto">
      <RandomRuleButton />
    </div>
  </div>
</div>

<section class="relative z-10 bg-white">
  <ViewerDescription />
  <ViewerComments />
</section>
