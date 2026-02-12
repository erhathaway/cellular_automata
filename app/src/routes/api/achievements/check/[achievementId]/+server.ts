import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkAchievement } from '$lib/server/achievements/checker';
import { ACHIEVEMENTS_BY_ID } from '$lib/achievements/config';

export const POST: RequestHandler = async ({ locals, params }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const { achievementId } = params;
	if (!ACHIEVEMENTS_BY_ID.has(achievementId)) {
		return error(400, 'Unknown achievement');
	}

	const result = await checkAchievement(auth.userId, achievementId);
	return json(result);
};
