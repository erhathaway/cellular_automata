import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upsertGenerationView } from '$lib/server/db/queries/achievements';

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { latticeType, ruleDefinition, dimension, neighborhoodRadius } = body;

	if (!ruleDefinition || dimension == null) {
		return error(400, 'ruleDefinition and dimension are required');
	}

	await upsertGenerationView(
		auth.userId,
		latticeType ?? null,
		ruleDefinition,
		dimension,
		neighborhoodRadius ?? 1
	);

	return json({ success: true });
};
