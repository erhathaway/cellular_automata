import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import { prefixes, nouns, suffixes } from '$lib/server/name-parts';

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(): string {
	const prefix = pick(prefixes);
	const noun = pick(nouns);
	const suffix = pick(suffixes);
	const name = suffix ? `${prefix}${noun}${suffix}` : `${prefix}${noun}`;
	return name.length <= 30 ? name : `${prefix}${noun}`;
}

export const GET: RequestHandler = async ({ locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	// Generate a batch of candidate names
	const candidates = new Set<string>();
	while (candidates.size < 20) {
		const name = generateName();
		if (name.length >= 3 && name.length <= 30) {
			candidates.add(name);
		}
	}

	const candidateList = [...candidates];

	// Check which are already taken
	const taken = await db
		.select({ displayName: user.displayName })
		.from(user)
		.where(inArray(user.displayName, candidateList));

	const takenSet = new Set(taken.map((r) => r.displayName));
	const available = candidateList.filter((n) => !takenSet.has(n));

	if (available.length === 0) {
		// Extremely unlikely, but just generate more
		return json({ name: generateName() + Math.floor(Math.random() * 999) });
	}

	return json({ name: available[0] });
};
