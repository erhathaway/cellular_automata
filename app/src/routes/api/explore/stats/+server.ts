import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { discovery, generationRun, cellPopulation, user } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	// Fetch all discoveries joined with their linked entity to get radius + lattice
	const rows = await db
		.select({
			userId: discovery.discoveredByUserId,
			neighborhoodRadius: sql<number>`COALESCE(${generationRun.neighborhoodRadius}, ${cellPopulation.neighborhoodRadius})`.as('neighborhood_radius'),
			latticeType: sql<string>`COALESCE(${generationRun.latticeType}, ${cellPopulation.latticeType})`.as('lattice_type')
		})
		.from(discovery)
		.leftJoin(generationRun, eq(discovery.generationRunId, generationRun.id))
		.leftJoin(cellPopulation, eq(discovery.cellPopulationId, cellPopulation.id));

	const totalClaims = rows.length;
	const byRadius: Record<string, number> = {};
	const byLattice: Record<string, number> = {};

	// Per-user tracking
	const userMap = new Map<string, {
		claimCount: number;
		byRadius: Record<string, number>;
		byLattice: Record<string, number>;
	}>();

	for (const row of rows) {
		const r = String(row.neighborhoodRadius ?? 1);
		const l = row.latticeType ?? 'square';

		byRadius[r] = (byRadius[r] ?? 0) + 1;
		byLattice[l] = (byLattice[l] ?? 0) + 1;

		let entry = userMap.get(row.userId);
		if (!entry) {
			entry = { claimCount: 0, byRadius: {}, byLattice: {} };
			userMap.set(row.userId, entry);
		}
		entry.claimCount++;
		entry.byRadius[r] = (entry.byRadius[r] ?? 0) + 1;
		entry.byLattice[l] = (entry.byLattice[l] ?? 0) + 1;
	}

	// Sort users by claim count, take top 20
	const topUserIds = [...userMap.entries()]
		.sort((a, b) => b[1].claimCount - a[1].claimCount)
		.slice(0, 20)
		.map(([id]) => id);

	// Fetch user profiles for leaderboard
	const userProfiles = topUserIds.length > 0
		? await db
			.select({
				id: user.id,
				displayName: sql<string | null>`COALESCE(${user.displayName}, ${user.name})`.as('display_name'),
				avatarId: user.avatarId
			})
			.from(user)
			.where(sql`${user.id} IN (${sql.join(topUserIds.map(id => sql`${id}`), sql`, `)})`)
		: [];

	const profileMap = new Map(userProfiles.map(p => [p.id, p]));

	const leaderboard = topUserIds.map(userId => {
		const entry = userMap.get(userId)!;
		const profile = profileMap.get(userId);
		return {
			userId,
			displayName: profile?.displayName ?? null,
			avatarId: profile?.avatarId ?? null,
			claimCount: entry.claimCount,
			byRadius: entry.byRadius,
			byLattice: entry.byLattice
		};
	});

	return json({ totalClaims, byRadius, byLattice, leaderboard });
};
