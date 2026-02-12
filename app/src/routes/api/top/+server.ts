import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
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
				userAvatarId: user.avatarId
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
				userAvatarId: user.avatarId
			})
			.from(cellPopulation)
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.orderBy(desc(cellPopulation.likeCount), desc(cellPopulation.createdAt))
			.limit(offset + limit + 1)
	]);

	const all = [...runs, ...pops]
		.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));

	const items = all.slice(offset, offset + limit);

	return json({ items, hasMore: offset + limit < all.length });
};
