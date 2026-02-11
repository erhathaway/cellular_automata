import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user, like, bookmark, entityTag, tag } from '$lib/server/db/schema';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	const type = url.searchParams.get('type') ?? 'all';
	const dimension = url.searchParams.get('dimension');
	const sort = url.searchParams.get('sort') ?? 'newest';
	const tagFilter = url.searchParams.get('tag');
	const cursor = url.searchParams.get('cursor');
	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 50);

	const auth = locals.auth();
	const userId = auth.userId;

	let runItems: any[] = [];
	let popItems: any[] = [];

	// Fetch generation runs
	if (type === 'all' || type === 'generation_run') {
		const runConditions = [];
		if (dimension) runConditions.push(eq(generationRun.dimension, parseInt(dimension)));

		const runOrderBy =
			sort === 'most_liked'
				? [desc(generationRun.likeCount), desc(generationRun.createdAt)]
				: [desc(generationRun.createdAt)];

		runItems = await db
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
				seedPopulation: generationRun.seedPopulation,
				likeCount: generationRun.likeCount,
				bookmarkCount: generationRun.bookmarkCount,
				createdAt: generationRun.createdAt,
				userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
				userImageUrl: user.imageUrl,
				userAvatarId: user.avatarId
			})
			.from(generationRun)
			.leftJoin(user, eq(generationRun.userId, user.id))
			.where(runConditions.length > 0 ? and(...runConditions) : undefined)
			.orderBy(...runOrderBy)
			.limit(type === 'all' ? Math.ceil(limit / 2) : limit);
	}

	// Fetch cell populations
	if (type === 'all' || type === 'cell_population') {
		const popConditions = [];
		if (dimension) popConditions.push(eq(cellPopulation.dimension, parseInt(dimension)));

		const popOrderBy =
			sort === 'most_liked'
				? [desc(cellPopulation.likeCount), desc(cellPopulation.createdAt)]
				: [desc(cellPopulation.createdAt)];

		popItems = await db
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
				stablePeriod: cellPopulation.stablePeriod,
				title: cellPopulation.title,
				description: cellPopulation.description,
				thumbnail: cellPopulation.thumbnail,
				fingerprint: cellPopulation.fingerprint,
				likeCount: cellPopulation.likeCount,
				bookmarkCount: cellPopulation.bookmarkCount,
				createdAt: cellPopulation.createdAt,
				userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
				userImageUrl: user.imageUrl,
				userAvatarId: user.avatarId
			})
			.from(cellPopulation)
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.where(popConditions.length > 0 ? and(...popConditions) : undefined)
			.orderBy(...popOrderBy)
			.limit(type === 'all' ? Math.floor(limit / 2) : limit);
	}

	// Batch fetch likes, bookmarks, and tags
	const runIds = runItems.map((r) => r.id);
	const popIds = popItems.map((p) => p.id);

	// Batch likes & bookmarks for authenticated user
	const likedRunIds = new Set<string>();
	const bookmarkedRunIds = new Set<string>();
	const likedPopIds = new Set<string>();
	const bookmarkedPopIds = new Set<string>();

	if (userId) {
		const [runLikes, runBookmarks, popLikes, popBookmarks] = await Promise.all([
			runIds.length > 0
				? db.select({ runId: like.generationRunId }).from(like)
					.where(and(eq(like.userId, userId), inArray(like.generationRunId, runIds)))
				: [],
			runIds.length > 0
				? db.select({ runId: bookmark.generationRunId }).from(bookmark)
					.where(and(eq(bookmark.userId, userId), inArray(bookmark.generationRunId, runIds)))
				: [],
			popIds.length > 0
				? db.select({ popId: like.cellPopulationId }).from(like)
					.where(and(eq(like.userId, userId), inArray(like.cellPopulationId, popIds)))
				: [],
			popIds.length > 0
				? db.select({ popId: bookmark.cellPopulationId }).from(bookmark)
					.where(and(eq(bookmark.userId, userId), inArray(bookmark.cellPopulationId, popIds)))
				: [],
		]);

		for (const r of runLikes) if (r.runId) likedRunIds.add(r.runId);
		for (const r of runBookmarks) if (r.runId) bookmarkedRunIds.add(r.runId);
		for (const p of popLikes) if (p.popId) likedPopIds.add(p.popId);
		for (const p of popBookmarks) if (p.popId) bookmarkedPopIds.add(p.popId);
	}

	// Batch fetch tags
	const [runTags, popTags] = await Promise.all([
		runIds.length > 0
			? db.select({
				generationRunId: entityTag.generationRunId,
				tagName: tag.name,
				entityTagId: entityTag.id,
				upvoteCount: entityTag.upvoteCount
			}).from(entityTag)
				.innerJoin(tag, eq(entityTag.tagId, tag.id))
				.where(inArray(entityTag.generationRunId, runIds))
				.orderBy(desc(entityTag.upvoteCount))
			: [],
		popIds.length > 0
			? db.select({
				cellPopulationId: entityTag.cellPopulationId,
				tagName: tag.name,
				entityTagId: entityTag.id,
				upvoteCount: entityTag.upvoteCount
			}).from(entityTag)
				.innerJoin(tag, eq(entityTag.tagId, tag.id))
				.where(inArray(entityTag.cellPopulationId, popIds))
				.orderBy(desc(entityTag.upvoteCount))
			: [],
	]);

	// Group tags by entity id
	const runTagsMap = new Map<string, any[]>();
	for (const t of runTags) {
		const id = t.generationRunId!;
		if (!runTagsMap.has(id)) runTagsMap.set(id, []);
		runTagsMap.get(id)!.push({ tagName: t.tagName, entityTagId: t.entityTagId, upvoteCount: t.upvoteCount });
	}
	const popTagsMap = new Map<string, any[]>();
	for (const t of popTags) {
		const id = t.cellPopulationId!;
		if (!popTagsMap.has(id)) popTagsMap.set(id, []);
		popTagsMap.get(id)!.push({ tagName: t.tagName, entityTagId: t.entityTagId, upvoteCount: t.upvoteCount });
	}

	// Assemble items
	const items: any[] = [];

	for (const run of runItems) {
		const { seedPopulation, ...rest } = run;
		items.push({
			...rest,
			seedPopulation: seedPopulation ? (seedPopulation as Buffer).toString('base64') : null,
			isLikedByMe: likedRunIds.has(run.id),
			isBookmarkedByMe: bookmarkedRunIds.has(run.id),
			tags: runTagsMap.get(run.id) ?? []
		});
	}

	for (const pop of popItems) {
		items.push({
			...pop,
			isLikedByMe: likedPopIds.has(pop.id),
			isBookmarkedByMe: bookmarkedPopIds.has(pop.id),
			tags: popTagsMap.get(pop.id) ?? []
		});
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
