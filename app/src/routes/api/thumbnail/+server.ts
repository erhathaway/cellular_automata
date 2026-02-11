import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationRun, cellPopulation } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type');
	const id = url.searchParams.get('id');
	if (!id || !type) return error(400, 'Missing type or id');

	let thumbnail: string | null = null;

	if (type === 'generation_run') {
		const row = await db
			.select({ thumbnail: generationRun.thumbnail })
			.from(generationRun)
			.where(eq(generationRun.id, id))
			.limit(1);
		thumbnail = row[0]?.thumbnail ?? null;
	} else if (type === 'cell_population') {
		const row = await db
			.select({ thumbnail: cellPopulation.thumbnail })
			.from(cellPopulation)
			.where(eq(cellPopulation.id, id))
			.limit(1);
		thumbnail = row[0]?.thumbnail ?? null;
	} else {
		return error(400, 'Invalid type');
	}

	if (!thumbnail) return error(404, 'No thumbnail');

	// thumbnail is stored as a data URL: "data:image/png;base64,..."
	const match = thumbnail.match(/^data:([^;]+);base64,(.+)$/);
	if (!match) return error(500, 'Invalid thumbnail format');

	const contentType = match[1];
	const base64Data = match[2];
	const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

	return new Response(bytes, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
