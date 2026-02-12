import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const name = url.searchParams.get('name')?.trim();
	if (!name || name.length < 1 || name.length > 30) {
		return json({ available: false });
	}

	// Check if anyone ELSE has this name (exclude current user)
	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(and(eq(user.displayName, name), ne(user.id, auth.userId)))
		.get();

	return json({ available: !existing });
};
