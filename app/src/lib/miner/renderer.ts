import type { CategoryId, MinerConfig, PartSprite } from './types';
import { SKIN_TONES } from './skinTones';
import { getSprite, Z_ORDER } from './parts/index';

export const CANVAS_W = 16;
export const CANVAS_H = 24;

/** Layers that bob up on odd ticks (idle breathing) */
const HEAD_LAYERS: CategoryId[] = [
	'faceShape',
	'ears',
	'eyes',
	'nose',
	'mouth',
	'hair',
	'headgear'
];

/** Resolve a sprite palette char to a CSS color */
function resolveColor(
	ch: string,
	palette: string[],
	skinBase: string,
	skinShadow: string,
	skinHighlight: string
): string | null {
	if (ch === '0') return null; // transparent
	if (ch === 's') return skinBase;
	if (ch === 'S') return skinShadow;
	if (ch === 'h') return skinHighlight;
	const idx = parseInt(ch, 16);
	if (isNaN(idx) || idx < 0 || idx >= palette.length) return null;
	if (idx === 0) return null; // palette[0] = transparent
	return palette[idx];
}

/** Animation state */
export interface AnimState {
	tick: number;
	blinkTimer: number;
	blinkDuration: number;
	nextBlinkAt: number;
	isBlinking: boolean;
}

export function createAnimState(): AnimState {
	return {
		tick: 0,
		blinkTimer: 0,
		blinkDuration: 1,
		nextBlinkAt: Math.floor(10 + Math.random() * 10), // 2.5-5s at 4fps
		isBlinking: false
	};
}

export function advanceAnim(state: AnimState): AnimState {
	const tick = state.tick + 1;
	let { blinkTimer, isBlinking, nextBlinkAt } = state;

	blinkTimer++;
	if (!isBlinking && blinkTimer >= nextBlinkAt) {
		isBlinking = true;
		blinkTimer = 0;
	} else if (isBlinking && blinkTimer >= state.blinkDuration) {
		isBlinking = false;
		blinkTimer = 0;
		nextBlinkAt = Math.floor(10 + Math.random() * 10);
	}

	return { tick, blinkTimer, blinkDuration: state.blinkDuration, nextBlinkAt, isBlinking };
}

/** Get the frame index for a category given animation state */
function getFrame(categoryId: CategoryId, sprite: PartSprite, anim: AnimState): number {
	if (categoryId === 'eyes' && anim.isBlinking && sprite.frames.length > 1) {
		return 1;
	}
	if (categoryId === 'tool' && sprite.frames.length > 1) {
		// Sway every 4 ticks
		return Math.floor(anim.tick / 4) % 2;
	}
	return 0;
}

/** Render a full miner to a canvas context */
export function renderMiner(
	ctx: CanvasRenderingContext2D,
	config: MinerConfig,
	anim: AnimState,
	scale: number = 1
) {
	const w = CANVAS_W * scale;
	const h = CANVAS_H * scale;
	ctx.clearRect(0, 0, w, h);

	const tone = SKIN_TONES[config.skinTone] ?? SKIN_TONES[0];
	const headBob = anim.tick % 8 < 4 ? 0 : -1; // bob up 1px every other 4-tick cycle

	for (const catId of Z_ORDER) {
		const partId = config[catId];
		const sprite = getSprite(catId, partId);
		if (!sprite) continue;

		const frameIdx = getFrame(catId, sprite, anim);
		const frame = sprite.frames[Math.min(frameIdx, sprite.frames.length - 1)];

		const yOffset = HEAD_LAYERS.includes(catId) ? headBob : 0;

		for (let row = 0; row < frame.rows.length; row++) {
			const rowStr = frame.rows[row];
			for (let col = 0; col < rowStr.length; col++) {
				const ch = rowStr[col];
				const color = resolveColor(ch, sprite.palette, tone.base, tone.shadow, tone.highlight);
				if (!color) continue;

				const px = (sprite.offsetX + col) * scale;
				const py = (sprite.offsetY + row + yOffset) * scale;

				if (py < 0 || py >= h) continue;

				ctx.fillStyle = color;
				ctx.fillRect(px, py, scale, scale);
			}
		}
	}
}

/** Render a single part sprite as a thumbnail for the picker */
export function renderPartThumbnail(
	ctx: CanvasRenderingContext2D,
	sprite: PartSprite,
	skinTone: number,
	scale: number = 1
) {
	const w = sprite.width * scale;
	const h = sprite.height * scale;
	ctx.clearRect(0, 0, w, h);

	const tone = SKIN_TONES[skinTone] ?? SKIN_TONES[0];
	const frame = sprite.frames[0];

	for (let row = 0; row < frame.rows.length; row++) {
		const rowStr = frame.rows[row];
		for (let col = 0; col < rowStr.length; col++) {
			const ch = rowStr[col];
			const color = resolveColor(ch, sprite.palette, tone.base, tone.shadow, tone.highlight);
			if (!color) continue;

			ctx.fillStyle = color;
			ctx.fillRect(col * scale, row * scale, scale, scale);
		}
	}
}

/** Render miner to an offscreen canvas and return a data URL (for static display) */
export function renderMinerToDataURL(config: MinerConfig, scale: number = 4): string {
	const canvas = document.createElement('canvas');
	canvas.width = CANVAS_W * scale;
	canvas.height = CANVAS_H * scale;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingEnabled = false;
	renderMiner(ctx, config, createAnimState(), scale);
	return canvas.toDataURL();
}
