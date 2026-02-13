<script lang="ts">
	import { onMount } from 'svelte';
	import { audioStore } from '$lib/stores/audio.svelte';

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

<div class="audio-bar">
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

	<span class="track-name">ToeJam Jammin'</span>

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

<style>
	.audio-bar {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 14px;
		height: 52px;
		padding: 0 24px;
		background: rgba(12, 10, 9, 0.85);
		backdrop-filter: blur(12px);
		border: 3px solid blue;
		border-bottom: none;
		border-radius: 26px 26px 0 0;
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		color: #a8a29e;
		width: fit-content;
	}

	.play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border: 1px solid #44403c;
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
	}

	.vol-icon {
		flex-shrink: 0;
		color: #78716c;
	}

	.vol-slider {
		width: 110px;
		height: 4px;
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
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #facc15;
		cursor: pointer;
		border: none;
	}

	.vol-slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #facc15;
		cursor: pointer;
		border: none;
	}
</style>
