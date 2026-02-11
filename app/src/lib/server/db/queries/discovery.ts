import { db } from '../index';
import { discovery } from '../schema';
import { eq } from 'drizzle-orm';

export async function checkAndRecordDiscovery(params: {
	fingerprint: string;
	entityType: 'generation_run' | 'cell_population';
	generationRunId?: string;
	cellPopulationId?: string;
	userId: string;
}): Promise<{ isDiscoverer: boolean; discoveredByUserId: string }> {
	const existing = await db
		.select()
		.from(discovery)
		.where(eq(discovery.fingerprint, params.fingerprint))
		.get();

	if (existing) {
		return {
			isDiscoverer: existing.discoveredByUserId === params.userId,
			discoveredByUserId: existing.discoveredByUserId
		};
	}

	await db.insert(discovery).values({
		fingerprint: params.fingerprint,
		entityType: params.entityType,
		generationRunId: params.generationRunId,
		cellPopulationId: params.cellPopulationId,
		discoveredByUserId: params.userId
	});

	return { isDiscoverer: true, discoveredByUserId: params.userId };
}

export async function getDiscoveryByFingerprint(fingerprint: string) {
	return db
		.select()
		.from(discovery)
		.where(eq(discovery.fingerprint, fingerprint))
		.get();
}
