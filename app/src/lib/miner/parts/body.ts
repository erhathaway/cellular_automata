import type { PartSprite } from '../types';

// Body shapes: 16x8, rows 11-18
// Palette: 0=transparent, s=skin base, S=skin shadow, h=skin highlight
export const BODY_SHAPES: PartSprite[] = [
	{
		id: 'slim',
		name: 'Slim',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'00000sssss000000',
					'0000ssssssS00000',
					'000sssssssss0000',
					'000Ssssssss00000',
					'0000sssssss00000',
					'0000sssssss00000',
					'0000sssssss00000',
					'0000sssssSS00000'
				]
			}
		]
	},
	{
		id: 'medium',
		name: 'Medium',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0000ssssssS00000',
					'000sssssssss0000',
					'00sssssssssss000',
					'00Ssssssssss0000',
					'000ssssssssS0000',
					'000sssssssss0000',
					'000sssssssss0000',
					'000sssssssSS0000'
				]
			}
		]
	},
	{
		id: 'stocky',
		name: 'Stocky',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'000sssssssss0000',
					'00sssssssssss000',
					'0ssssssssssssS00',
					'0Sssssssssssss00',
					'00ssssssssssS000',
					'00sssssssssss000',
					'00sssssssssss000',
					'00ssssssssSSSS00'
				]
			}
		]
	},
	{
		id: 'broad',
		name: 'Broad',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'00ssssssssssS000',
					'0sssssssssssss00',
					'ssssssssssssssS0',
					'SsssssssssssssS0',
					'0sssssssssssss00',
					'0sssssssssssss00',
					'0ssssssssssssS00',
					'0ssssssssSSSS000'
				]
			}
		]
	}
];

// Upper clothes: 16x5, rows 11-15 (overlays body top)
export const UPPER_CLOTHES: PartSprite[] = [
	{
		id: 'vest',
		name: 'Vest',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 6,
		palette: ['transparent', '#8b5e3c', '#6b4226', '#a07850'],
		frames: [
			{
				rows: [
					'0000012210000000',
					'0000123321000000',
					'0000123321000000',
					'0000123321000000',
					'0000123321000000',
					'0000012210000000'
				]
			}
		]
	},
	{
		id: 'flannel',
		name: 'Flannel',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 6,
		palette: ['transparent', '#c41e3a', '#1a1a2e', '#e82050'],
		frames: [
			{
				rows: [
					'0000013110000000',
					'0001131313100000',
					'0001313131310000',
					'0001131313100000',
					'0001313131310000',
					'0000131313000000'
				]
			}
		]
	},
	{
		id: 'overalls-top',
		name: 'Overalls',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 6,
		palette: ['transparent', '#3b82f6', '#2563eb', '#60a5fa', '#facc15'],
		frames: [
			{
				rows: [
					'0000041140000000',
					'0000112211000000',
					'0000123321000000',
					'0000123321000000',
					'0000123321000000',
					'0000123321000000'
				]
			}
		]
	},
	{
		id: 'jacket',
		name: 'Jacket',
		offsetX: 0,
		offsetY: 11,
		width: 16,
		height: 6,
		palette: ['transparent', '#44403c', '#292524', '#57534e', '#c0c0c0'],
		frames: [
			{
				rows: [
					'0000012210000000',
					'0001123321100000',
					'0001234432110000',
					'0001234432110000',
					'0001234432110000',
					'0000123321000000'
				]
			}
		]
	}
];

// Lower clothes: 16x5, rows 16-20 (overlays body bottom + leg top)
export const LOWER_CLOTHES: PartSprite[] = [
	{
		id: 'pants',
		name: 'Pants',
		offsetX: 0,
		offsetY: 16,
		width: 16,
		height: 5,
		palette: ['transparent', '#3b82f6', '#2563eb', '#60a5fa'],
		frames: [
			{
				rows: [
					'0000123321000000',
					'0000123321000000',
					'0000120021000000',
					'0000120021000000',
					'0000120021000000'
				]
			}
		]
	},
	{
		id: 'shorts',
		name: 'Shorts',
		offsetX: 0,
		offsetY: 16,
		width: 16,
		height: 3,
		palette: ['transparent', '#65a30d', '#4d7c0f', '#84cc16'],
		frames: [
			{
				rows: [
					'0000123321000000',
					'0000123321000000',
					'0000120021000000'
				]
			}
		]
	},
	{
		id: 'overalls-bottom',
		name: 'Overalls',
		offsetX: 0,
		offsetY: 16,
		width: 16,
		height: 5,
		palette: ['transparent', '#3b82f6', '#2563eb', '#60a5fa'],
		frames: [
			{
				rows: [
					'0000123321000000',
					'0000123321000000',
					'0000120021000000',
					'0000120021000000',
					'0000120021000000'
				]
			}
		]
	},
	{
		id: 'skirt',
		name: 'Skirt',
		offsetX: 0,
		offsetY: 16,
		width: 16,
		height: 4,
		palette: ['transparent', '#a855f7', '#7c3aed', '#c084fc'],
		frames: [
			{
				rows: [
					'0000123321000000',
					'0001233332100000',
					'0012333333210000',
					'0012333333210000'
				]
			}
		]
	}
];
