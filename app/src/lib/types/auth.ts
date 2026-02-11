export type AppRole = 'admin' | 'editor' | 'user';

export interface AppPublicMetadata {
	role?: AppRole;
}
