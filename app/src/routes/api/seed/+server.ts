import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) return error(400, 'Missing id');

	const row = await db
		.select({ seedPopulation: generationRun.seedPopulation })
		.from(generationRun)
		.where(eq(generationRun.id, id))
		.limit(1);

	if (row.length === 0) return error(404, 'Not found');

	const seed = row[0].seedPopulation;
	return json({ seedPopulation: seed ? (seed as Buffer).toString('base64') : null });
};
