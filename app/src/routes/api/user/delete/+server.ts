import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from 'svelte-clerk/server';

export const DELETE: RequestHandler = async ({ locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	// Delete from DB (CASCADE handles all related data)
	await db.delete(user).where(eq(user.id, auth.userId));

	// Delete from Clerk
	await clerkClient.users.deleteUser(auth.userId);

	return json({ ok: true });
};
