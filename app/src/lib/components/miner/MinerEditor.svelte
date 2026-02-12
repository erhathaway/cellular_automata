<script lang="ts">
	import type { CategoryId, MinerConfig, PartSprite } from '$lib/miner/types';
	import { SKIN_TONES } from '$lib/miner/skinTones';
	import { CATEGORIES, DEFAULT_CONFIG, randomConfig } from '$lib/miner/parts/index';
	import { renderPartThumbnail } from '$lib/miner/renderer';
	import MinerPreview from './MinerPreview.svelte';

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

	const THUMB_SCALE = 4;

	function thumbAction(canvas: HTMLCanvasElement, params: { sprite: PartSprite; skinTone: number }) {
		function paint(p: { sprite: PartSprite; skinTone: number }) {
			canvas.width = p.sprite.width * THUMB_SCALE;
			canvas.height = p.sprite.height * THUMB_SCALE;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			ctx.imageSmoothingEnabled = false;
			renderPartThumbnail(ctx, p.sprite, p.skinTone, THUMB_SCALE);
		}
		paint(params);
		return {
			update(newParams: { sprite: PartSprite; skinTone: number }) {
				paint(newParams);
			}
		};
	}
</script>

<div class="editor">
	<!-- Left: preview column -->
	<div class="left-col">
		<div class="preview-frame">
			<MinerPreview {config} scale={8} />
		</div>

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

		<button class="btn-random" onclick={handleRandom}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
				<circle cx="8" cy="16" r="1" fill="currentColor" />
				<circle cx="5" cy="13" r="1" fill="currentColor" />
				<circle cx="11" cy="19" r="1" fill="currentColor" />
				<path d="m17.7 7.7 2.6-2.6a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0L14.3 4.3" />
				<path d="m14 8 4-4" />
			</svg>
			Random
		</button>

		<div class="actions">
			<button class="btn-outline" onclick={oncancel}>Cancel</button>
			<button class="btn-save" onclick={() => onsave(config)}>Save</button>
		</div>
	</div>

	<!-- Right: all categories, vertically scrollable -->
	<div class="right-col">
		{#each CATEGORIES as cat}
			<div class="cat-row">
				<span class="cat-label">{cat.label}</span>
				<div class="cat-options">
					{#each cat.options as option (option.id)}
						<button
							class="option-btn"
							class:selected={config[cat.id] === option.id}
							onclick={() => handleSelect(cat.id, option.id)}
						>
							<canvas
								class="option-thumb"
								use:thumbAction={{ sprite: option, skinTone: config.skinTone }}
								style="image-rendering: pixelated;"
							></canvas>
							<span class="option-name">{option.name}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.editor {
		display: flex;
		gap: 28px;
	}

	/* ---- Left column ---- */
	.left-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		flex-shrink: 0;
	}

	.preview-frame {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0c0a09;
		border: 2px solid #292524;
		border-radius: 12px;
		padding: 12px;
	}

	.skin-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.skin-label {
		font-family: 'Space Mono', monospace;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #78716c;
	}

	.skin-tones {
		display: flex;
		gap: 8px;
	}

	.skin-swatch {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 3px solid transparent;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.skin-swatch:hover {
		border-color: #78716c;
	}

	.skin-swatch.active {
		border-color: #facc15;
		box-shadow: 0 0 10px rgba(250, 204, 21, 0.4);
	}

	.btn-random {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		font-family: 'Space Mono', monospace;
		font-size: 13px;
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

	.actions {
		display: flex;
		gap: 10px;
		width: 100%;
	}

	.btn-outline {
		flex: 1;
		padding: 12px 14px;
		font-family: 'Space Mono', monospace;
		font-size: 13px;
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
		padding: 12px 14px;
		font-family: 'Space Mono', monospace;
		font-size: 13px;
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

	/* ---- Right column ---- */
	.right-col {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		max-height: 560px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding-right: 6px;
		scrollbar-width: thin;
		scrollbar-color: #44403c transparent;
	}

	.right-col::-webkit-scrollbar { width: 6px; }
	.right-col::-webkit-scrollbar-track { background: transparent; }
	.right-col::-webkit-scrollbar-thumb { background: #44403c; border-radius: 3px; }

	.cat-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.cat-label {
		font-family: 'Space Mono', monospace;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #a8a29e;
	}

	.cat-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.option-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px 10px;
		background: none;
		border: 1px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}

	.option-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #292524;
	}

	.option-btn.selected {
		background: rgba(250, 204, 21, 0.1);
		border-color: #facc15;
		box-shadow: 0 0 10px rgba(250, 204, 21, 0.15);
	}

	.option-thumb {
		display: block;
		max-width: 64px;
		max-height: 64px;
	}

	.option-name {
		font-family: 'Space Mono', monospace;
		font-size: 12px;
		letter-spacing: 0.04em;
		color: #78716c;
		line-height: 1;
	}

	.option-btn.selected .option-name {
		color: #facc15;
	}
</style>
