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
	<!-- Corner nails -->
	<div class="nails"><div class="nail"></div><div class="nail"></div></div>
	<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

	<!-- Left speaker -->
	<div class="speaker-zone">
		{#if playing}
			<div class="wave wave-1"></div>
			<div class="wave wave-2"></div>
			<div class="wave wave-3"></div>
		{/if}
		<svg class="speaker-svg" viewBox="0 0 44 44" width="64" height="64">
			<!-- Outer chrome ring -->
			<circle cx="22" cy="22" r="20" fill="none" stroke="#facc15" stroke-width="1.5" opacity="0.6" />
			<!-- Surround -->
			<circle cx="22" cy="22" r="17" fill="#0c0a09" stroke="#3b82f6" stroke-width="0.75" opacity="0.5" />
			<!-- Cone ridges — gold tinted -->
			<circle cx="22" cy="22" r="14" fill="none" stroke="#facc15" stroke-width="0.4" opacity="0.3" />
			<circle cx="22" cy="22" r="10.5" fill="none" stroke="#60a5fa" stroke-width="0.4" opacity="0.35" />
			<circle cx="22" cy="22" r="7" fill="none" stroke="#facc15" stroke-width="0.4" opacity="0.3" />
			<!-- Dust cap -->
			<circle cx="22" cy="22" r="4.5" fill="#1c1917" stroke="#facc15" stroke-width="0.5" opacity="0.5" />
			<circle cx="22" cy="22" r="1.5" fill="#facc15" opacity="0.7" />
		</svg>
	</div>

	<!-- Center controls -->
	<div class="controls">
		<button class="play-btn" onclick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
			{#if playing}
				<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
					<rect x="3" y="2" width="4" height="12" rx="1" />
					<rect x="9" y="2" width="4" height="12" rx="1" />
				</svg>
			{:else}
				<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
					<path d="M4 2.5v11l9-5.5z" />
				</svg>
			{/if}
		</button>

		<span class="track-label">Now Playing</span>
		<span class="track-name">ToeJam Jammin'</span>

		<div class="vol-group">
			<svg class="vol-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
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
		<svg class="speaker-svg" viewBox="0 0 44 44" width="64" height="64">
			<circle cx="22" cy="22" r="20" fill="none" stroke="#facc15" stroke-width="1.5" opacity="0.6" />
			<circle cx="22" cy="22" r="17" fill="#0c0a09" stroke="#3b82f6" stroke-width="0.75" opacity="0.5" />
			<circle cx="22" cy="22" r="14" fill="none" stroke="#facc15" stroke-width="0.4" opacity="0.3" />
			<circle cx="22" cy="22" r="10.5" fill="none" stroke="#60a5fa" stroke-width="0.4" opacity="0.35" />
			<circle cx="22" cy="22" r="7" fill="none" stroke="#facc15" stroke-width="0.4" opacity="0.3" />
			<circle cx="22" cy="22" r="4.5" fill="#1c1917" stroke="#facc15" stroke-width="0.5" opacity="0.5" />
			<circle cx="22" cy="22" r="1.5" fill="#facc15" opacity="0.7" />
		</svg>
	</div>
</div>

<style>
	.boombox {
		position: fixed;
		bottom: 0;
		left: calc(120px + (100% - 120px) / 2);
		transform: translateX(calc(-50% - 155px));
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 0;
		height: 80px;
		background-color: #1c1917;
		background-image:
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 10px,
				rgba(68, 64, 60, 0.1) 10px,
				rgba(68, 64, 60, 0.1) 11px
			);
		border: 3px solid blue;
		border-bottom: none;
		border-radius: 8px 8px 0 0;
		font-family: 'Space Mono', monospace;
		font-size: 12px;
		color: #a8a29e;
		width: fit-content;
		box-shadow:
			0 -2px 20px rgba(0, 0, 0, 0.6),
			0 -1px 12px rgba(59, 130, 246, 0.08),
			0 0 20px rgba(250, 204, 21, 0.06),
			inset 0 1px 0 rgba(250, 204, 21, 0.08);
	}

	.boombox-inline {
		position: relative;
		bottom: auto;
		left: auto;
		transform: none;
		width: 100%;
		height: auto;
		border-radius: 0;
		border: none;
		border-bottom: 1px solid #292524;
		justify-content: space-between;
	}

	/* Corner nails */
	.nails {
		position: absolute;
		top: 8px;
		left: 10px;
		right: 10px;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
		z-index: 5;
	}

	.nails-bottom {
		top: auto;
		bottom: 8px;
	}

	.nail {
		width: 4px;
		height: 4px;
		background: #facc15;
		border-radius: 50%;
		opacity: 0.5;
		box-shadow: 0 0 3px rgba(250, 204, 21, 0.4);
	}

	/* Speaker zones */
	.speaker-zone {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 14px 0 20px;
		flex-shrink: 0;
	}

	.speaker-right {
		padding: 0 20px 0 14px;
	}

	.speaker-svg {
		position: relative;
		z-index: 1;
		filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.15)) drop-shadow(0 0 8px rgba(59, 130, 246, 0.1));
	}

	/* Sound waves */
	.wave {
		position: absolute;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		z-index: 0;
		animation: pulse 1.4s ease-out infinite;
		pointer-events: none;
	}

	.wave-1 {
		border: 2px solid rgba(250, 204, 21, 0.6);
		box-shadow: 0 0 10px rgba(250, 204, 21, 0.3), inset 0 0 6px rgba(250, 204, 21, 0.1);
		animation-delay: 0s;
	}
	.wave-2 {
		border: 2px solid rgba(96, 165, 250, 0.55);
		box-shadow: 0 0 10px rgba(59, 130, 246, 0.3), inset 0 0 6px rgba(59, 130, 246, 0.1);
		animation-delay: 0.35s;
	}
	.wave-3 {
		border: 2px solid rgba(250, 204, 21, 0.5);
		box-shadow: 0 0 10px rgba(250, 204, 21, 0.25), inset 0 0 6px rgba(250, 204, 21, 0.08);
		animation-delay: 0.7s;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 0.7;
		}
		60% {
			opacity: 0.35;
		}
		100% {
			transform: scale(2.4);
			opacity: 0;
		}
	}

	/* Center controls */
	.controls {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 0 16px;
		border-left: 1px solid rgba(250, 204, 21, 0.12);
		border-right: 1px solid rgba(250, 204, 21, 0.12);
		height: 100%;
	}

	.play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border: 1.5px solid rgba(250, 204, 21, 0.4);
		border-radius: 50%;
		background: transparent;
		color: #facc15;
		cursor: pointer;
		flex-shrink: 0;
		transition: border-color 0.15s, box-shadow 0.15s, color 0.15s;
		box-shadow: 0 0 6px rgba(250, 204, 21, 0.1);
	}

	.play-btn:hover {
		border-color: #facc15;
		color: #fef08a;
		box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
	}

	.track-label {
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #60a5fa;
		white-space: nowrap;
		text-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
	}

	.track-name {
		color: #fde68a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		letter-spacing: 0.03em;
		font-size: 13px;
		text-shadow: 0 0 8px rgba(250, 204, 21, 0.2);
	}

	.vol-group {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.vol-icon {
		flex-shrink: 0;
		color: #60a5fa;
		opacity: 0.7;
	}

	.vol-slider {
		width: 80px;
		height: 4px;
		-webkit-appearance: none;
		appearance: none;
		background: rgba(59, 130, 246, 0.2);
		border-radius: 2px;
		outline: none;
		flex-shrink: 0;
	}

	.vol-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #facc15;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 4px rgba(250, 204, 21, 0.4);
	}

	.vol-slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #facc15;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 4px rgba(250, 204, 21, 0.4);
	}

	@media (max-width: 1000px) {
		.boombox {
			left: 50%;
			transform: translateX(calc(-50% + 60px));
		}
	}

	@media (max-width: 700px) {
		.boombox {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 600px) {
		.track-label {
			display: none;
		}
	}

	@media (max-width: 500px) {
		.track-name {
			max-width: 60px;
		}
	}
</style>
