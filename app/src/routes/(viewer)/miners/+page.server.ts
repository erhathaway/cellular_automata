import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { discovery, generationRun, cellPopulation, user } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Fetch all discoveries with radius + lattice
	const rows = await db
		.select({
			userId: discovery.discoveredByUserId,
			neighborhoodRadius: sql<number>`COALESCE(${generationRun.neighborhoodRadius}, ${cellPopulation.neighborhoodRadius})`.as('neighborhood_radius'),
			latticeType: sql<string>`COALESCE(${generationRun.latticeType}, ${cellPopulation.latticeType})`.as('lattice_type')
		})
		.from(discovery)
		.leftJoin(generationRun, eq(discovery.generationRunId, generationRun.id))
		.leftJoin(cellPopulation, eq(discovery.cellPopulationId, cellPopulation.id));

	// Per-user tracking
	const userMap = new Map<string, {
		claimCount: number;
		byRadius: Record<string, number>;
		byLattice: Record<string, number>;
	}>();

	for (const row of rows) {
		const r = String(row.neighborhoodRadius ?? 1);
		const l = row.latticeType ?? 'square';

		let entry = userMap.get(row.userId);
		if (!entry) {
			entry = { claimCount: 0, byRadius: {}, byLattice: {} };
			userMap.set(row.userId, entry);
		}
		entry.claimCount++;
		entry.byRadius[r] = (entry.byRadius[r] ?? 0) + 1;
		entry.byLattice[l] = (entry.byLattice[l] ?? 0) + 1;
	}

	// Sort all users by claim count
	const sortedUserIds = [...userMap.entries()]
		.sort((a, b) => b[1].claimCount - a[1].claimCount)
		.map(([id]) => id);

	// Fetch user profiles (including createdAt)
	const userProfiles = sortedUserIds.length > 0
		? await db
			.select({
				id: user.id,
				displayName: sql<string | null>`COALESCE(${user.displayName}, ${user.name})`.as('display_name'),
				avatarId: user.avatarId,
				minerConfig: user.minerConfig,
				createdAt: user.createdAt
			})
			.from(user)
			.where(sql`${user.id} IN (${sql.join(sortedUserIds.map(id => sql`${id}`), sql`, `)})`)
		: [];

	const profileMap = new Map(userProfiles.map(p => [p.id, p]));

	const leaderboard = sortedUserIds.map((userId, i) => {
		const entry = userMap.get(userId)!;
		const profile = profileMap.get(userId);
		return {
			rank: i + 1,
			userId,
			displayName: profile?.displayName ?? null,
			avatarId: profile?.avatarId ?? null,
			minerConfig: profile?.minerConfig ?? null,
			createdAt: profile?.createdAt?.toISOString() ?? null,
			claimCount: entry.claimCount,
			byRadius: entry.byRadius,
			byLattice: entry.byLattice
		};
	});

	return { leaderboard };
};
