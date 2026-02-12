import { ACHIEVEMENTS_BY_ID } from '$lib/achievements/config';
import {
	getUserViewCount,
	getUserLikeCount,
	getUserRunCount,
	getUserWeeklyViews,
	getUserWeeklyClaims,
	getAllClaimLikeCounts,
	getUserMaxClaimLikeCount,
	upsertAchievement,
	revokeAchievement,
	getUserAchievements,
} from '$lib/server/db/queries/achievements';

type CheckResult = {
	achievementId: string;
	earned: boolean;
	newlyEarned: boolean;
	revoked: boolean;
};

const checkers: Record<string, (userId: string) => Promise<boolean>> = {
	// Taste
	async miner_with_taste(userId) {
		const views = await getUserViewCount(userId);
		if (views < 10) return false;
		const likes = await getUserLikeCount(userId);
		return likes / views < 0.1;
	},
	async aspiring_artist(userId) {
		const views = await getUserViewCount(userId);
		if (views < 20) return false;
		const likes = await getUserLikeCount(userId);
		return likes / views < 0.05;
	},

	// Mining Rank
	async starting_miner(userId) {
		return checkMiningRank(userId, 0.1); // top 90% = >= P10
	},
	async amateur_miner(userId) {
		return checkMiningRank(userId, 0.5);
	},
	async intermediate_miner(userId) {
		return checkMiningRank(userId, 0.75);
	},
	async skilled_miner(userId) {
		return checkMiningRank(userId, 0.9);
	},
	async expert_miner(userId) {
		return checkMiningRank(userId, 0.95);
	},

	// Work Ethic
	async slow_and_steady(userId) {
		const count = await getUserRunCount(userId);
		return count >= 30;
	},
	async workaholic(userId) {
		const count = await getUserRunCount(userId);
		return count >= 100;
	},
	async obsessive_employee(userId) {
		const count = await getUserRunCount(userId);
		return count >= 1000;
	},

	// Operator
	async smooth_operator(userId) {
		const views = await getUserWeeklyViews(userId);
		if (views < 10) return false;
		const claims = await getUserWeeklyClaims(userId);
		return claims / views < 0.5;
	},
	async advanced_operator(userId) {
		const views = await getUserWeeklyViews(userId);
		if (views < 20) return false;
		const claims = await getUserWeeklyClaims(userId);
		return claims / views < 0.1;
	},
	async skilled_operator(userId) {
		const views = await getUserWeeklyViews(userId);
		if (views < 50) return false;
		const claims = await getUserWeeklyClaims(userId);
		return claims / views < 0.05;
	},
};

async function checkMiningRank(userId: string, percentile: number): Promise<boolean> {
	const allCounts = await getAllClaimLikeCounts();
	if (allCounts.length === 0) return false;
	const thresholdIndex = Math.floor(allCounts.length * percentile);
	const threshold = allCounts[Math.min(thresholdIndex, allCounts.length - 1)];
	const userMax = await getUserMaxClaimLikeCount(userId);
	return userMax >= threshold;
}

export async function checkAchievement(userId: string, achievementId: string): Promise<CheckResult> {
	const def = ACHIEVEMENTS_BY_ID.get(achievementId);
	if (!def) {
		return { achievementId, earned: false, newlyEarned: false, revoked: false };
	}

	const checker = checkers[achievementId];
	if (!checker) {
		return { achievementId, earned: false, newlyEarned: false, revoked: false };
	}

	const earned = await checker(userId);
	const existingAchievements = await getUserAchievements(userId);
	const existing = existingAchievements.find((a) => a.achievementId === achievementId);

	if (earned) {
		if (existing) {
			return { achievementId, earned: true, newlyEarned: false, revoked: false };
		}
		await upsertAchievement(userId, achievementId);
		return { achievementId, earned: true, newlyEarned: true, revoked: false };
	} else {
		// Not earned — revoke if revocable and previously earned
		if (existing && def.revocable) {
			await revokeAchievement(userId, achievementId);
			return { achievementId, earned: false, newlyEarned: false, revoked: true };
		}
		return { achievementId, earned: !!existing, newlyEarned: false, revoked: false };
	}
}
