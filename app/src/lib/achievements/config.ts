export type AchievementCategory = 'taste' | 'mining_rank' | 'work_ethic' | 'operator';

export interface AchievementDef {
	id: string;
	name: string;
	description: string;
	category: AchievementCategory;
	order: number;
	revocable: boolean;
	icon: string;
}

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string; order: number }[] = [
	{ id: 'taste', label: 'Taste', order: 0 },
	{ id: 'mining_rank', label: 'Mining Rank', order: 1 },
	{ id: 'work_ethic', label: 'Work Ethic', order: 2 },
	{ id: 'operator', label: 'Operator', order: 3 },
];

export const ACHIEVEMENTS: AchievementDef[] = [
	// Taste
	{
		id: 'miner_with_taste',
		name: 'Miner with Taste',
		description: 'Like fewer than 10% of the automata you view (min 10 views)',
		category: 'taste',
		order: 0,
		revocable: true,
		icon: 'taste-1',
	},
	{
		id: 'aspiring_artist',
		name: 'Aspiring Artist',
		description: 'Like fewer than 5% of the automata you view (min 20 views)',
		category: 'taste',
		order: 1,
		revocable: true,
		icon: 'taste-2',
	},
	// Mining Rank
	{
		id: 'starting_miner',
		name: 'Starting Miner',
		description: 'Have a claim in the top 90% of liked claims',
		category: 'mining_rank',
		order: 0,
		revocable: false,
		icon: 'rank-1',
	},
	{
		id: 'amateur_miner',
		name: 'Amateur Miner',
		description: 'Have a claim in the top 50% of liked claims',
		category: 'mining_rank',
		order: 1,
		revocable: false,
		icon: 'rank-2',
	},
	{
		id: 'intermediate_miner',
		name: 'Intermediate Miner',
		description: 'Have a claim in the top 25% of liked claims',
		category: 'mining_rank',
		order: 2,
		revocable: false,
		icon: 'rank-3',
	},
	{
		id: 'skilled_miner',
		name: 'Skilled Miner',
		description: 'Have a claim in the top 10% of liked claims',
		category: 'mining_rank',
		order: 3,
		revocable: false,
		icon: 'rank-4',
	},
	{
		id: 'expert_miner',
		name: 'Expert Miner',
		description: 'Have a claim in the top 5% of liked claims',
		category: 'mining_rank',
		order: 4,
		revocable: false,
		icon: 'rank-5',
	},
	// Work Ethic
	{
		id: 'slow_and_steady',
		name: 'Slow and Steady',
		description: 'Save 30+ generation runs',
		category: 'work_ethic',
		order: 0,
		revocable: false,
		icon: 'work-1',
	},
	{
		id: 'workaholic',
		name: 'Workaholic',
		description: 'Save 100+ generation runs',
		category: 'work_ethic',
		order: 1,
		revocable: false,
		icon: 'work-2',
	},
	{
		id: 'obsessive_employee',
		name: 'Obsessive Employee',
		description: 'Save 1000+ generation runs',
		category: 'work_ethic',
		order: 2,
		revocable: false,
		icon: 'work-3',
	},
	// Operator
	{
		id: 'smooth_operator',
		name: 'Smooth Operator',
		description: 'Claim fewer than 50% of views in the past week (min 10 views)',
		category: 'operator',
		order: 0,
		revocable: true,
		icon: 'operator-1',
	},
	{
		id: 'advanced_operator',
		name: 'Advanced Operator',
		description: 'Claim fewer than 10% of views in the past week (min 20 views)',
		category: 'operator',
		order: 1,
		revocable: true,
		icon: 'operator-2',
	},
	{
		id: 'skilled_operator',
		name: 'Skilled Operator',
		description: 'Claim fewer than 5% of views in the past week (min 50 views)',
		category: 'operator',
		order: 2,
		revocable: true,
		icon: 'operator-3',
	},
];

export const ACHIEVEMENTS_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export const ALL_ACHIEVEMENT_IDS = ACHIEVEMENTS.map((a) => a.id);
