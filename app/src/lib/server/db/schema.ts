import { integer, sqliteTable, text, blob, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// --- User ---

export const user = sqliteTable('user', {
	id: text('id').primaryKey(), // Clerk user ID (e.g. "user_2x...")
	email: text('email').notNull(),
	name: text('name'),
	imageUrl: text('image_url'),
	displayName: text('display_name'),
	avatarId: text('avatar_id'),
	minerConfig: text('miner_config'),
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

// --- Generation Run ---

export const generationRun = sqliteTable(
	'generation_run',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		dimension: integer('dimension').notNull(),
		viewer: integer('viewer').notNull(),
		ruleType: text('rule_type', { enum: ['wolfram', 'conway'] }).notNull(),
		ruleDefinition: text('rule_definition').notNull(),
		neighborhoodRadius: integer('neighborhood_radius').notNull().default(1),
		latticeType: text('lattice_type'),
		populationShape: text('population_shape').notNull(), // JSON e.g. '{"x":200,"y":200}'
		cellStates: text('cell_states').notNull(), // JSON array of {number, color}
		seedPopulation: blob('seed_population', { mode: 'buffer' }),
		generationIndex: integer('generation_index'),
		title: text('title').notNull().default(''),
		description: text('description').notNull().default(''),
		thumbnail: text('thumbnail'), // base64 PNG from canvas
		fingerprint: text('fingerprint').notNull(),
		likeCount: integer('like_count').notNull().default(0),
		bookmarkCount: integer('bookmark_count').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		index('generation_run_user_id_idx').on(table.userId),
		index('generation_run_dimension_idx').on(table.dimension),
		index('generation_run_fingerprint_idx').on(table.fingerprint),
		index('generation_run_like_count_idx').on(table.likeCount),
		index('generation_run_created_at_idx').on(table.createdAt)
	]
);

// --- Cell Population ---

export const cellPopulation = sqliteTable(
	'cell_population',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		generationRunId: text('generation_run_id').references(() => generationRun.id, {
			onDelete: 'set null'
		}),
		dimension: integer('dimension').notNull(),
		viewer: integer('viewer').notNull(),
		ruleType: text('rule_type', { enum: ['wolfram', 'conway'] }).notNull(),
		ruleDefinition: text('rule_definition').notNull(),
		neighborhoodRadius: integer('neighborhood_radius').notNull().default(1),
		latticeType: text('lattice_type'),
		populationShape: text('population_shape').notNull(),
		cellStates: text('cell_states').notNull(),
		populationData: blob('population_data', { mode: 'buffer' }),
		generationIndex: integer('generation_index'),
		stepCount: integer('step_count').notNull().default(1),
		stability: text('stability', {
			enum: ['evolving', 'quasi_stable', 'fixed']
		})
			.notNull()
			.default('evolving'),
		stablePeriod: integer('stable_period'),
		title: text('title').notNull().default(''),
		description: text('description').notNull().default(''),
		thumbnail: text('thumbnail'),
		fingerprint: text('fingerprint').notNull(),
		likeCount: integer('like_count').notNull().default(0),
		bookmarkCount: integer('bookmark_count').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		index('cell_population_user_id_idx').on(table.userId),
		index('cell_population_dimension_idx').on(table.dimension),
		index('cell_population_fingerprint_idx').on(table.fingerprint),
		index('cell_population_like_count_idx').on(table.likeCount),
		index('cell_population_created_at_idx').on(table.createdAt),
		index('cell_population_generation_run_id_idx').on(table.generationRunId),
		index('cell_population_stability_idx').on(table.stability)
	]
);

// --- Like (polymorphic) ---

export const like = sqliteTable(
	'like',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		generationRunId: text('generation_run_id').references(() => generationRun.id, {
			onDelete: 'cascade'
		}),
		cellPopulationId: text('cell_population_id').references(() => cellPopulation.id, {
			onDelete: 'cascade'
		}),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('like_user_run_idx').on(table.userId, table.generationRunId),
		uniqueIndex('like_user_pop_idx').on(table.userId, table.cellPopulationId)
	]
);

// --- Bookmark (polymorphic, same pattern as like) ---

export const bookmark = sqliteTable(
	'bookmark',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		generationRunId: text('generation_run_id').references(() => generationRun.id, {
			onDelete: 'cascade'
		}),
		cellPopulationId: text('cell_population_id').references(() => cellPopulation.id, {
			onDelete: 'cascade'
		}),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('bookmark_user_run_idx').on(table.userId, table.generationRunId),
		uniqueIndex('bookmark_user_pop_idx').on(table.userId, table.cellPopulationId)
	]
);

// --- Tag ---

export const tag = sqliteTable('tag', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- Entity Tag ---

export const entityTag = sqliteTable(
	'entity_tag',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		tagId: text('tag_id')
			.notNull()
			.references(() => tag.id, { onDelete: 'cascade' }),
		generationRunId: text('generation_run_id').references(() => generationRun.id, {
			onDelete: 'cascade'
		}),
		cellPopulationId: text('cell_population_id').references(() => cellPopulation.id, {
			onDelete: 'cascade'
		}),
		createdByUserId: text('created_by_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		upvoteCount: integer('upvote_count').notNull().default(1),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('entity_tag_tag_run_idx').on(table.tagId, table.generationRunId),
		uniqueIndex('entity_tag_tag_pop_idx').on(table.tagId, table.cellPopulationId)
	]
);

// --- Tag Upvote ---

export const tagUpvote = sqliteTable(
	'tag_upvote',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		entityTagId: text('entity_tag_id')
			.notNull()
			.references(() => entityTag.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [uniqueIndex('tag_upvote_entity_tag_user_idx').on(table.entityTagId, table.userId)]
);

// --- Comment (self-referencing for 1-level replies) ---

export const comment = sqliteTable(
	'comment',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		fingerprint: text('fingerprint').notNull(),
		parentId: text('parent_id'),
		body: text('body').notNull(),
		score: integer('score').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		index('comment_fingerprint_idx').on(table.fingerprint),
		index('comment_fingerprint_created_at_idx').on(table.fingerprint, table.createdAt),
		index('comment_fingerprint_score_idx').on(table.fingerprint, table.score),
		index('comment_parent_id_idx').on(table.parentId),
		index('comment_user_id_idx').on(table.userId)
	]
);

// --- Comment Vote ---

export const commentVote = sqliteTable(
	'comment_vote',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		commentId: text('comment_id')
			.notNull()
			.references(() => comment.id, { onDelete: 'cascade' }),
		value: integer('value').notNull(), // +1 or -1
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('comment_vote_user_comment_idx').on(table.userId, table.commentId)
	]
);

// --- Discovery ---

export const discovery = sqliteTable(
	'discovery',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		fingerprint: text('fingerprint').notNull().unique(),
		entityType: text('entity_type', {
			enum: ['generation_run', 'cell_population']
		}).notNull(),
		generationRunId: text('generation_run_id').references(() => generationRun.id, {
			onDelete: 'set null'
		}),
		cellPopulationId: text('cell_population_id').references(() => cellPopulation.id, {
			onDelete: 'set null'
		}),
		discoveredByUserId: text('discovered_by_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		discoveredAt: integer('discovered_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('discovery_fingerprint_idx').on(table.fingerprint)]
);
