import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { discovery, generationRun, cellPopulation, user } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generationRunFingerprint } from '$lib/server/fingerprint';

export const GET: RequestHandler = async ({ url }) => {
	const dimension = parseInt(url.searchParams.get('d') ?? '');
	const ruleType = url.searchParams.get('rt') ?? '';
	const ruleDefinition = url.searchParams.get('rd') ?? '';
	const neighborhoodRadius = parseInt(url.searchParams.get('nr') ?? '1');

	if (!dimension || !ruleType || !ruleDefinition) {
		return json({ found: false });
	}

	const fingerprint = generationRunFingerprint(dimension, ruleType, ruleDefinition, neighborhoodRadius);

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
		.select({ name: user.name, imageUrl: user.imageUrl })
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

	return json({
		found: true,
		fingerprint,
		discoveredBy: discoverer?.name ?? 'Anonymous',
		discoveredByImageUrl: discoverer?.imageUrl ?? null,
		discoveredAt: disc.discoveredAt,
		saveCount: runs.length + pops.length,
		totalLikes,
		totalBookmarks
	});
};
