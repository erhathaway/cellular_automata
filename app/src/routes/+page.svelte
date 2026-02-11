<script lang="ts">
	import ViewPlayer from '$lib/components/ViewPlayer.svelte';
	import MenuPanel from '$lib/components/MenuPanel.svelte';
	import ViewControls from '$lib/components/ViewControls.svelte';
	import ViewModeSwitcher from '$lib/components/ViewModeSwitcher.svelte';
</script>

<div class="relative h-full w-full">
	<ViewPlayer />
	<MenuPanel />
	<ViewModeSwitcher />
	<ViewControls />
</div>
