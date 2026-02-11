import { db } from '../index';
import {
	bookmark,
	generationRun,
	cellPopulation,
	user
} from '../schema';
import { eq, and, sql, desc, isNotNull } from 'drizzle-orm';

export async function bookmarkGenerationRun(userId: string, generationRunId: string) {
	await db.batch([
		db.insert(bookmark).values({ userId, generationRunId }),
		db
			.update(generationRun)
			.set({ bookmarkCount: sql`${generationRun.bookmarkCount} + 1` })
			.where(eq(generationRun.id, generationRunId))
	]);
}

export async function unbookmarkGenerationRun(userId: string, generationRunId: string) {
	const existing = await db
		.select({ id: bookmark.id })
		.from(bookmark)
		.where(and(eq(bookmark.userId, userId), eq(bookmark.generationRunId, generationRunId)))
		.get();

	if (!existing) return false;

	await db.batch([
		db
			.delete(bookmark)
			.where(and(eq(bookmark.userId, userId), eq(bookmark.generationRunId, generationRunId))),
		db
			.update(generationRun)
			.set({ bookmarkCount: sql`MAX(${generationRun.bookmarkCount} - 1, 0)` })
			.where(eq(generationRun.id, generationRunId))
	]);
	return true;
}

export async function bookmarkCellPopulation(userId: string, cellPopulationId: string) {
	await db.batch([
		db.insert(bookmark).values({ userId, cellPopulationId }),
		db
			.update(cellPopulation)
			.set({ bookmarkCount: sql`${cellPopulation.bookmarkCount} + 1` })
			.where(eq(cellPopulation.id, cellPopulationId))
	]);
}

export async function unbookmarkCellPopulation(userId: string, cellPopulationId: string) {
	const existing = await db
		.select({ id: bookmark.id })
		.from(bookmark)
		.where(and(eq(bookmark.userId, userId), eq(bookmark.cellPopulationId, cellPopulationId)))
		.get();

	if (!existing) return false;

	await db.batch([
		db
			.delete(bookmark)
			.where(
				and(eq(bookmark.userId, userId), eq(bookmark.cellPopulationId, cellPopulationId))
			),
		db
			.update(cellPopulation)
			.set({ bookmarkCount: sql`MAX(${cellPopulation.bookmarkCount} - 1, 0)` })
			.where(eq(cellPopulation.id, cellPopulationId))
	]);
	return true;
}

export async function listUserBookmarks(
	userId: string,
	type?: 'generation_run' | 'cell_population'
) {
	if (type === 'generation_run' || !type) {
		const runBookmarks = await db
			.select({
				bookmarkId: bookmark.id,
				bookmarkedAt: bookmark.createdAt,
				entityType: sql<string>`'generation_run'`.as('entity_type'),
				id: generationRun.id,
				title: generationRun.title,
				dimension: generationRun.dimension,
				viewer: generationRun.viewer,
				ruleType: generationRun.ruleType,
				ruleDefinition: generationRun.ruleDefinition,
				populationShape: generationRun.populationShape,
				cellStates: generationRun.cellStates,
					likeCount: generationRun.likeCount,
				createdAt: generationRun.createdAt,
				userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
				userImageUrl: user.imageUrl,
				userAvatarId: user.avatarId
			})
			.from(bookmark)
			.innerJoin(generationRun, eq(bookmark.generationRunId, generationRun.id))
			.leftJoin(user, eq(generationRun.userId, user.id))
			.where(
				and(eq(bookmark.userId, userId), isNotNull(bookmark.generationRunId))
			)
			.orderBy(desc(bookmark.createdAt));

		if (type === 'generation_run') return runBookmarks;

		const popBookmarks = await db
			.select({
				bookmarkId: bookmark.id,
				bookmarkedAt: bookmark.createdAt,
				entityType: sql<string>`'cell_population'`.as('entity_type'),
				id: cellPopulation.id,
				title: cellPopulation.title,
				dimension: cellPopulation.dimension,
				viewer: cellPopulation.viewer,
				ruleType: cellPopulation.ruleType,
				ruleDefinition: cellPopulation.ruleDefinition,
				populationShape: cellPopulation.populationShape,
				cellStates: cellPopulation.cellStates,
					likeCount: cellPopulation.likeCount,
				createdAt: cellPopulation.createdAt,
				userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
				userImageUrl: user.imageUrl,
				userAvatarId: user.avatarId
			})
			.from(bookmark)
			.innerJoin(cellPopulation, eq(bookmark.cellPopulationId, cellPopulation.id))
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.where(
				and(eq(bookmark.userId, userId), isNotNull(bookmark.cellPopulationId))
			)
			.orderBy(desc(bookmark.createdAt));

		return [...runBookmarks, ...popBookmarks].sort(
			(a, b) => (b.bookmarkedAt?.getTime() ?? 0) - (a.bookmarkedAt?.getTime() ?? 0)
		);
	}

	// cell_population only
	return db
		.select({
			bookmarkId: bookmark.id,
			bookmarkedAt: bookmark.createdAt,
			entityType: sql<string>`'cell_population'`.as('entity_type'),
			id: cellPopulation.id,
			title: cellPopulation.title,
			dimension: cellPopulation.dimension,
			viewer: cellPopulation.viewer,
			ruleType: cellPopulation.ruleType,
			ruleDefinition: cellPopulation.ruleDefinition,
			populationShape: cellPopulation.populationShape,
			cellStates: cellPopulation.cellStates,
			likeCount: cellPopulation.likeCount,
			createdAt: cellPopulation.createdAt,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(bookmark)
		.innerJoin(cellPopulation, eq(bookmark.cellPopulationId, cellPopulation.id))
		.leftJoin(user, eq(cellPopulation.userId, user.id))
		.where(
			and(eq(bookmark.userId, userId), isNotNull(bookmark.cellPopulationId))
		)
		.orderBy(desc(bookmark.createdAt));
}

export async function getUserBookmarkForRun(userId: string, generationRunId: string) {
	return db
		.select({ id: bookmark.id })
		.from(bookmark)
		.where(and(eq(bookmark.userId, userId), eq(bookmark.generationRunId, generationRunId)))
		.get();
}

export async function getUserBookmarkForPopulation(userId: string, cellPopulationId: string) {
	return db
		.select({ id: bookmark.id })
		.from(bookmark)
		.where(
			and(eq(bookmark.userId, userId), eq(bookmark.cellPopulationId, cellPopulationId))
		)
		.get();
}
