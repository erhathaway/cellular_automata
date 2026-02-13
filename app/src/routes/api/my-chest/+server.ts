import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation, user, like, bookmark } from '$lib/server/db/schema';
import { eq, desc, and, sql, isNotNull, inArray } from 'drizzle-orm';

// Shared column shape for all queries so items merge cleanly
const runColumns = {
	id: generationRun.id,
	entityType: sql<string>`'generation_run'`.as('entity_type'),
	userId: generationRun.userId,
	dimension: generationRun.dimension,
	viewer: generationRun.viewer,
	ruleType: generationRun.ruleType,
	ruleDefinition: generationRun.ruleDefinition,
	neighborhoodRadius: generationRun.neighborhoodRadius,
	latticeType: generationRun.latticeType,
	populationShape: generationRun.populationShape,
	cellStates: generationRun.cellStates,
	title: generationRun.title,
	description: generationRun.description,
	fingerprint: generationRun.fingerprint,
	likeCount: generationRun.likeCount,
	bookmarkCount: generationRun.bookmarkCount,
	createdAt: generationRun.createdAt,
	userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
	userImageUrl: user.imageUrl,
	userAvatarId: user.avatarId,
	userMinerConfig: user.minerConfig,
};

const popColumns = {
	id: cellPopulation.id,
	entityType: sql<string>`'cell_population'`.as('entity_type'),
	userId: cellPopulation.userId,
	dimension: cellPopulation.dimension,
	viewer: cellPopulation.viewer,
	ruleType: cellPopulation.ruleType,
	ruleDefinition: cellPopulation.ruleDefinition,
	neighborhoodRadius: cellPopulation.neighborhoodRadius,
	latticeType: cellPopulation.latticeType,
	populationShape: cellPopulation.populationShape,
	cellStates: cellPopulation.cellStates,
	title: cellPopulation.title,
	description: cellPopulation.description,
	fingerprint: cellPopulation.fingerprint,
	likeCount: cellPopulation.likeCount,
	bookmarkCount: cellPopulation.bookmarkCount,
	createdAt: cellPopulation.createdAt,
	userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
	userImageUrl: user.imageUrl,
	userAvatarId: user.avatarId,
	userMinerConfig: user.minerConfig,
};

async function fetchClaimed(userId: string, maxRows: number) {
	const [runs, pops] = await Promise.all([
		db.select(runColumns)
			.from(generationRun)
			.leftJoin(user, eq(generationRun.userId, user.id))
			.where(eq(generationRun.userId, userId))
			.orderBy(desc(generationRun.createdAt))
			.limit(maxRows),
		db.select(popColumns)
			.from(cellPopulation)
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.where(eq(cellPopulation.userId, userId))
			.orderBy(desc(cellPopulation.createdAt))
			.limit(maxRows),
	]);
	return [...runs, ...pops];
}

async function fetchLiked(userId: string, maxRows: number) {
	const [runs, pops] = await Promise.all([
		db.select({
			...runColumns,
			interactedAt: like.createdAt,
		})
			.from(like)
			.innerJoin(generationRun, eq(like.generationRunId, generationRun.id))
			.leftJoin(user, eq(generationRun.userId, user.id))
			.where(and(eq(like.userId, userId), isNotNull(like.generationRunId)))
			.orderBy(desc(like.createdAt))
			.limit(maxRows),
		db.select({
			...popColumns,
			interactedAt: like.createdAt,
		})
			.from(like)
			.innerJoin(cellPopulation, eq(like.cellPopulationId, cellPopulation.id))
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.where(and(eq(like.userId, userId), isNotNull(like.cellPopulationId)))
			.orderBy(desc(like.createdAt))
			.limit(maxRows),
	]);
	return [...runs, ...pops];
}

async function fetchBookmarked(userId: string, maxRows: number) {
	const [runs, pops] = await Promise.all([
		db.select({
			...runColumns,
			interactedAt: bookmark.createdAt,
		})
			.from(bookmark)
			.innerJoin(generationRun, eq(bookmark.generationRunId, generationRun.id))
			.leftJoin(user, eq(generationRun.userId, user.id))
			.where(and(eq(bookmark.userId, userId), isNotNull(bookmark.generationRunId)))
			.orderBy(desc(bookmark.createdAt))
			.limit(maxRows),
		db.select({
			...popColumns,
			interactedAt: bookmark.createdAt,
		})
			.from(bookmark)
			.innerJoin(cellPopulation, eq(bookmark.cellPopulationId, cellPopulation.id))
			.leftJoin(user, eq(cellPopulation.userId, user.id))
			.where(and(eq(bookmark.userId, userId), isNotNull(bookmark.cellPopulationId)))
			.orderBy(desc(bookmark.createdAt))
			.limit(maxRows),
	]);
	return [...runs, ...pops];
}

async function annotateInteractions(items: any[], userId: string) {
	if (items.length === 0) return items;

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

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const filter = url.searchParams.get('filter') ?? 'all';
	const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0);
	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100);
	const maxRows = offset + limit + 1;

	let all: any[];

	if (filter === 'claimed') {
		all = await fetchClaimed(auth.userId, maxRows);
	} else if (filter === 'liked') {
		all = await fetchLiked(auth.userId, maxRows);
	} else if (filter === 'bookmarked') {
		all = await fetchBookmarked(auth.userId, maxRows);
	} else {
		// "all" — merge claimed + liked + bookmarked, deduplicate
		const [claimed, liked, bookmarked] = await Promise.all([
			fetchClaimed(auth.userId, maxRows),
			fetchLiked(auth.userId, maxRows),
			fetchBookmarked(auth.userId, maxRows),
		]);

		const seen = new Set<string>();
		all = [];
		for (const item of [...claimed, ...liked, ...bookmarked]) {
			const key = `${item.entityType}:${item.id}`;
			if (!seen.has(key)) {
				seen.add(key);
				all.push(item);
			}
		}
	}

	// Sort by most recent date
	all.sort((a, b) => {
		const dateA = (a.interactedAt ?? a.createdAt)?.getTime() ?? 0;
		const dateB = (b.interactedAt ?? b.createdAt)?.getTime() ?? 0;
		return dateB - dateA;
	});

	const items = await annotateInteractions(all.slice(offset, offset + limit), auth.userId);

	// Total claims count (generation_runs + cell_populations owned by user)
	const [runCount, popCount] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(generationRun).where(eq(generationRun.userId, auth.userId)),
		db.select({ count: sql<number>`count(*)` }).from(cellPopulation).where(eq(cellPopulation.userId, auth.userId)),
	]);
	const totalClaims = Number(runCount[0].count) + Number(popCount[0].count);

	return json({ items, hasMore: offset + limit < all.length, currentUserId: auth.userId, totalClaims });
};
