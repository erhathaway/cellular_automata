import { db } from './index';
import { user } from './schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from 'svelte-clerk/server';

type UserRole = 'admin' | 'editor' | 'user';

const VALID_ROLES = new Set<UserRole>(['admin', 'editor', 'user']);

function parseRole(raw: unknown): UserRole {
	if (typeof raw === 'string' && VALID_ROLES.has(raw as UserRole)) return raw as UserRole;
	return 'user';
}

export async function syncUser(clerkUserId: string) {
	let clerkUser;
	try {
		clerkUser = await clerkClient.users.getUser(clerkUserId);
	} catch {
		// User may not exist in Clerk yet (e.g. during sign-up flow)
		return;
	}
	const email =
		clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
			?.emailAddress ?? '';
	const name =
		[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
	const role = parseRole((clerkUser.publicMetadata as { role?: string }).role);

	const values = {
		id: clerkUserId,
		email,
		name,
		imageUrl: clerkUser.imageUrl,
		role,
		updatedAt: new Date()
	};

	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, clerkUserId))
		.get();

	if (existing) {
		await db.update(user).set(values).where(eq(user.id, clerkUserId));
	} else {
		await db.insert(user).values({ ...values, createdAt: new Date() });
	}
}
