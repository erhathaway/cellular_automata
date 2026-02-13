<script lang="ts">
	import { onMount } from 'svelte';
	import { audioStore } from '$lib/stores/audio.svelte';

	let { inline = false }: { inline?: boolean } = $props();

	let audioEl: HTMLAudioElement | undefined = $state();
	let playing = $state(false);

	$effect(() => {
		audioStore.playing = playing;
	});
	let volume = $state(0.5);
	let started = $state(false);

	function toggle() {
		if (!audioEl) return;
		if (audioEl.paused) {
			audioEl.play();
			playing = true;
			started = true;
		} else {
			audioEl.pause();
			playing = false;
		}
	}

	function handleVolume(e: Event) {
		const target = e.target as HTMLInputElement;
		volume = parseFloat(target.value);
		if (audioEl) audioEl.volume = volume;
	}

	// Autoplay on first user interaction
	function autoplay() {
		if (audioEl && audioEl.paused && !started) {
			audioEl.volume = volume;
			audioEl.play();
			playing = true;
			started = true;
		}
		document.removeEventListener('click', autoplay);
		document.removeEventListener('keydown', autoplay);
	}

	onMount(() => {
		if (audioEl) audioEl.volume = volume;
		document.addEventListener('click', autoplay);
		document.addEventListener('keydown', autoplay);
		return () => {
			document.removeEventListener('click', autoplay);
			document.removeEventListener('keydown', autoplay);
		};
	});
</script>

<audio bind:this={audioEl} src="/toejam-jammin.mp3" loop preload="auto" onended={() => { if (audioEl && started) { audioEl.currentTime = 0; audioEl.play(); } }}></audio>

<div class="boombox" class:boombox-inline={inline}>
	<!-- Left speaker -->
	<div class="speaker-zone">
		{#if playing}
			<div class="wave wave-1"></div>
			<div class="wave wave-2"></div>
			<div class="wave wave-3"></div>
		{/if}
		<svg class="speaker-svg" viewBox="0 0 44 44" width="44" height="44">
			<!-- Outer ring -->
			<circle cx="22" cy="22" r="20" fill="none" stroke="#44403c" stroke-width="1.5" />
			<!-- Surround -->
			<circle cx="22" cy="22" r="17" fill="#1a1816" stroke="#292524" stroke-width="1" />
			<!-- Cone ridges -->
			<circle cx="22" cy="22" r="14" fill="none" stroke="#292524" stroke-width="0.5" />
			<circle cx="22" cy="22" r="10.5" fill="none" stroke="#292524" stroke-width="0.5" />
			<circle cx="22" cy="22" r="7" fill="none" stroke="#292524" stroke-width="0.5" />
			<!-- Dust cap -->
			<circle cx="22" cy="22" r="4.5" fill="#292524" stroke="#44403c" stroke-width="0.5" />
			<circle cx="22" cy="22" r="1.5" fill="#44403c" />
		</svg>
	</div>

	<!-- Center controls -->
	<div class="controls">
		<button class="play-btn" onclick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
			{#if playing}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
					<rect x="3" y="2" width="4" height="12" rx="1" />
					<rect x="9" y="2" width="4" height="12" rx="1" />
				</svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
					<path d="M4 2.5v11l9-5.5z" />
				</svg>
			{/if}
		</button>

		<span class="track-name">ToeJam Jammin'</span>

		<div class="vol-group">
			<svg class="vol-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
				<path d="M2 5.5h2.5L8 2v12L4.5 10.5H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" />
				{#if volume > 0}
					<path d="M10 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" />
				{/if}
				{#if volume > 0.5}
					<path d="M11.5 3.5a6 6 0 0 1 0 9" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" />
				{/if}
			</svg>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={volume}
				oninput={handleVolume}
				class="vol-slider"
				aria-label="Volume"
			/>
		</div>
	</div>

	<!-- Right speaker -->
	<div class="speaker-zone speaker-right">
		{#if playing}
			<div class="wave wave-1"></div>
			<div class="wave wave-2"></div>
			<div class="wave wave-3"></div>
		{/if}
		<svg class="speaker-svg" viewBox="0 0 44 44" width="44" height="44">
			<circle cx="22" cy="22" r="20" fill="none" stroke="#44403c" stroke-width="1.5" />
			<circle cx="22" cy="22" r="17" fill="#1a1816" stroke="#292524" stroke-width="1" />
			<circle cx="22" cy="22" r="14" fill="none" stroke="#292524" stroke-width="0.5" />
			<circle cx="22" cy="22" r="10.5" fill="none" stroke="#292524" stroke-width="0.5" />
			<circle cx="22" cy="22" r="7" fill="none" stroke="#292524" stroke-width="0.5" />
			<circle cx="22" cy="22" r="4.5" fill="#292524" stroke="#44403c" stroke-width="0.5" />
			<circle cx="22" cy="22" r="1.5" fill="#44403c" />
		</svg>
	</div>
</div>

<style>
	.boombox {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 0;
		height: 56px;
		background: linear-gradient(180deg, #1c1917 0%, #0c0a09 100%);
		backdrop-filter: blur(12px);
		border: 2px solid #44403c;
		border-bottom: none;
		border-radius: 14px 14px 0 0;
		font-family: 'Space Mono', monospace;
		font-size: 12px;
		color: #a8a29e;
		width: fit-content;
		box-shadow:
			0 -2px 16px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.04);
	}

	.boombox-inline {
		position: relative;
		bottom: auto;
		left: auto;
		transform: none;
		width: 100%;
		border-radius: 0;
		border: none;
		border-bottom: 1px solid #292524;
		justify-content: center;
	}

	/* Speaker zones */
	.speaker-zone {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 10px 0 14px;
		flex-shrink: 0;
	}

	.speaker-right {
		padding: 0 14px 0 10px;
	}

	.speaker-svg {
		position: relative;
		z-index: 1;
		filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
	}

	/* Sound waves */
	.wave {
		position: absolute;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1.5px solid rgba(250, 204, 21, 0.35);
		z-index: 0;
		animation: pulse 1.6s ease-out infinite;
		pointer-events: none;
	}

	.speaker-right .wave {
		/* waves go right */
	}

	.wave-1 {
		animation-delay: 0s;
	}
	.wave-2 {
		animation-delay: 0.4s;
	}
	.wave-3 {
		animation-delay: 0.8s;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 0.5;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	/* Center controls */
	.controls {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 8px;
		border-left: 1px solid #292524;
		border-right: 1px solid #292524;
		height: 100%;
	}

	.play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: 1.5px solid #44403c;
		border-radius: 50%;
		background: transparent;
		color: #facc15;
		cursor: pointer;
		flex-shrink: 0;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.play-btn:hover {
		border-color: #facc15;
		box-shadow: 0 0 8px rgba(250, 204, 21, 0.25);
	}

	.track-name {
		color: #d6d3d1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		letter-spacing: 0.03em;
		font-size: 11px;
	}

	.vol-group {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.vol-icon {
		flex-shrink: 0;
		color: #78716c;
	}

	.vol-slider {
		width: 64px;
		height: 3px;
		-webkit-appearance: none;
		appearance: none;
		background: #292524;
		border-radius: 2px;
		outline: none;
		flex-shrink: 0;
	}

	.vol-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #facc15;
		cursor: pointer;
		border: none;
	}

	.vol-slider::-moz-range-thumb {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #facc15;
		cursor: pointer;
		border: none;
	}
</style>
