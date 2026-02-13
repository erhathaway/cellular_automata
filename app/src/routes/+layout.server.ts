import { buildClerkProps } from 'svelte-clerk/server';
import { syncUser } from '$lib/server/db/sync';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = locals.auth();
	if (auth.userId) {
		await syncUser(auth.userId);

		const profile = await db
			.select({
				displayName: user.displayName,
				avatarId: user.avatarId,
				minerConfig: user.minerConfig,
				email: user.email
			})
			.from(user)
			.where(eq(user.id, auth.userId))
			.get();

		return { ...buildClerkProps(auth), userProfile: profile ?? null, userId: auth.userId };
	}
	return { ...buildClerkProps(auth), userProfile: null, userId: null };
};
