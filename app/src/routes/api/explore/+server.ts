import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user, like, bookmark, entityTag, tag } from '$lib/server/db/schema';
import { eq, desc, and, sql, isNotNull } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	const type = url.searchParams.get('type') ?? 'all';
	const dimension = url.searchParams.get('dimension');
	const sort = url.searchParams.get('sort') ?? 'newest';
	const tagFilter = url.searchParams.get('tag');
	const cursor = url.searchParams.get('cursor');
	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 50);

	const auth = locals.auth();
	const userId = auth.userId;

	const items: any[] = [];

	// Fetch generation runs
	if (type === 'all' || type === 'generation_run') {
		const runConditions = [];
		if (dimension) runConditions.push(eq(generationRun.dimension, parseInt(dimension)));

		const runOrderBy =
			sort === 'most_liked'
				? [desc(generationRun.likeCount), desc(generationRun.createdAt)]
				: [desc(generationRun.createdAt)];

		let runsQuery = db
			.select({
				id: generationRun.id,
				entityType: sql<string>`'generation_run'`.as('entity_type'),
				userId: generationRun.userId,
				dimension: generationRun.dimension,
				viewer: generationRun.viewer,
				ruleType: generationRun.ruleType,
				ruleDefinition: generationRun.ruleDefinition,
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
			.where(runConditions.length > 0 ? and(...runConditions) : undefined)
			.orderBy(...runOrderBy)
			.limit(type === 'all' ? Math.ceil(limit / 2) : limit);

		const runs = await runsQuery;

		// Fetch like/bookmark status for authenticated user
		for (const run of runs) {
			let isLikedByMe = false;
			let isBookmarkedByMe = false;
			if (userId) {
				const userLike = await db
					.select({ id: like.id })
					.from(like)
					.where(and(eq(like.userId, userId), eq(like.generationRunId, run.id)))
					.get();
				isLikedByMe = !!userLike;

				const userBookmark = await db
					.select({ id: bookmark.id })
					.from(bookmark)
					.where(
						and(eq(bookmark.userId, userId), eq(bookmark.generationRunId, run.id))
					)
					.get();
				isBookmarkedByMe = !!userBookmark;
			}

			// Fetch tags
			const tags = await db
				.select({ tagName: tag.name, entityTagId: entityTag.id, upvoteCount: entityTag.upvoteCount })
				.from(entityTag)
				.innerJoin(tag, eq(entityTag.tagId, tag.id))
				.where(eq(entityTag.generationRunId, run.id))
				.orderBy(desc(entityTag.upvoteCount));

			items.push({
				...run,
				isLikedByMe,
				isBookmarkedByMe,
				tags
			});
		}
	}

	// Fetch cell populations
	if (type === 'all' || type === 'cell_population') {
		const popConditions = [];
		if (dimension) popConditions.push(eq(cellPopulation.dimension, parseInt(dimension)));

		const popOrderBy =
			sort === 'most_liked'
				? [desc(cellPopulation.likeCount), desc(cellPopulation.createdAt)]
				: [desc(cellPopulation.createdAt)];

		const pops = await db
			.select({
				id: cellPopulation.id,
				entityType: sql<string>`'cell_population'`.as('entity_type'),
				userId: cellPopulation.userId,
				dimension: cellPopulation.dimension,
				viewer: cellPopulation.viewer,
				ruleType: cellPopulation.ruleType,
				ruleDefinition: cellPopulation.ruleDefinition,
				populationShape: cellPopulation.populationShape,
				cellStates: cellPopulation.cellStates,
				stability: cellPopulation.stability,
				stablePeriod: cellPopulation.stablePeriod,
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
			.where(popConditions.length > 0 ? and(...popConditions) : undefined)
			.orderBy(...popOrderBy)
			.limit(type === 'all' ? Math.floor(limit / 2) : limit);

		for (const pop of pops) {
			let isLikedByMe = false;
			let isBookmarkedByMe = false;
			if (userId) {
				const userLike = await db
					.select({ id: like.id })
					.from(like)
					.where(
						and(eq(like.userId, userId), eq(like.cellPopulationId, pop.id))
					)
					.get();
				isLikedByMe = !!userLike;

				const userBookmark = await db
					.select({ id: bookmark.id })
					.from(bookmark)
					.where(
						and(eq(bookmark.userId, userId), eq(bookmark.cellPopulationId, pop.id))
					)
					.get();
				isBookmarkedByMe = !!userBookmark;
			}

			const tags = await db
				.select({ tagName: tag.name, entityTagId: entityTag.id, upvoteCount: entityTag.upvoteCount })
				.from(entityTag)
				.innerJoin(tag, eq(entityTag.tagId, tag.id))
				.where(eq(entityTag.cellPopulationId, pop.id))
				.orderBy(desc(entityTag.upvoteCount));

			items.push({
				...pop,
				isLikedByMe,
				isBookmarkedByMe,
				tags
			});
		}
	}

	// Sort combined results
	if (sort === 'most_liked') {
		items.sort((a, b) => b.likeCount - a.likeCount);
	} else {
		items.sort(
			(a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
		);
	}

	return json({ items: items.slice(0, limit) });
};
