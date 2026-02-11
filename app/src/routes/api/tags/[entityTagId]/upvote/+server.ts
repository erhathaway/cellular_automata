import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upvoteTag, removeUpvote } from '$lib/server/db/queries/tags';

export const POST: RequestHandler = async ({ locals, params }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const added = await upvoteTag(params.entityTagId, auth.userId);
	if (!added) return error(409, 'Already upvoted');
	return json({ success: true }, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const removed = await removeUpvote(params.entityTagId, auth.userId);
	if (!removed) return error(404, 'Upvote not found');
	return json({ success: true });
};
