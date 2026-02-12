import type { PartSprite } from '../types';

// Face shapes: 16x8 region, rows 3-10, skin-colored oval/outline
// Palette: 0=transparent, s=skin base, S=skin shadow, h=skin highlight
export const FACE_SHAPES: PartSprite[] = [
	{
		id: 'round',
		name: 'Round',
		offsetX: 0,
		offsetY: 3,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'000000SssssS0000',
					'0000ShhhhhhhsS00',
					'000Shssssssshs00',
					'000shssssssshs00',
					'000shssssssshs00',
					'000Shssssssshs00',
					'0000SssssssssS00',
					'00000SSssssSS000'
				]
			}
		]
	},
	{
		id: 'square',
		name: 'Square',
		offsetX: 0,
		offsetY: 3,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0000SSsssssSS000',
					'000Shhhhhhhhhs00',
					'000shssssssshs00',
					'000shssssssshs00',
					'000shssssssshs00',
					'000shssssssshs00',
					'000SsssssssssSS0',
					'0000SSssssSS0000'
				]
			}
		]
	},
	{
		id: 'narrow',
		name: 'Narrow',
		offsetX: 0,
		offsetY: 3,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'00000SsssssS0000',
					'0000Shhhhhhhs000',
					'0000shssssshs000',
					'0000shssssshs000',
					'0000shssssshs000',
					'0000shssssshs000',
					'0000SsssssssS000',
					'00000SSsssSS0000'
				]
			}
		]
	},
	{
		id: 'wide',
		name: 'Wide',
		offsetX: 0,
		offsetY: 3,
		width: 16,
		height: 8,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'000SSsssssssSS00',
					'00ShhhhhhhhhhhS0',
					'00shssssssssshS0',
					'00shssssssssshS0',
					'00shssssssssshS0',
					'00ShssssssssshS0',
					'000SsssssssssS00',
					'0000SSssssSS0000'
				]
			}
		]
	}
];

// Ears: 16x3, rows 5-7, on sides of face
export const EAR_OPTIONS: PartSprite[] = [
	{
		id: 'small',
		name: 'Small',
		offsetX: 0,
		offsetY: 5,
		width: 16,
		height: 3,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'00Ss00000000sS00',
					'00sS00000000Ss00',
					'0000000000000000'
				]
			}
		]
	},
	{
		id: 'pointy',
		name: 'Pointy',
		offsetX: 0,
		offsetY: 4,
		width: 16,
		height: 4,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0Sh000000000hS00',
					'00Ss00000000sS00',
					'00sS00000000Ss00',
					'0000000000000000'
				]
			}
		]
	},
	{
		id: 'large',
		name: 'Large',
		offsetX: 0,
		offsetY: 5,
		width: 16,
		height: 3,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0Ssh0000000hsS00',
					'0sSs0000000sSs00',
					'00SS00000000SS00'
				]
			}
		]
	},
	{
		id: 'none',
		name: 'None',
		offsetX: 0,
		offsetY: 5,
		width: 16,
		height: 3,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0000000000000000',
					'0000000000000000',
					'0000000000000000'
				]
			}
		]
	}
];

// Hair styles: 16x6, rows 0-5 (top of head, overlaps face top)
export const HAIR_STYLES: PartSprite[] = [
	{
		id: 'short',
		name: 'Short',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 6,
		palette: ['transparent', '#4a3728', '#3a2718', '#5c4838'],
		frames: [
			{
				rows: [
					'0000011111100000',
					'0000122222210000',
					'0001233333321000',
					'0001233333321000',
					'0001200000021000',
					'0000000000000000'
				]
			}
		]
	},
	{
		id: 'long',
		name: 'Long',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 12,
		palette: ['transparent', '#4a3728', '#3a2718', '#5c4838'],
		frames: [
			{
				rows: [
					'0000011111100000',
					'0001222222221000',
					'0012333333332100',
					'0012333333332100',
					'0012300000032100',
					'0012000000002100',
					'0012000000002100',
					'0012000000002100',
					'0012000000002100',
					'0001200000021000',
					'0000120000210000',
					'0000012002100000'
				]
			}
		]
	},
	{
		id: 'mohawk',
		name: 'Mohawk',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 5,
		palette: ['transparent', '#c41e3a', '#e82050', '#8b1528'],
		frames: [
			{
				rows: [
					'0000000320000000',
					'0000001321000000',
					'0000012332100000',
					'0000123333210000',
					'0000123333210000'
				]
			}
		]
	},
	{
		id: 'bald',
		name: 'Bald',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 4,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0000000000000000',
					'00000hhhhh000000',
					'0000hhhhhhh00000',
					'0000000000000000'
				]
			}
		]
	},
	{
		id: 'ponytail',
		name: 'Ponytail',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 14,
		palette: ['transparent', '#4a3728', '#3a2718', '#5c4838'],
		frames: [
			{
				rows: [
					'0000011111100000',
					'0001222222221000',
					'0012333333332100',
					'0012333333332100',
					'0001200000032100',
					'0000000000023100',
					'0000000000012100',
					'0000000000012100',
					'0000000000012100',
					'0000000000012100',
					'0000000000012100',
					'0000000000001200',
					'0000000000001200',
					'0000000000001100'
				]
			}
		]
	}
];

// Headgear: 16x5, rows 0-4 (above head, covers hair top)
export const HEADGEAR_OPTIONS: PartSprite[] = [
	{
		id: 'none',
		name: 'None',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 4,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'0000000000000000',
					'0000000000000000',
					'0000000000000000',
					'0000000000000000'
				]
			}
		]
	},
	{
		id: 'mining-hat',
		name: 'Mining Hat',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 5,
		palette: ['transparent', '#facc15', '#d4a910', '#fff176', '#ffffff', '#87ceeb'],
		frames: [
			{
				rows: [
					'0000004400000000',
					'0000012321000000',
					'0001123332110000',
					'0012233333221000',
					'0111111111111100'
				]
			}
		]
	},
	{
		id: 'hard-hat',
		name: 'Hard Hat',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 5,
		palette: ['transparent', '#f97316', '#e05e00', '#ffac5e', '#ffffff'],
		frames: [
			{
				rows: [
					'0000000000000000',
					'0000033330000000',
					'0001133331100000',
					'0013333333310000',
					'0111111111111100'
				]
			}
		]
	},
	{
		id: 'crown',
		name: 'Crown',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 5,
		palette: ['transparent', '#facc15', '#d4a910', '#fff176', '#e82050', '#4ade80'],
		frames: [
			{
				rows: [
					'0001030301000000',
					'0001131311000000',
					'0001133311000000',
					'0004155514000000',
					'0001111111000000'
				]
			}
		]
	},
	{
		id: 'bandana',
		name: 'Bandana',
		offsetX: 0,
		offsetY: 0,
		width: 16,
		height: 5,
		palette: ['transparent', '#e82050', '#c41e3a', '#ff6b8a'],
		frames: [
			{
				rows: [
					'0000000000000000',
					'0000000000000000',
					'0001112211100000',
					'0012233322100000',
					'0000000002310000'
				]
			}
		]
	}
];
