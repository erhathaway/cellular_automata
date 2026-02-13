import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user, discovery, generationRun, cellPopulation } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const userId = params.id;

	// Fetch user profile
	const [profile] = await db
		.select({
			id: user.id,
			displayName: sql<string | null>`COALESCE(${user.displayName}, ${user.name})`.as('display_name'),
			avatarId: user.avatarId,
			minerConfig: user.minerConfig,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!profile) {
		throw error(404, 'Miner not found');
	}

	// Fetch per-miner discovery stats (radius + lattice)
	const rows = await db
		.select({
			neighborhoodRadius: sql<number>`COALESCE(${generationRun.neighborhoodRadius}, ${cellPopulation.neighborhoodRadius})`.as('neighborhood_radius'),
			latticeType: sql<string>`COALESCE(${generationRun.latticeType}, ${cellPopulation.latticeType})`.as('lattice_type')
		})
		.from(discovery)
		.leftJoin(generationRun, eq(discovery.generationRunId, generationRun.id))
		.leftJoin(cellPopulation, eq(discovery.cellPopulationId, cellPopulation.id))
		.where(eq(discovery.discoveredByUserId, userId));

	const claimCount = rows.length;
	const byRadius: Record<string, number> = {};
	const byLattice: Record<string, number> = {};

	for (const row of rows) {
		const r = String(row.neighborhoodRadius ?? 1);
		const l = row.latticeType ?? 'square';
		byRadius[r] = (byRadius[r] ?? 0) + 1;
		byLattice[l] = (byLattice[l] ?? 0) + 1;
	}

	return {
		profile,
		stats: { claimCount, byRadius, byLattice }
	};
};
