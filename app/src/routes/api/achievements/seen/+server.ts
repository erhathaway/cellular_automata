import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { markAchievementsSeen } from '$lib/server/db/queries/achievements';

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { achievementIds } = body;

	if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
		return error(400, 'achievementIds must be a non-empty array');
	}

	await markAchievementsSeen(auth.userId, achievementIds);
	return json({ success: true });
};
