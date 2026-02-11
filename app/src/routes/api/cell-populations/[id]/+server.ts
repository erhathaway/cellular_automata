import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getCellPopulation,
	deleteCellPopulation
} from '$lib/server/db/queries/cell-populations';
import { getTagsForEntity } from '$lib/server/db/queries/tags';
import { getDiscoveryByFingerprint } from '$lib/server/db/queries/discovery';

export const GET: RequestHandler = async ({ params }) => {
	const pop = await getCellPopulation(params.id);
	if (!pop) return error(404, 'Cell population not found');

	const tags = await getTagsForEntity({ cellPopulationId: params.id });
	const discovery = await getDiscoveryByFingerprint(pop.fingerprint);

	return json({ ...pop, tags, discovery });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const pop = await getCellPopulation(params.id);
	if (!pop) return error(404, 'Cell population not found');
	if (pop.userId !== auth.userId) return error(403, 'Not authorized');

	await deleteCellPopulation(params.id, auth.userId);
	return json({ success: true });
};
