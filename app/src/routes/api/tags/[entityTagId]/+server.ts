import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeEntityTag } from '$lib/server/db/queries/tags';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	await removeEntityTag(params.entityTagId, auth.userId);
	return json({ success: true });
};
