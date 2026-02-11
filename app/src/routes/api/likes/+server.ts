import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	likeGenerationRun,
	unlikeGenerationRun,
	likeCellPopulation,
	unlikeCellPopulation
} from '$lib/server/db/queries/likes';

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { generationRunId, cellPopulationId } = body;

	if (!generationRunId && !cellPopulationId) {
		return error(400, 'Must provide generationRunId or cellPopulationId');
	}

	let added: boolean;
	if (generationRunId) {
		added = await likeGenerationRun(auth.userId, generationRunId);
	} else {
		added = await likeCellPopulation(auth.userId, cellPopulationId);
	}

	if (!added) return error(409, 'Already liked');

	return json({ success: true }, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { generationRunId, cellPopulationId } = body;

	if (!generationRunId && !cellPopulationId) {
		return error(400, 'Must provide generationRunId or cellPopulationId');
	}

	let removed: boolean;
	if (generationRunId) {
		removed = await unlikeGenerationRun(auth.userId, generationRunId);
	} else {
		removed = await unlikeCellPopulation(auth.userId, cellPopulationId);
	}

	if (!removed) return error(404, 'Like not found');
	return json({ success: true });
};
