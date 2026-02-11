import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	createCellPopulation,
	listCellPopulations
} from '$lib/server/db/queries/cell-populations';
import { cellPopulationFingerprint } from '$lib/server/fingerprint';
import { checkAndRecordDiscovery } from '$lib/server/db/queries/discovery';

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const {
		generationRunId,
		dimension,
		viewer,
		ruleType,
		ruleDefinition,
		populationShape,
		cellStates,
		populationData,
		generationIndex,
		stepCount,
		stability,
		stablePeriod,
		title,
		description,
		thumbnail
	} = body;

	if (!dimension || !viewer || !ruleType || !ruleDefinition || !populationShape || !cellStates) {
		return error(400, 'Missing required fields');
	}

	const fingerprint = cellPopulationFingerprint(
		dimension,
		ruleType,
		ruleDefinition,
		stability ?? 'evolving',
		stablePeriod ?? null
	);

	const pop = await createCellPopulation({
		userId: auth.userId,
		generationRunId,
		dimension,
		viewer,
		ruleType,
		ruleDefinition,
		populationShape: typeof populationShape === 'string' ? populationShape : JSON.stringify(populationShape),
		cellStates: typeof cellStates === 'string' ? cellStates : JSON.stringify(cellStates),
		populationData: populationData ? Buffer.from(populationData, 'base64') : undefined,
		generationIndex,
		stepCount,
		stability,
		stablePeriod,
		title,
		description,
		thumbnail,
		fingerprint
	});

	const discoveryResult = await checkAndRecordDiscovery({
		fingerprint,
		entityType: 'cell_population',
		cellPopulationId: pop.id,
		userId: auth.userId
	});

	return json({ ...pop, discovery: discoveryResult }, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
	const dimension = url.searchParams.get('dimension');
	const stability = url.searchParams.get('stability');
	const sort = url.searchParams.get('sort') as 'newest' | 'most_liked' | null;
	const cursor = url.searchParams.get('cursor');
	const limit = url.searchParams.get('limit');

	const result = await listCellPopulations({
		dimension: dimension ? parseInt(dimension) : undefined,
		stability: stability ?? undefined,
		sort: sort ?? 'newest',
		cursor: cursor ?? undefined,
		limit: limit ? parseInt(limit) : 20
	});

	return json(result);
};
