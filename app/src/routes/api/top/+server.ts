import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user, like, bookmark } from '$lib/server/db/schema';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';

async function annotateInteractions(items: any[], userId: string | null) {
	if (!userId || items.length === 0) return items;

	const runIds = items.filter(i => i.entityType === 'generation_run').map(i => i.id);
	const popIds = items.filter(i => i.entityType === 'cell_population').map(i => i.id);

	const [likedRuns, likedPops, bookmarkedRuns, bookmarkedPops] = await Promise.all([
		runIds.length
			? db.select({ id: like.generationRunId }).from(like).where(and(eq(like.userId, userId), inArray(like.generationRunId, runIds))).then(r => new Set(r.map(x => x.id)))
			: Promise.resolve(new Set<string | null>()),
		popIds.length
			? db.select({ id: like.cellPopulationId }).from(like).where(and(eq(like.userId, userId), inArray(like.cellPopulationId, popIds))).then(r => new Set(r.map(x => x.id)))
			: Promise.resolve(new Set<string | null>()),
		runIds.length
			? db.select({ id: bookmark.generationRunId }).from(bookmark).where(and(eq(bookmark.userId, userId), inArray(bookmark.generationRunId, runIds))).then(r => new Set(r.map(x => x.id)))
			: Promise.resolve(new Set<string | null>()),
		popIds.length
			? db.select({ id: bookmark.cellPopulationId }).from(bookmark).where(and(eq(bookmark.userId, userId), inArray(bookmark.cellPopulationId, popIds))).then(r => new Set(r.map(x => x.id)))
			: Promise.resolve(new Set<string | null>()),
	]);

	return items.map(item => ({
		...item,
		isLikedByMe: item.entityType === 'generation_run' ? likedRuns.has(item.id) : likedPops.has(item.id),
		isBookmarkedByMe: item.entityType === 'generation_run' ? bookmarkedRuns.has(item.id) : bookmarkedPops.has(item.id),
	}));
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0);
	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 50);

	const [runs, pops] = await Promise.all([
		db
			.select({
				id: generationRun.id,
				entityType: sql<string>`'generation_run'`.as('entity_type'),
				title: generationRun.title,
				dimension: generationRun.dimension,
				viewer: generationRun.viewer,
				ruleType: generationRun.ruleType,
				ruleDefinition: generationRun.ruleDefinition,
				populationShape: generationRun.populationShape,
				cellStates: generationRun.cellStates,
				neighborhoodRadius: generationRun.neighborhoodRadius,
				latticeType: generationRun.latticeType,
				likeCount: generationRun.likeCount,
				createdAt: generationRun.createdAt,
				userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
				userImageUrl: user.imageUrl,
				userAvatarId: user.avatarId,
				userMinerConfig: user.minerConfig
			})
			.from(generationRun)
			.leftJoin(user, eq(generationRun.userId, user.id))
			.orderBy(desc(generationRun.likeCount), desc(generationRun.createdAt))
			.limit(offset + limit + 1),
		db
			.select({
				id: cellPopulation.id,
				entityType: sql<string>`'cell_population'`.as('entity_type'),
				title: cellPopulation.title,
				dimension: cellPopulation.dimension,
				viewer: cellPopulation.viewer,
				ruleType: cellPopulation.ruleType,
				ruleDefinition: cellPopulation.ruleDefinition,
				populationShape: cellPopulation.populationShape,
				cellStates: cellPopulation.cellStates,
				neighborhoodRadius: cellPopulation.neighborhoodRadius,
				latticeType: cellPopulation.latticeType,
				likeCount: cellPopulation.likeCount,
				createdAt: cellPopulation.createdAt,
				stability: cellPopulation.stability,
				userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
				userImageUrl: user.imageUrl,
				userAvatarId: user.avatarId,
				userMinerConfig: user.minerConfig
			})
			.from(cellPopulation)
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.orderBy(desc(cellPopulation.likeCount), desc(cellPopulation.createdAt))
			.limit(offset + limit + 1)
	]);

	const all = [...runs, ...pops]
		.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));

	const userId = locals.auth?.()?.userId ?? null;
	const items = await annotateInteractions(all.slice(offset, offset + limit), userId);

	return json({ items, hasMore: offset + limit < all.length });
};
