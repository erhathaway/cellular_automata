import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
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

	const fingerprint = generationRunFingerprint(dimension, ruleType, ruleDefinition);

	const run = await createGenerationRun({
		userId: auth.userId,
		dimension,
		viewer,
		ruleType,
		ruleDefinition,
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
