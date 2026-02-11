import { error } from '@sveltejs/kit';
import { clerkClient } from 'svelte-clerk/server';
import type { AppRole, AppPublicMetadata } from '$lib/types/auth';

const ROLE_HIERARCHY: Record<AppRole, number> = {
	user: 0,
	editor: 1,
	admin: 2
};

export function getUserRole(publicMetadata: AppPublicMetadata): AppRole {
	return publicMetadata.role ?? 'user';
}

export function hasRole(userRole: AppRole, requiredRole: AppRole): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export async function requireRole(userId: string | null, requiredRole: AppRole): Promise<void> {
	if (!userId) {
		error(401, 'Authentication required');
	}

	const user = await clerkClient.users.getUser(userId);
	const role = getUserRole(user.publicMetadata as AppPublicMetadata);

	if (!hasRole(role, requiredRole)) {
		error(403, 'Insufficient permissions');
	}
}
