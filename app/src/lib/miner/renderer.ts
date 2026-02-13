import type { CategoryId, MinerConfig, PartSprite } from './types';
import { SKIN_TONES } from './skinTones';
import { getSprite, Z_ORDER } from './parts/index';

export const CANVAS_W = 48;
export const CANVAS_H = 72;

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

/** Upper body layers (torso) */
const UPPER_BODY_LAYERS: CategoryId[] = [
	'bodyShape',
	'upperClothes'
];

/** Arm layers */
const ARM_LAYERS: CategoryId[] = [
	'gloves'
];

/** Leg layers */
const LEG_LAYERS: CategoryId[] = [
	'lowerClothes',
	'shoes'
];

/** Groove pattern — 8-beat funk cycle (offsets in pixels at sprite scale)
 *  Each beat: [headX, headY, torsoX, torsoY, legsX, legsY, armsX, armsY]
 */
const GROOVE_BEATS: [number, number, number, number, number, number, number, number][] = [
	[ 0, -2,  0,  0,  0,  0,   2, -3],  // 1 — head up, arms up right
	[ 1,  1,  1,  2,  0, -2,  -1,  1],  // 2 — lean right, dip, arms down left
	[ 0, -3,  0,  0,  0,  0,  -2, -3],  // 3 — head bounce, arms up left
	[-1,  1, -1,  2,  0, -2,   1,  1],  // 4 — lean left, dip, arms down right
	[ 0, -2,  0,  0,  0,  0,   2, -2],  // 5 — head up, arms up right
	[ 2,  2,  1,  3,  0, -3,  -2,  2],  // 6 — deep dip, arms swing down left
	[ 0, -3,  0,  0,  0,  0,  -3, -4],  // 7 — head bounce, arms way up left
	[-2,  2, -1,  3,  0, -3,   2,  2],  // 8 — deep dip, arms swing down right
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
	grooving: boolean;
}

export function createAnimState(grooving = false): AnimState {
	return {
		tick: 0,
		blinkTimer: 0,
		blinkDuration: 1,
		nextBlinkAt: Math.floor(10 + Math.random() * 10), // 2.5-5s at 4fps
		isBlinking: false,
		grooving
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

	return { tick, blinkTimer, blinkDuration: state.blinkDuration, nextBlinkAt, isBlinking, grooving: state.grooving };
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

	// Groove or idle head bob
	const beat = anim.grooving ? GROOVE_BEATS[anim.tick % GROOVE_BEATS.length] : null;
	const idleHeadBob = anim.tick % 8 < 4 ? 0 : -3;

	for (const catId of Z_ORDER) {
		const partId = config[catId];
		const sprite = getSprite(catId, partId);
		if (!sprite) continue;

		const frameIdx = getFrame(catId, sprite, anim);
		const frame = sprite.frames[Math.min(frameIdx, sprite.frames.length - 1)];

		let xOffset = 0;
		let yOffset = 0;

		if (beat) {
			// Grooving — funk cycle
			if (HEAD_LAYERS.includes(catId)) {
				xOffset = beat[0];
				yOffset = beat[1];
			} else if (UPPER_BODY_LAYERS.includes(catId)) {
				xOffset = beat[2];
				yOffset = beat[3];
			} else if (LEG_LAYERS.includes(catId)) {
				xOffset = beat[4];
				yOffset = beat[5];
			} else if (ARM_LAYERS.includes(catId)) {
				xOffset = beat[6];
				yOffset = beat[7];
			} else if (catId === 'tool') {
				xOffset = beat[6];
				yOffset = beat[7];
			}
		} else {
			// Idle — subtle head bob
			if (HEAD_LAYERS.includes(catId)) {
				yOffset = idleHeadBob;
			}
		}

		for (let row = 0; row < frame.rows.length; row++) {
			const rowStr = frame.rows[row];
			for (let col = 0; col < rowStr.length; col++) {
				const ch = rowStr[col];
				const color = resolveColor(ch, sprite.palette, tone.base, tone.shadow, tone.highlight);
				if (!color) continue;

				const px = (sprite.offsetX + col + xOffset) * scale;
				const py = (sprite.offsetY + row + yOffset) * scale;

				if (py < 0 || py >= h || px < 0 || px >= w) continue;

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
export function renderMinerToDataURL(config: MinerConfig, scale: number = 2): string {
	const canvas = document.createElement('canvas');
	canvas.width = CANVAS_W * scale;
	canvas.height = CANVAS_H * scale;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingEnabled = false;
	renderMiner(ctx, config, createAnimState(), scale);
	return canvas.toDataURL();
}
