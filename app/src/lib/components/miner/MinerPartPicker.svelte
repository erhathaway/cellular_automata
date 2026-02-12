<script lang="ts">
	import type { CategoryId, MinerConfig, PartSprite } from '$lib/miner/types';
	import { CATEGORIES } from '$lib/miner/parts/index';
	import { renderPartThumbnail } from '$lib/miner/renderer';

	let {
		config,
		onselect
	}: {
		config: MinerConfig;
		onselect: (categoryId: CategoryId, partId: string) => void;
	} = $props();

	let activeTab: CategoryId = $state('faceShape');

	let activeCategory = $derived(CATEGORIES.find((c) => c.id === activeTab)!);

	const THUMB_SCALE = 3;

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

<div class="part-picker">
	<!-- Category tabs -->
	<div class="tabs-scroll">
		<div class="tabs">
			{#each CATEGORIES as cat}
				<button
					class="tab"
					class:active={activeTab === cat.id}
					onclick={() => { activeTab = cat.id; }}
				>
					{cat.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Options grid -->
	<div class="options-grid">
		{#each activeCategory.options as option (option.id)}
			<button
				class="option-btn"
				class:selected={config[activeTab] === option.id}
				onclick={() => onselect(activeTab, option.id)}
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

<style>
	.part-picker {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tabs-scroll {
		overflow-x: auto;
		margin: 0 -24px;
		padding: 0 24px;
		scrollbar-width: none;
	}

	.tabs-scroll::-webkit-scrollbar {
		display: none;
	}

	.tabs {
		display: flex;
		gap: 2px;
		white-space: nowrap;
	}

	.tab {
		padding: 6px 12px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #57534e;
		background: none;
		border: 1px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s, border-color 0.15s;
		flex-shrink: 0;
	}

	.tab:hover {
		color: #a8a29e;
		background: rgba(255, 255, 255, 0.03);
	}

	.tab.active {
		color: #facc15;
		background: rgba(250, 204, 21, 0.08);
		border-color: rgba(250, 204, 21, 0.3);
	}

	.options-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
		gap: 8px;
	}

	.option-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 10px 6px;
		background: none;
		border: 1px solid transparent;
		border-radius: 6px;
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
		max-width: 48px;
		max-height: 48px;
	}

	.option-name {
		font-family: 'Space Mono', monospace;
		font-size: 8px;
		letter-spacing: 0.04em;
		color: #57534e;
		line-height: 1;
	}

	.option-btn.selected .option-name {
		color: #facc15;
	}
</style>
