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

<section class="relative h-screen">
  <ViewPlayer />
  <MenuPanel />
  <ViewModeSwitcher />
  <ViewControls />
  <StableModal />
  <RandomRuleButton />
</section>

<section class="relative z-10 bg-white">
  <ViewerDescription />
  <ViewerComments />
</section>
