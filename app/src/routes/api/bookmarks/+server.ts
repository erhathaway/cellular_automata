import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	bookmarkGenerationRun,
	unbookmarkGenerationRun,
	bookmarkCellPopulation,
	unbookmarkCellPopulation,
	listUserBookmarks
} from '$lib/server/db/queries/bookmarks';

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { generationRunId, cellPopulationId } = body;

	if (!generationRunId && !cellPopulationId) {
		return error(400, 'Must provide generationRunId or cellPopulationId');
	}

	try {
		if (generationRunId) {
			await bookmarkGenerationRun(auth.userId, generationRunId);
		} else {
			await bookmarkCellPopulation(auth.userId, cellPopulationId);
		}
	} catch (e: any) {
		if (e.message?.includes('UNIQUE constraint')) {
			return error(409, 'Already bookmarked');
		}
		throw e;
	}

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
		removed = await unbookmarkGenerationRun(auth.userId, generationRunId);
	} else {
		removed = await unbookmarkCellPopulation(auth.userId, cellPopulationId);
	}

	if (!removed) return error(404, 'Bookmark not found');
	return json({ success: true });
};

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const type = url.searchParams.get('type') as
		| 'generation_run'
		| 'cell_population'
		| null;

	const items = await listUserBookmarks(auth.userId, type ?? undefined);
	return json({ items });
};
