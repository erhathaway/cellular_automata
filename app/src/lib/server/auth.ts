import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { AppRole } from '$lib/types/auth';

const ROLE_HIERARCHY: Record<AppRole, number> = {
	user: 0,
	editor: 1,
	admin: 2
};

export function getUserRole(role: string | undefined): AppRole {
	if (role === 'admin' || role === 'editor') return role;
	return 'user';
}

export function hasRole(userRole: AppRole, requiredRole: AppRole): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export async function requireRole(userId: string | null, requiredRole: AppRole): Promise<void> {
	if (!userId) error(401, 'Authentication required');

	const row = await db
		.select({ role: user.role })
		.from(user)
		.where(eq(user.id, userId))
		.get();

	if (!row) error(401, 'User not found');
	if (!hasRole(getUserRole(row.role), requiredRole)) error(403, 'Insufficient permissions');
}
