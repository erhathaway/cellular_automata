import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteComment } from '$lib/server/db/queries/comments';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	try {
		await deleteComment(params.id, auth.userId);
		return json({ success: true });
	} catch (e: any) {
		if (e.message === 'Comment not found') return error(404, e.message);
		if (e.message === 'Not authorized') return error(403, e.message);
		throw e;
	}
};
