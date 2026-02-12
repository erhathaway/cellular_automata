import type { CategoryDef, CategoryId, MinerConfig, PartSprite } from '../types';
import { FACE_SHAPES, EAR_OPTIONS, HAIR_STYLES, HEADGEAR_OPTIONS } from './head';
import { EYE_OPTIONS, NOSE_OPTIONS, MOUTH_OPTIONS } from './face';
import { BODY_SHAPES, UPPER_CLOTHES, LOWER_CLOTHES } from './body';
import { GLOVE_OPTIONS, SHOE_OPTIONS, TOOL_OPTIONS } from './gear';

export const CATEGORIES: CategoryDef[] = [
	{ id: 'faceShape', label: 'Face', options: FACE_SHAPES },
	{ id: 'ears', label: 'Ears', options: EAR_OPTIONS },
	{ id: 'eyes', label: 'Eyes', options: EYE_OPTIONS },
	{ id: 'nose', label: 'Nose', options: NOSE_OPTIONS },
	{ id: 'mouth', label: 'Mouth', options: MOUTH_OPTIONS },
	{ id: 'hair', label: 'Hair', options: HAIR_STYLES },
	{ id: 'headgear', label: 'Head', options: HEADGEAR_OPTIONS },
	{ id: 'bodyShape', label: 'Body', options: BODY_SHAPES },
	{ id: 'upperClothes', label: 'Top', options: UPPER_CLOTHES },
	{ id: 'lowerClothes', label: 'Bottom', options: LOWER_CLOTHES },
	{ id: 'gloves', label: 'Gloves', options: GLOVE_OPTIONS },
	{ id: 'shoes', label: 'Shoes', options: SHOE_OPTIONS },
	{ id: 'tool', label: 'Tool', options: TOOL_OPTIONS }
];

const categoryMap = new Map<CategoryId, CategoryDef>(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): CategoryDef {
	return categoryMap.get(id)!;
}

export function getSprite(categoryId: CategoryId, partId: string): PartSprite | undefined {
	const cat = categoryMap.get(categoryId);
	if (!cat) return undefined;
	return cat.options.find((o) => o.id === partId);
}

export const DEFAULT_CONFIG: MinerConfig = {
	skinTone: 1,
	faceShape: 'round',
	ears: 'small',
	eyes: 'round',
	nose: 'small',
	mouth: 'smile',
	hair: 'short',
	headgear: 'mining-hat',
	bodyShape: 'medium',
	upperClothes: 'vest',
	lowerClothes: 'pants',
	gloves: 'leather',
	shoes: 'boots',
	tool: 'pickaxe'
};

export function randomConfig(): MinerConfig {
	const pick = (opts: PartSprite[]) => opts[Math.floor(Math.random() * opts.length)].id;
	return {
		skinTone: Math.floor(Math.random() * 6),
		faceShape: pick(FACE_SHAPES),
		ears: pick(EAR_OPTIONS),
		eyes: pick(EYE_OPTIONS),
		nose: pick(NOSE_OPTIONS),
		mouth: pick(MOUTH_OPTIONS),
		hair: pick(HAIR_STYLES),
		headgear: pick(HEADGEAR_OPTIONS),
		bodyShape: pick(BODY_SHAPES),
		upperClothes: pick(UPPER_CLOTHES),
		lowerClothes: pick(LOWER_CLOTHES),
		gloves: pick(GLOVE_OPTIONS),
		shoes: pick(SHOE_OPTIONS),
		tool: pick(TOOL_OPTIONS)
	};
}

/** Z-order for compositing (back to front) */
export const Z_ORDER: CategoryId[] = [
	'bodyShape',
	'lowerClothes',
	'upperClothes',
	'shoes',
	'gloves',
	'faceShape',
	'ears',
	'nose',
	'mouth',
	'eyes',
	'hair',
	'headgear',
	'tool'
];
