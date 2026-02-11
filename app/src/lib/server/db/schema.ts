import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(), // Clerk user ID (e.g. "user_2x...")
	email: text('email').notNull(),
	name: text('name'),
	imageUrl: text('image_url'),
	role: text('role', { enum: ['admin', 'editor', 'user'] })
		.notNull()
		.default('user'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
