import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const topRuns = await db
		.select({
			id: generationRun.id,
			entityType: sql`'generation_run'`,
			title: generationRun.title,
			dimension: generationRun.dimension,
			viewer: generationRun.viewer,
			ruleType: generationRun.ruleType,
			ruleDefinition: generationRun.ruleDefinition,
			populationShape: generationRun.populationShape,
			cellStates: generationRun.cellStates,
			neighborhoodRadius: generationRun.neighborhoodRadius,
			thumbnail: generationRun.thumbnail,
			seedPopulation: generationRun.seedPopulation,
			likeCount: generationRun.likeCount,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(generationRun)
		.leftJoin(user, eq(generationRun.userId, user.id))
		.orderBy(desc(generationRun.likeCount), desc(generationRun.createdAt))
		.limit(10);

	const topPopulations = await db
		.select({
			id: cellPopulation.id,
			entityType: sql`'cell_population'`,
			title: cellPopulation.title,
			dimension: cellPopulation.dimension,
			viewer: cellPopulation.viewer,
			ruleType: cellPopulation.ruleType,
			ruleDefinition: cellPopulation.ruleDefinition,
			populationShape: cellPopulation.populationShape,
			cellStates: cellPopulation.cellStates,
			neighborhoodRadius: cellPopulation.neighborhoodRadius,
			thumbnail: cellPopulation.thumbnail,
			likeCount: cellPopulation.likeCount,
			stability: cellPopulation.stability,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(cellPopulation)
		.leftJoin(user, eq(cellPopulation.userId, user.id))
		.orderBy(desc(cellPopulation.likeCount), desc(cellPopulation.createdAt))
		.limit(10);

	const mappedRuns = topRuns.map((run) => {
		const { seedPopulation, ...rest } = run;
		return { ...rest, seedPopulation: seedPopulation ? (seedPopulation as Buffer).toString('base64') : null };
	});

	return json({ topRuns: mappedRuns, topPopulations });
};
