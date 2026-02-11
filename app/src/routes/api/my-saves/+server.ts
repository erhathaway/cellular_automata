import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user, entityTag, tag } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '40'), 100);

	const [runs, pops] = await Promise.all([
		db
			.select({
				id: generationRun.id,
				entityType: sql<string>`'generation_run'`.as('entity_type'),
				userId: generationRun.userId,
				dimension: generationRun.dimension,
				viewer: generationRun.viewer,
				ruleType: generationRun.ruleType,
				ruleDefinition: generationRun.ruleDefinition,
				neighborhoodRadius: generationRun.neighborhoodRadius,
				populationShape: generationRun.populationShape,
				cellStates: generationRun.cellStates,
				title: generationRun.title,
				description: generationRun.description,
				thumbnail: generationRun.thumbnail,
				fingerprint: generationRun.fingerprint,
				likeCount: generationRun.likeCount,
				bookmarkCount: generationRun.bookmarkCount,
				createdAt: generationRun.createdAt,
				userName: user.name,
				userImageUrl: user.imageUrl
			})
			.from(generationRun)
			.leftJoin(user, eq(generationRun.userId, user.id))
			.where(eq(generationRun.userId, auth.userId))
			.orderBy(desc(generationRun.createdAt))
			.limit(limit),
		db
			.select({
				id: cellPopulation.id,
				entityType: sql<string>`'cell_population'`.as('entity_type'),
				userId: cellPopulation.userId,
				dimension: cellPopulation.dimension,
				viewer: cellPopulation.viewer,
				ruleType: cellPopulation.ruleType,
				ruleDefinition: cellPopulation.ruleDefinition,
				neighborhoodRadius: cellPopulation.neighborhoodRadius,
				populationShape: cellPopulation.populationShape,
				cellStates: cellPopulation.cellStates,
				stability: cellPopulation.stability,
				title: cellPopulation.title,
				description: cellPopulation.description,
				thumbnail: cellPopulation.thumbnail,
				fingerprint: cellPopulation.fingerprint,
				likeCount: cellPopulation.likeCount,
				bookmarkCount: cellPopulation.bookmarkCount,
				createdAt: cellPopulation.createdAt,
				userName: user.name,
				userImageUrl: user.imageUrl
			})
			.from(cellPopulation)
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.where(eq(cellPopulation.userId, auth.userId))
			.orderBy(desc(cellPopulation.createdAt))
			.limit(limit)
	]);

	const items = [...runs, ...pops]
		.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
		.slice(0, limit);

	return json({ items });
};
