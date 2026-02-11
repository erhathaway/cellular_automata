import { buildClerkProps } from 'svelte-clerk/server';
import { syncUser } from '$lib/server/db/sync';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = locals.auth();
	if (auth.userId) {
		await syncUser(auth.userId);
	}
	return { ...buildClerkProps(auth) };
};
