import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	createGenerationRun,
	listGenerationRuns
} from '$lib/server/db/queries/generation-runs';
import { generationRunFingerprint } from '$lib/server/fingerprint';
import { checkAndRecordDiscovery } from '$lib/server/db/queries/discovery';

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const {
		dimension,
		viewer,
		ruleType,
		ruleDefinition,
		neighborhoodRadius,
		populationShape,
		cellStates,
		seedPopulation,
		generationIndex,
		title,
		description,
		thumbnail
	} = body;

	if (!dimension || !viewer || !ruleType || !ruleDefinition || !populationShape || !cellStates) {
		return error(400, 'Missing required fields');
	}

	const nr = neighborhoodRadius ?? 1;
	const fingerprint = generationRunFingerprint(dimension, ruleType, ruleDefinition, nr);

	// Check for existing record with same fingerprint (global dedup)
	const existing = await db
		.select({ id: generationRun.id, title: generationRun.title, userId: generationRun.userId })
		.from(generationRun)
		.where(eq(generationRun.fingerprint, fingerprint))
		.limit(1);

	if (existing.length > 0) {
		return json(
			{
				error: 'duplicate',
				message: 'This configuration already exists',
				existingId: existing[0].id,
				existingTitle: existing[0].title,
				entityType: 'generation_run'
			},
			{ status: 409 }
		);
	}

	const run = await createGenerationRun({
		userId: auth.userId,
		dimension,
		viewer,
		ruleType,
		ruleDefinition,
		neighborhoodRadius: nr,
		populationShape: typeof populationShape === 'string' ? populationShape : JSON.stringify(populationShape),
		cellStates: typeof cellStates === 'string' ? cellStates : JSON.stringify(cellStates),
		seedPopulation: seedPopulation ? Buffer.from(seedPopulation, 'base64') : undefined,
		generationIndex,
		title,
		description,
		thumbnail,
		fingerprint
	});

	const discoveryResult = await checkAndRecordDiscovery({
		fingerprint,
		entityType: 'generation_run',
		generationRunId: run.id,
		userId: auth.userId
	});

	return json({ ...run, discovery: discoveryResult }, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
	const dimension = url.searchParams.get('dimension');
	const ruleType = url.searchParams.get('ruleType');
	const sort = url.searchParams.get('sort') as 'newest' | 'most_liked' | null;
	const cursor = url.searchParams.get('cursor');
	const limit = url.searchParams.get('limit');

	const result = await listGenerationRuns({
		dimension: dimension ? parseInt(dimension) : undefined,
		ruleType: ruleType ?? undefined,
		sort: sort ?? 'newest',
		cursor: cursor ?? undefined,
		limit: limit ? parseInt(limit) : 20
	});

	return json(result);
};
