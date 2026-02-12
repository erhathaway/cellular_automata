<script lang="ts">
	import type { MinerConfig } from '$lib/miner/types';
	import {
		renderMiner,
		createAnimState,
		advanceAnim,
		CANVAS_W,
		CANVAS_H
	} from '$lib/miner/renderer';

	let {
		config,
		scale = 8
	}: {
		config: MinerConfig;
		scale?: number;
	} = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let animState = createAnimState();
	let rafId = 0;
	let lastFrameTime = 0;
	const FPS = 4;
	const FRAME_INTERVAL = 1000 / FPS;

	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;
		renderMiner(ctx, config, animState, scale);
	}

	function loop(time: number) {
		rafId = requestAnimationFrame(loop);
		if (time - lastFrameTime < FRAME_INTERVAL) return;
		lastFrameTime = time;
		animState = advanceAnim(animState);
		draw();
	}

	$effect(() => {
		if (!canvas) return;
		// Redraw immediately when config changes
		draw();
	});

	$effect(() => {
		if (!canvas) return;
		lastFrameTime = 0;
		rafId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafId);
	});
</script>

<canvas
	bind:this={canvas}
	width={CANVAS_W * scale}
	height={CANVAS_H * scale}
	class="miner-canvas"
	style="image-rendering: pixelated;"
></canvas>

<style>
	.miner-canvas {
		display: block;
	}
</style>
