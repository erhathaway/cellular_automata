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
			thumbnail: generationRun.thumbnail,
			likeCount: generationRun.likeCount,
			userName: user.name,
			userImageUrl: user.imageUrl
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
			thumbnail: cellPopulation.thumbnail,
			likeCount: cellPopulation.likeCount,
			stability: cellPopulation.stability,
			userName: user.name,
			userImageUrl: user.imageUrl
		})
		.from(cellPopulation)
		.leftJoin(user, eq(cellPopulation.userId, user.id))
		.orderBy(desc(cellPopulation.likeCount), desc(cellPopulation.createdAt))
		.limit(10);

	return json({ topRuns, topPopulations });
};
