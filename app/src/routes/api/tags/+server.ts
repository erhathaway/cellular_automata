import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTags, applyTag } from '$lib/server/db/queries/tags';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const limit = parseInt(url.searchParams.get('limit') ?? '10');

	const tags = await searchTags(q, Math.min(limit, 50));
	return json({ tags });
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { tagName, generationRunId, cellPopulationId } = body;

	if (!tagName) return error(400, 'tagName is required');
	if (!generationRunId && !cellPopulationId) {
		return error(400, 'Must provide generationRunId or cellPopulationId');
	}

	const result = await applyTag({
		tagName,
		generationRunId,
		cellPopulationId,
		userId: auth.userId
	});

	return json(result, { status: 201 });
};
