import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { AVATARS } from '$lib/avatars';

const validAvatarIds = new Set(AVATARS.map((a) => a.id));

export const GET: RequestHandler = async ({ locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const profile = await db
		.select({
			displayName: user.displayName,
			avatarId: user.avatarId,
			email: user.email
		})
		.from(user)
		.where(eq(user.id, auth.userId))
		.get();

	if (!profile) return error(404, 'User not found');

	return json(profile);
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const updates: Record<string, string> = {};

	if (body.displayName !== undefined) {
		const name = String(body.displayName).trim();
		if (name.length < 1 || name.length > 30) {
			return error(400, 'Display name must be 1-30 characters');
		}
		updates.displayName = name;
	}

	if (body.avatarId !== undefined) {
		if (!validAvatarIds.has(body.avatarId)) {
			return error(400, 'Invalid avatar');
		}
		updates.avatarId = body.avatarId;
	}

	if (Object.keys(updates).length === 0) {
		return error(400, 'No valid fields to update');
	}

	await db.update(user).set(updates).where(eq(user.id, auth.userId));

	const profile = await db
		.select({
			displayName: user.displayName,
			avatarId: user.avatarId,
			email: user.email
		})
		.from(user)
		.where(eq(user.id, auth.userId))
		.get();

	return json(profile);
};
