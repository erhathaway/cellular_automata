<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavSidebar from '$lib/components/NavSidebar.svelte';
	import HistoryPanel from '$lib/components/HistoryPanel.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import AchievementNotification from '$lib/components/achievements/AchievementNotification.svelte';
	import { ClerkProvider, SignedIn, SignedOut, useClerkContext } from 'svelte-clerk';
	import SignUpNudge from '$lib/components/SignUpNudge.svelte';
	import SeizureWarningModal from '$lib/components/SeizureWarningModal.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { automataStore } from '$lib/stores/automata.svelte';
	import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
	import { deserializeRule, buildURLParams } from '$lib/stores/persistence';
	import { historyStore, type HistoryEntry } from '$lib/stores/history.svelte';

	let { children, data } = $props();

	const clerkAppearance = {
		variables: {
			colorPrimary: '#facc15',
			colorBackground: '#1c1917',
			colorInputBackground: '#0c0a09',
			colorInputText: '#d6d3d1',
			colorText: '#f5f5f4',
			colorTextSecondary: '#a8a29e',
			colorNeutral: '#d6d3d1',
			fontFamily: "'Space Grotesk', sans-serif",
			fontFamilyButtons: "'Space Mono', monospace",
			borderRadius: '6px',
		},
		elements: {
			card: {
				background: '#1c1917',
				border: '2px solid #44403c',
				boxShadow: '0 0 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(250, 204, 21, 0.06)',
			},
			formButtonPrimary: {
				background: '#facc15',
				color: '#0c0a09',
				fontFamily: "'Space Mono', monospace",
				textTransform: 'uppercase',
				letterSpacing: '0.05em',
				fontWeight: '700',
				'&:hover': {
					background: '#fbbf24',
					boxShadow: '0 0 16px rgba(250, 204, 21, 0.3)',
				},
			},
			formFieldInput: {
				background: '#0c0a09',
				borderColor: '#292524',
				color: '#d6d3d1',
				'&:focus': {
					borderColor: '#facc15',
					boxShadow: '0 0 0 2px rgba(250, 204, 21, 0.25)',
				},
			},
			socialButtonsBlockButton: {
				background: '#292524',
				border: '1px solid #44403c',
				color: '#d6d3d1',
				'&:hover': {
					background: '#44403c',
				},
			},
			footerActionLink: {
				color: '#facc15',
				'&:hover': {
					color: '#fbbf24',
				},
			},
			headerTitle: {
				fontFamily: "'Space Grotesk', sans-serif",
				color: '#f5f5f4',
			},
			headerSubtitle: {
				color: '#a8a29e',
			},
		},
	};

	type UserProfile = { displayName: string | null; avatarId: string | null; minerConfig: string | null; email: string | null } | null;
	// svelte-ignore state_referenced_locally
	let userProfile: UserProfile = $state(data.userProfile);

	// Sync server data into local state (handles post-sign-in invalidation)
	$effect(() => {
		userProfile = data.userProfile;
	});

	let darkNav = $derived($page.url.pathname === '/' || $page.url.pathname === '/mine' || $page.url.pathname.startsWith('/handbook') || $page.url.pathname.startsWith('/settings') || $page.url.pathname.startsWith('/gallery') || $page.url.pathname.startsWith('/backpack') || $page.url.pathname.startsWith('/miners') || $page.url.pathname.startsWith('/user'));
	let blackNav = $derived($page.url.pathname === '/' || $page.url.pathname.startsWith('/handbook') || $page.url.pathname.startsWith('/settings') || $page.url.pathname.startsWith('/gallery') || $page.url.pathname.startsWith('/backpack') || $page.url.pathname.startsWith('/miners') || $page.url.pathname.startsWith('/user'));

	let leftOpen = $state(true);
	let historyOpen = $state(false);

	const NAV_WIDTH = 120;
	const HISTORY_WIDTH = 380;

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
		const index = historyStore.entries.indexOf(entry);
		if (index >= 0) {
			historyStore.goToIndex(index);
		}

		const rule = deserializeRule(entry.ruleDefinition);
		if (!rule) return;

		const settings: Record<string, any> = {
			populationShape: { ...entry.populationShape },
			rule,
			cellStates: entry.cellStates.map((s) => ({ ...s })),
			neighborhoodRadius: entry.neighborhoodRadius,
		};
		if (entry.lattice) settings.lattice = entry.lattice;
		if (entry.trailConfig) settings.trailConfig = { ...entry.trailConfig };

		automataStore.hydrateCombo(entry.dimension, entry.viewer, settings);
		automataStore.hydrateActive(entry.dimension, entry.viewer);
		automataStore.generationRunId = null;
		automataStore.savedSeed = null;
		automataStore.useSavedSeed = true;
		automataStore.resetMiningToRandom();
		automataStore.reset();

		const params = buildURLParams(entry.dimension, entry.viewer, settings);
		goto(`/mine?${params.toString()}`, { replaceState: true });

		historyOpen = false;
		animateResize();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Cellular Automata</title>
</svelte:head>

<SeizureWarningModal />

<ClerkProvider {...data} appearance={clerkAppearance}>
	<div class="flex h-screen w-screen overflow-hidden">
		<!-- Nav rail -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="relative z-10 h-full shrink-0"
			style="width: {NAV_WIDTH}px; background: {blackNav ? '#000000' : darkNav ? '#1c1917' : '#f5f5f4'}; border-right: 1px solid {darkNav ? '#44403c' : '#d6d3d1'};"
			onclick={() => { if (historyOpen) { historyOpen = false; animateResize(); } }}
		>
			<NavSidebar {userProfile} {historyOpen} dark={darkNav} black={blackNav} onhistoryclick={toggleHistory} />
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
		<AchievementNotification />
	</SignedIn>

	<SignedOut>
		<SignUpNudge />
	</SignedOut>
</ClerkProvider>

<style>
	.history-backdrop {
		position: absolute;
		inset: 0;
		z-index: 50;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(4px);
	}

	.history-panel {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		z-index: 55;
		background: #1c1917;
		border-right: 1px solid #44403c;
		box-shadow:
			4px 0 24px rgba(0, 0, 0, 0.4),
			0 0 12px rgba(250, 204, 21, 0.04);
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
