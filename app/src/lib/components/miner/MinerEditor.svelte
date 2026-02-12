<script lang="ts">
	import type { CategoryId, MinerConfig } from '$lib/miner/types';
	import { SKIN_TONES } from '$lib/miner/skinTones';
	import { DEFAULT_CONFIG, randomConfig } from '$lib/miner/parts/index';
	import MinerPreview from './MinerPreview.svelte';
	import MinerPartPicker from './MinerPartPicker.svelte';

	let {
		initialConfig,
		onsave,
		oncancel
	}: {
		initialConfig?: MinerConfig | null;
		onsave: (config: MinerConfig) => void;
		oncancel: () => void;
	} = $props();

	let config: MinerConfig = $state(initialConfig ? { ...initialConfig } : { ...DEFAULT_CONFIG });

	function handleSelect(categoryId: CategoryId, partId: string) {
		config = { ...config, [categoryId]: partId };
	}

	function handleRandom() {
		config = randomConfig();
	}

	function handleSkinTone(index: number) {
		config = { ...config, skinTone: index };
	}
</script>

<div class="editor">
	<!-- Preview + controls -->
	<div class="preview-area">
		<div class="preview-frame">
			<MinerPreview {config} scale={8} />
		</div>
		<button class="btn-random" onclick={handleRandom}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
				<circle cx="8" cy="16" r="1" fill="currentColor" />
				<circle cx="5" cy="13" r="1" fill="currentColor" />
				<circle cx="11" cy="19" r="1" fill="currentColor" />
				<path d="m17.7 7.7 2.6-2.6a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0L14.3 4.3" />
				<path d="m14 8 4-4" />
			</svg>
			Random
		</button>
	</div>

	<!-- Skin tone selector -->
	<div class="skin-row">
		<span class="skin-label">Skin</span>
		<div class="skin-tones">
			{#each SKIN_TONES as tone, i}
				<button
					class="skin-swatch"
					class:active={config.skinTone === i}
					style="background-color: {tone.base};"
					onclick={() => handleSkinTone(i)}
					aria-label={tone.name}
					title={tone.name}
				></button>
			{/each}
		</div>
	</div>

	<div class="divider"></div>

	<!-- Part picker -->
	<MinerPartPicker {config} onselect={handleSelect} />

	<!-- Actions -->
	<div class="actions">
		<button class="btn-outline" onclick={oncancel}>Cancel</button>
		<button class="btn-save" onclick={() => onsave(config)}>Save</button>
	</div>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.preview-area {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
		padding: 8px 0 12px;
	}

	.preview-frame {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0c0a09;
		border: 2px solid #292524;
		border-radius: 10px;
		padding: 8px;
	}

	.btn-random {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a8a29e;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid #44403c;
		border-radius: 6px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s, border-color 0.15s;
	}

	.btn-random:hover {
		color: #facc15;
		border-color: rgba(250, 204, 21, 0.3);
		background: rgba(250, 204, 21, 0.05);
	}

	/* Skin tone */
	.skin-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 4px 0 8px;
	}

	.skin-label {
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #57534e;
	}

	.skin-tones {
		display: flex;
		gap: 6px;
	}

	.skin-swatch {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.skin-swatch:hover {
		border-color: #78716c;
	}

	.skin-swatch.active {
		border-color: #facc15;
		box-shadow: 0 0 8px rgba(250, 204, 21, 0.4);
	}

	/* Divider */
	.divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 12px 0;
	}

	/* Actions */
	.actions {
		display: flex;
		gap: 10px;
		margin-top: 20px;
	}

	.btn-outline {
		flex: 1;
		padding: 10px 16px;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a8a29e;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid #44403c;
		border-radius: 6px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}

	.btn-outline:hover {
		color: #f5f5f4;
		background: rgba(255, 255, 255, 0.1);
	}

	.btn-save {
		flex: 1;
		padding: 10px 16px;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1c1917;
		background: #facc15;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s, box-shadow 0.15s;
	}

	.btn-save:hover {
		background: #fde047;
		box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
	}
</style>
