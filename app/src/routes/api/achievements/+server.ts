import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserAchievements } from '$lib/server/db/queries/achievements';
import { ACHIEVEMENTS } from '$lib/achievements/config';

export const GET: RequestHandler = async ({ locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const earned = await getUserAchievements(auth.userId);
	const earnedMap = new Map(earned.map((e) => [e.achievementId, e]));

	const achievements = ACHIEVEMENTS.map((def) => {
		const row = earnedMap.get(def.id);
		return {
			id: def.id,
			earned: !!row,
			earnedAt: row?.earnedAt?.toISOString() ?? null,
			seen: row?.seen ?? false,
		};
	});

	const unseenCount = earned.filter((e) => !e.seen).length;

	return json({ achievements, unseenCount });
};
