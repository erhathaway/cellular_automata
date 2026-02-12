/** Sprite data for a single part option */
export interface PartSprite {
	id: string;
	name: string;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
	/** Index 0 = transparent, 1-f = colors. 's'/'S'/'h' resolved at render time. */
	palette: string[];
	/** Frame 0 = default, 1+ = animation frames */
	frames: { rows: string[] }[];
}

/** All category IDs */
export type CategoryId =
	| 'faceShape'
	| 'ears'
	| 'eyes'
	| 'nose'
	| 'mouth'
	| 'hair'
	| 'headgear'
	| 'bodyShape'
	| 'upperClothes'
	| 'lowerClothes'
	| 'gloves'
	| 'shoes'
	| 'tool';

/** Definition of a category */
export interface CategoryDef {
	id: CategoryId;
	label: string;
	options: PartSprite[];
}

/** User's selected miner configuration */
export interface MinerConfig {
	skinTone: number;
	faceShape: string;
	ears: string;
	eyes: string;
	nose: string;
	mouth: string;
	hair: string;
	headgear: string;
	bodyShape: string;
	upperClothes: string;
	lowerClothes: string;
	gloves: string;
	shoes: string;
	tool: string;
}

/** A single skin tone palette: base, shadow, highlight */
export interface SkinTonePalette {
	id: string;
	name: string;
	base: string;
	shadow: string;
	highlight: string;
}
