import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { discovery, generationRun, cellPopulation, user, like, bookmark } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { generationRunFingerprint } from '$lib/server/fingerprint';

export const GET: RequestHandler = async ({ url, locals }) => {
	const dimension = parseInt(url.searchParams.get('d') ?? '');
	const ruleType = url.searchParams.get('rt') ?? '';
	const ruleDefinition = url.searchParams.get('rd') ?? '';
	const neighborhoodRadius = parseInt(url.searchParams.get('nr') ?? '1');
	const latticeType = url.searchParams.get('lt') ?? undefined;

	if (!dimension || !ruleType || !ruleDefinition) {
		return json({ found: false });
	}

	const fingerprint = generationRunFingerprint(dimension, ruleType, ruleDefinition, neighborhoodRadius, latticeType);

	// Check discovery table
	const disc = await db
		.select({
			discoveredByUserId: discovery.discoveredByUserId,
			discoveredAt: discovery.discoveredAt
		})
		.from(discovery)
		.where(eq(discovery.fingerprint, fingerprint))
		.get();

	if (!disc) {
		return json({ found: false, fingerprint });
	}

	// Get discoverer's name
	const discoverer = await db
		.select({ name: user.name, displayName: user.displayName, imageUrl: user.imageUrl, avatarId: user.avatarId })
		.from(user)
		.where(eq(user.id, disc.discoveredByUserId))
		.get();

	// Count saves of this fingerprint (generation runs)
	const runs = await db
		.select({ id: generationRun.id, likeCount: generationRun.likeCount, bookmarkCount: generationRun.bookmarkCount })
		.from(generationRun)
		.where(eq(generationRun.fingerprint, fingerprint));

	const pops = await db
		.select({ id: cellPopulation.id, likeCount: cellPopulation.likeCount, bookmarkCount: cellPopulation.bookmarkCount })
		.from(cellPopulation)
		.where(eq(cellPopulation.fingerprint, fingerprint));

	const totalLikes = [...runs, ...pops].reduce((sum, r) => sum + (r.likeCount ?? 0), 0);
	const totalBookmarks = [...runs, ...pops].reduce((sum, r) => sum + (r.bookmarkCount ?? 0), 0);

	// Check if current user has liked/bookmarked any entity with this fingerprint
	const auth = locals.auth();
	let isLikedByMe = false;
	let isBookmarkedByMe = false;

	if (auth.userId) {
		const allIds = [...runs.map((r) => r.id), ...pops.map((p) => p.id)];
		if (allIds.length > 0) {
			const runIds = runs.map((r) => r.id);
			const popIds = pops.map((p) => p.id);

			const [myRunLikes, myPopLikes, myRunBookmarks, myPopBookmarks] = await Promise.all([
				runIds.length > 0
					? db.select({ id: like.id }).from(like)
						.where(and(eq(like.userId, auth.userId), inArray(like.generationRunId, runIds)))
						.limit(1)
					: [],
				popIds.length > 0
					? db.select({ id: like.id }).from(like)
						.where(and(eq(like.userId, auth.userId), inArray(like.cellPopulationId, popIds)))
						.limit(1)
					: [],
				runIds.length > 0
					? db.select({ id: bookmark.id }).from(bookmark)
						.where(and(eq(bookmark.userId, auth.userId), inArray(bookmark.generationRunId, runIds)))
						.limit(1)
					: [],
				popIds.length > 0
					? db.select({ id: bookmark.id }).from(bookmark)
						.where(and(eq(bookmark.userId, auth.userId), inArray(bookmark.cellPopulationId, popIds)))
						.limit(1)
					: []
			]);

			isLikedByMe = myRunLikes.length > 0 || myPopLikes.length > 0;
			isBookmarkedByMe = myRunBookmarks.length > 0 || myPopBookmarks.length > 0;
		}
	}

	// Provide a reference entity for like/bookmark API calls
	const firstRun = runs[0] ?? null;
	const firstPop = pops[0] ?? null;

	return json({
		found: true,
		fingerprint,
		discoveredBy: discoverer?.displayName ?? discoverer?.name ?? 'Anonymous',
		discoveredByImageUrl: discoverer?.imageUrl ?? null,
		discoveredByAvatarId: discoverer?.avatarId ?? null,
		discoveredAt: disc.discoveredAt,
		saveCount: runs.length + pops.length,
		totalLikes,
		totalBookmarks,
		isLikedByMe,
		isBookmarkedByMe,
		entityId: firstRun?.id ?? firstPop?.id ?? null,
		entityType: firstRun ? 'generation_run' : firstPop ? 'cell_population' : null
	});
};
