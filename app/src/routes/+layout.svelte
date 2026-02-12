<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavSidebar from '$lib/components/NavSidebar.svelte';
	import HistoryPanel from '$lib/components/HistoryPanel.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import { ClerkProvider, SignedIn } from 'svelte-clerk';
	import { goto } from '$app/navigation';
	import { automataStore } from '$lib/stores/automata.svelte';
	import { deserializeRule, buildURLParams } from '$lib/stores/persistence';
	import type { HistoryEntry } from '$lib/stores/history.svelte';

	let { children, data } = $props();

	type UserProfile = { displayName: string | null; avatarId: string | null; email: string | null } | null;
	// svelte-ignore state_referenced_locally
	let userProfile: UserProfile = $state(data.userProfile);

	let leftOpen = $state(true);
	let settingsOpen = $state(false);
	let historyOpen = $state(false);

	const NAV_WIDTH = 120;
	const HISTORY_WIDTH = 280;

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

	function toggleHistory() {
		historyOpen = !historyOpen;
		animateResize();
	}

	function handleHistoryLoad(entry: HistoryEntry) {
		const rule = deserializeRule(entry.ruleDefinition);
		if (!rule) return;

		const settings = {
			populationShape: { ...entry.populationShape },
			rule,
			cellStates: entry.cellStates.map((s) => ({ ...s })),
			neighborhoodRadius: entry.neighborhoodRadius,
		};

		automataStore.hydrateCombo(entry.dimension, entry.viewer, settings);
		automataStore.hydrateActive(entry.dimension, entry.viewer);
		automataStore.savedSeed = null;
		automataStore.useSavedSeed = true;
		automataStore.reset();

		const params = buildURLParams(entry.dimension, entry.viewer, settings);
		goto(`/?${params.toString()}`);

		historyOpen = false;
		animateResize();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Cellular Automata</title>
</svelte:head>

<ClerkProvider {...data}>
	<div class="flex h-screen w-screen overflow-hidden">
		<!-- Nav rail -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="relative z-10 h-full shrink-0"
			style="width: {NAV_WIDTH}px; background: #f5f5f4; border-right: 1px solid #d6d3d1;"
			onclick={() => { if (historyOpen) { historyOpen = false; animateResize(); } }}
		>
			<NavSidebar {userProfile} {historyOpen} onsettingsclick={() => { settingsOpen = true; }} onhistoryclick={toggleHistory} />
		</div>

		<!-- Main content -->
		<div class="relative h-full min-w-0 flex-1 overflow-hidden">
			{@render children()}

			<!-- History overlay — scoped to main content area -->
			{#if historyOpen}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="history-backdrop" onclick={() => { historyOpen = false; animateResize(); }}></div>
				<div class="history-panel" style="width: {HISTORY_WIDTH}px;">
					<HistoryPanel onload={handleHistoryLoad} />
				</div>
			{/if}
		</div>
	</div>

	<SignedIn>
		<OnboardingModal {userProfile} onprofileupdated={(p) => { userProfile = p; }} />
		<SettingsModal bind:open={settingsOpen} {userProfile} onprofileupdated={(p) => { userProfile = p; }} />
	</SignedIn>
</ClerkProvider>

<style>
	.history-backdrop {
		position: absolute;
		inset: 0;
		z-index: 50;
		background: rgba(28, 25, 23, 0.25);
		backdrop-filter: blur(3px);
	}

	.history-panel {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		z-index: 55;
		background: white;
		border-right: 1px solid #d6d3d1;
		box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		animation: slide-in 0.25s ease-out;
	}

	@keyframes slide-in {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>
