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

<section class="relative m-4 overflow-hidden rounded-2xl" style="height: 75vh;">
  <ViewPlayer />
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-lg p-1" style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);">
    <ViewModeSwitcher />
    <div class="mx-1 h-5 w-px" style="background: rgba(255,255,255,0.15);"></div>
    <MenuPanel />
  </div>
  <ViewControls />
  <StableModal />
  <RandomRuleButton />
</section>

<section class="relative z-10 bg-white">
  <ViewerDescription />
  <ViewerComments />
</section>
