import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getGenerationRun,
	deleteGenerationRun
} from '$lib/server/db/queries/generation-runs';
import { getTagsForEntity } from '$lib/server/db/queries/tags';
import { getDiscoveryByFingerprint } from '$lib/server/db/queries/discovery';

export const GET: RequestHandler = async ({ params }) => {
	const run = await getGenerationRun(params.id);
	if (!run) return error(404, 'Generation run not found');

	const tags = await getTagsForEntity({ generationRunId: params.id });
	const discovery = await getDiscoveryByFingerprint(run.fingerprint);

	return json({ ...run, tags, discovery });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const run = await getGenerationRun(params.id);
	if (!run) return error(404, 'Generation run not found');
	if (run.userId !== auth.userId) return error(403, 'Not authorized');

	await deleteGenerationRun(params.id, auth.userId);
	return json({ success: true });
};
