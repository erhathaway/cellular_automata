import type { PartSprite } from '../types';

// Eyes: 16x2, rows 6-7, centered on face
// Frame 0 = open, Frame 1 = blink (closed)
export const EYE_OPTIONS: PartSprite[] = [
	{
		id: 'round',
		name: 'Round',
		offsetX: 0,
		offsetY: 6,
		width: 16,
		height: 2,
		palette: ['transparent', '#1a1a2e', '#ffffff', '#4a90d9'],
		frames: [
			{
				rows: [
					'0000213021300000',
					'0000010001000000'
				]
			},
			{
				rows: [
					'0000000000000000',
					'0000111001100000'
				]
			}
		]
	},
	{
		id: 'narrow',
		name: 'Narrow',
		offsetX: 0,
		offsetY: 6,
		width: 16,
		height: 2,
		palette: ['transparent', '#1a1a2e', '#ffffff', '#4a90d9'],
		frames: [
			{
				rows: [
					'0000013001300000',
					'0000000000000000'
				]
			},
			{
				rows: [
					'0000011001100000',
					'0000000000000000'
				]
			}
		]
	},
	{
		id: 'wide',
		name: 'Wide',
		offsetX: 0,
		offsetY: 6,
		width: 16,
		height: 2,
		palette: ['transparent', '#1a1a2e', '#ffffff', '#4a90d9'],
		frames: [
			{
				rows: [
					'0002231022310000',
					'0000210002100000'
				]
			},
			{
				rows: [
					'0000000000000000',
					'0001110011100000'
				]
			}
		]
	},
	{
		id: 'glasses',
		name: 'Glasses',
		offsetX: 0,
		offsetY: 6,
		width: 16,
		height: 2,
		palette: ['transparent', '#1a1a2e', '#8b7355', '#4a90d9', '#ffffff'],
		frames: [
			{
				rows: [
					'0002432024320000',
					'0002222022200000'
				]
			},
			{
				rows: [
					'0002412024120000',
					'0002222022200000'
				]
			}
		]
	},
	{
		id: 'goggles',
		name: 'Goggles',
		offsetX: 0,
		offsetY: 5,
		width: 16,
		height: 3,
		palette: ['transparent', '#1a1a2e', '#8b7355', '#87ceeb', '#c0c0c0'],
		frames: [
			{
				rows: [
					'0004444444440000',
					'0042332042330000',
					'0044440044440000'
				]
			},
			{
				rows: [
					'0004444444440000',
					'0042112042110000',
					'0044440044440000'
				]
			}
		]
	}
];

// Nose: 16x1, row 8
export const NOSE_OPTIONS: PartSprite[] = [
	{
		id: 'small',
		name: 'Small',
		offsetX: 0,
		offsetY: 8,
		width: 16,
		height: 1,
		palette: ['transparent'],
		frames: [
			{
				rows: ['00000s0S00000000']
			}
		]
	},
	{
		id: 'wide',
		name: 'Wide',
		offsetX: 0,
		offsetY: 8,
		width: 16,
		height: 2,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'00000ssS00000000',
					'0000SssS00000000'
				]
			}
		]
	},
	{
		id: 'button',
		name: 'Button',
		offsetX: 0,
		offsetY: 8,
		width: 16,
		height: 1,
		palette: ['transparent'],
		frames: [
			{
				rows: ['00000hS000000000']
			}
		]
	},
	{
		id: 'pointed',
		name: 'Pointed',
		offsetX: 0,
		offsetY: 7,
		width: 16,
		height: 2,
		palette: ['transparent'],
		frames: [
			{
				rows: [
					'000000s000000000',
					'00000sS000000000'
				]
			}
		]
	}
];

// Mouth: 16x2, rows 9-10
export const MOUTH_OPTIONS: PartSprite[] = [
	{
		id: 'smile',
		name: 'Smile',
		offsetX: 0,
		offsetY: 9,
		width: 16,
		height: 2,
		palette: ['transparent', '#c41e3a', '#e82050'],
		frames: [
			{
				rows: [
					'0000010001000000',
					'0000012210000000'
				]
			}
		]
	},
	{
		id: 'straight',
		name: 'Straight',
		offsetX: 0,
		offsetY: 9,
		width: 16,
		height: 2,
		palette: ['transparent', '#c41e3a', '#e82050'],
		frames: [
			{
				rows: [
					'0000000000000000',
					'0000011110000000'
				]
			}
		]
	},
	{
		id: 'open',
		name: 'Open',
		offsetX: 0,
		offsetY: 9,
		width: 16,
		height: 2,
		palette: ['transparent', '#c41e3a', '#e82050', '#1a1a2e'],
		frames: [
			{
				rows: [
					'0000011110000000',
					'0000013310000000'
				]
			}
		]
	},
	{
		id: 'frown',
		name: 'Frown',
		offsetX: 0,
		offsetY: 9,
		width: 16,
		height: 2,
		palette: ['transparent', '#c41e3a', '#e82050'],
		frames: [
			{
				rows: [
					'0000012210000000',
					'0000010001000000'
				]
			}
		]
	}
];
