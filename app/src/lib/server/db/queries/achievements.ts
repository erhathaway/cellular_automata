import { db } from '../index';
import { userAchievement, userGenerationView, like, generationRun, cellPopulation } from '../schema';
import { eq, and, sql, gte } from 'drizzle-orm';

export async function getUserAchievements(userId: string) {
	return db
		.select()
		.from(userAchievement)
		.where(eq(userAchievement.userId, userId))
		.all();
}

export async function upsertAchievement(userId: string, achievementId: string): Promise<boolean> {
	const existing = await db
		.select({ id: userAchievement.id })
		.from(userAchievement)
		.where(and(eq(userAchievement.userId, userId), eq(userAchievement.achievementId, achievementId)))
		.get();

	if (existing) return false;

	await db.insert(userAchievement).values({ userId, achievementId });
	return true;
}

export async function revokeAchievement(userId: string, achievementId: string): Promise<boolean> {
	const existing = await db
		.select({ id: userAchievement.id })
		.from(userAchievement)
		.where(and(eq(userAchievement.userId, userId), eq(userAchievement.achievementId, achievementId)))
		.get();

	if (!existing) return false;

	await db
		.delete(userAchievement)
		.where(and(eq(userAchievement.userId, userId), eq(userAchievement.achievementId, achievementId)));
	return true;
}

export async function markAchievementsSeen(userId: string, ids: string[]) {
	if (ids.length === 0) return;
	for (const achievementId of ids) {
		await db
			.update(userAchievement)
			.set({ seen: true })
			.where(and(eq(userAchievement.userId, userId), eq(userAchievement.achievementId, achievementId)));
	}
}

export async function upsertGenerationView(
	userId: string,
	latticeType: string | null,
	ruleDefinition: string,
	dimension: number,
	neighborhoodRadius: number
) {
	// Use INSERT ... ON CONFLICT to upsert (update viewedAt on conflict)
	await db
		.insert(userGenerationView)
		.values({ userId, latticeType, ruleDefinition, dimension, neighborhoodRadius })
		.onConflictDoUpdate({
			target: [
				userGenerationView.userId,
				userGenerationView.latticeType,
				userGenerationView.ruleDefinition,
				userGenerationView.dimension,
				userGenerationView.neighborhoodRadius,
			],
			set: { viewedAt: new Date() },
		});
}

export async function getUserViewCount(userId: string): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(userGenerationView)
		.where(eq(userGenerationView.userId, userId))
		.get();
	return result?.count ?? 0;
}

export async function getUserLikeCount(userId: string): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(like)
		.where(eq(like.userId, userId))
		.get();
	return result?.count ?? 0;
}

export async function getUserRunCount(userId: string): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(generationRun)
		.where(eq(generationRun.userId, userId))
		.get();
	return result?.count ?? 0;
}

export async function getUserWeeklyViews(userId: string): Promise<number> {
	const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(userGenerationView)
		.where(and(eq(userGenerationView.userId, userId), gte(userGenerationView.viewedAt, weekAgo)))
		.get();
	return result?.count ?? 0;
}

export async function getUserWeeklyClaims(userId: string): Promise<number> {
	const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(generationRun)
		.where(and(eq(generationRun.userId, userId), gte(generationRun.createdAt, weekAgo)))
		.get();
	return result?.count ?? 0;
}

export async function getAllClaimLikeCounts(): Promise<number[]> {
	const runs = await db
		.select({ likeCount: generationRun.likeCount })
		.from(generationRun)
		.all();
	const pops = await db
		.select({ likeCount: cellPopulation.likeCount })
		.from(cellPopulation)
		.all();
	return [...runs, ...pops].map((r) => r.likeCount).sort((a, b) => a - b);
}

export async function getUserMaxClaimLikeCount(userId: string): Promise<number> {
	const runMax = await db
		.select({ maxLikes: sql<number>`MAX(${generationRun.likeCount})` })
		.from(generationRun)
		.where(eq(generationRun.userId, userId))
		.get();
	const popMax = await db
		.select({ maxLikes: sql<number>`MAX(${cellPopulation.likeCount})` })
		.from(cellPopulation)
		.where(eq(cellPopulation.userId, userId))
		.get();
	return Math.max(runMax?.maxLikes ?? 0, popMax?.maxLikes ?? 0);
}
