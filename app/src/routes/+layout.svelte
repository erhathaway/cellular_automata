<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavSidebar from '$lib/components/NavSidebar.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import { ClerkProvider, SignedIn } from 'svelte-clerk';

	let { children, data } = $props();

	type UserProfile = { displayName: string | null; avatarId: string | null; email: string | null } | null;
	let userProfile: UserProfile = $state(data.userProfile);

	let leftOpen = $state(true);
	let settingsOpen = $state(false);

	const LEFT_WIDTH = 72;

	function toggleLeft() {
		leftOpen = !leftOpen;
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

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Cellular Automata</title>
</svelte:head>

<ClerkProvider {...data}>
	<div class="flex h-screen w-screen overflow-hidden">
		<!-- Left drawer -->
		<aside
			class="relative z-10 h-full shrink-0 transition-[width] duration-300 ease-out"
			style:width="{leftOpen ? LEFT_WIDTH : 0}px"
		>
			<div
				class="h-full overflow-hidden"
				style="width: {LEFT_WIDTH}px; background: white; border-right: 1px solid #e5e5e5;"
			>
				<NavSidebar {userProfile} onsettingsclick={() => { settingsOpen = true; }} />
			</div>
		</aside>

		<!-- Main content -->
		<div class="relative h-full min-w-0 flex-1 overflow-hidden">
			{@render children()}

			<!-- Left toggle tab -->
			<button
				class="absolute left-0 top-4 z-30 flex h-12 w-6 cursor-pointer items-center justify-center border-none bg-white text-neutral-400 transition-colors hover:text-black"
				style="border: 1px solid #e5e5e5; border-left: none; border-radius: 0 6px 6px 0;"
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
		</div>
	</div>

	<SignedIn>
		<OnboardingModal {userProfile} onprofileupdated={(p) => { userProfile = p; }} />
		<SettingsModal bind:open={settingsOpen} {userProfile} onprofileupdated={(p) => { userProfile = p; }} />
	</SignedIn>
</ClerkProvider>
