import { db } from '../index';
import { like, generationRun, cellPopulation } from '../schema';
import { eq, and, sql } from 'drizzle-orm';

export async function likeGenerationRun(userId: string, generationRunId: string): Promise<boolean> {
	// Check if already liked
	const existing = await db
		.select({ id: like.id })
		.from(like)
		.where(and(eq(like.userId, userId), eq(like.generationRunId, generationRunId)))
		.get();

	if (existing) return false; // already liked

	await db.batch([
		db.insert(like).values({ userId, generationRunId }),
		db
			.update(generationRun)
			.set({ likeCount: sql`${generationRun.likeCount} + 1` })
			.where(eq(generationRun.id, generationRunId))
	]);
	return true;
}

export async function unlikeGenerationRun(userId: string, generationRunId: string): Promise<boolean> {
	const existing = await db
		.select({ id: like.id })
		.from(like)
		.where(and(eq(like.userId, userId), eq(like.generationRunId, generationRunId)))
		.get();

	if (!existing) return false;

	await db.batch([
		db
			.delete(like)
			.where(and(eq(like.userId, userId), eq(like.generationRunId, generationRunId))),
		db
			.update(generationRun)
			.set({ likeCount: sql`MAX(${generationRun.likeCount} - 1, 0)` })
			.where(eq(generationRun.id, generationRunId))
	]);
	return true;
}

export async function likeCellPopulation(userId: string, cellPopulationId: string): Promise<boolean> {
	const existing = await db
		.select({ id: like.id })
		.from(like)
		.where(and(eq(like.userId, userId), eq(like.cellPopulationId, cellPopulationId)))
		.get();

	if (existing) return false; // already liked

	await db.batch([
		db.insert(like).values({ userId, cellPopulationId }),
		db
			.update(cellPopulation)
			.set({ likeCount: sql`${cellPopulation.likeCount} + 1` })
			.where(eq(cellPopulation.id, cellPopulationId))
	]);
	return true;
}

export async function unlikeCellPopulation(userId: string, cellPopulationId: string): Promise<boolean> {
	const existing = await db
		.select({ id: like.id })
		.from(like)
		.where(and(eq(like.userId, userId), eq(like.cellPopulationId, cellPopulationId)))
		.get();

	if (!existing) return false;

	await db.batch([
		db
			.delete(like)
			.where(and(eq(like.userId, userId), eq(like.cellPopulationId, cellPopulationId))),
		db
			.update(cellPopulation)
			.set({ likeCount: sql`MAX(${cellPopulation.likeCount} - 1, 0)` })
			.where(eq(cellPopulation.id, cellPopulationId))
	]);
	return true;
}

export async function getUserLikeForRun(userId: string, generationRunId: string) {
	return db
		.select({ id: like.id })
		.from(like)
		.where(and(eq(like.userId, userId), eq(like.generationRunId, generationRunId)))
		.get();
}

export async function getUserLikeForPopulation(userId: string, cellPopulationId: string) {
	return db
		.select({ id: like.id })
		.from(like)
		.where(and(eq(like.userId, userId), eq(like.cellPopulationId, cellPopulationId)))
		.get();
}
