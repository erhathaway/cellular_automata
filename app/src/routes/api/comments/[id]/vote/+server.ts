import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { voteOnComment } from '$lib/server/db/queries/comments';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { value } = body;

	if (value !== 1 && value !== -1) {
		return error(400, 'Value must be 1 or -1');
	}

	const result = await voteOnComment(auth.userId, params.id, value);
	return json(result);
};
