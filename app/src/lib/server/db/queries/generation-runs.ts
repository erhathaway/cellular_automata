import { db } from '../index';
import { generationRun, user } from '../schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

export interface CreateGenerationRunInput {
	userId: string;
	dimension: number;
	viewer: number;
	ruleType: 'wolfram' | 'conway';
	ruleDefinition: string;
	neighborhoodRadius?: number;
	populationShape: string;
	cellStates: string;
	seedPopulation?: Buffer;
	generationIndex?: number;
	title?: string;
	description?: string;
	thumbnail?: string;
	fingerprint: string;
}

export async function createGenerationRun(input: CreateGenerationRunInput) {
	const result = await db
		.insert(generationRun)
		.values({
			userId: input.userId,
			dimension: input.dimension,
			viewer: input.viewer,
			ruleType: input.ruleType,
			ruleDefinition: input.ruleDefinition,
			neighborhoodRadius: input.neighborhoodRadius ?? 1,
			populationShape: input.populationShape,
			cellStates: input.cellStates,
			seedPopulation: input.seedPopulation,
			generationIndex: input.generationIndex,
			title: input.title ?? '',
			description: input.description ?? '',
			thumbnail: input.thumbnail,
			fingerprint: input.fingerprint
		})
		.returning();
	return result[0];
}

export interface ListGenerationRunsParams {
	dimension?: number;
	ruleType?: string;
	sort?: 'newest' | 'most_liked';
	cursor?: string;
	limit?: number;
}

export async function listGenerationRuns(params: ListGenerationRunsParams) {
	const limit = Math.min(params.limit ?? 20, 50);
	const conditions = [];

	if (params.dimension) {
		conditions.push(eq(generationRun.dimension, params.dimension));
	}
	if (params.ruleType) {
		conditions.push(eq(generationRun.ruleType, params.ruleType as 'wolfram' | 'conway'));
	}

	// Cursor-based pagination: cursor is createdAt timestamp or likeCount
	if (params.cursor) {
		const cursorDate = new Date(parseInt(params.cursor));
		if (params.sort === 'most_liked') {
			conditions.push(sql`${generationRun.likeCount} <= ${parseInt(params.cursor)}`);
		} else {
			conditions.push(sql`${generationRun.createdAt} < ${cursorDate}`);
		}
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;
	const orderBy =
		params.sort === 'most_liked'
			? [desc(generationRun.likeCount), desc(generationRun.createdAt)]
			: [desc(generationRun.createdAt)];

	const rows = await db
		.select({
			id: generationRun.id,
			userId: generationRun.userId,
			dimension: generationRun.dimension,
			viewer: generationRun.viewer,
			ruleType: generationRun.ruleType,
			ruleDefinition: generationRun.ruleDefinition,
			neighborhoodRadius: generationRun.neighborhoodRadius,
			populationShape: generationRun.populationShape,
			cellStates: generationRun.cellStates,
			generationIndex: generationRun.generationIndex,
			title: generationRun.title,
			description: generationRun.description,
			thumbnail: generationRun.thumbnail,
			fingerprint: generationRun.fingerprint,
			likeCount: generationRun.likeCount,
			bookmarkCount: generationRun.bookmarkCount,
			createdAt: generationRun.createdAt,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(generationRun)
		.leftJoin(user, eq(generationRun.userId, user.id))
		.where(where)
		.orderBy(...orderBy)
		.limit(limit + 1);

	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const nextCursor = hasMore
		? params.sort === 'most_liked'
			? String(items[items.length - 1].likeCount)
			: String(items[items.length - 1].createdAt?.getTime())
		: null;

	return { items, nextCursor };
}

export async function getGenerationRun(id: string) {
	const rows = await db
		.select({
			id: generationRun.id,
			userId: generationRun.userId,
			dimension: generationRun.dimension,
			viewer: generationRun.viewer,
			ruleType: generationRun.ruleType,
			ruleDefinition: generationRun.ruleDefinition,
			neighborhoodRadius: generationRun.neighborhoodRadius,
			populationShape: generationRun.populationShape,
			cellStates: generationRun.cellStates,
			seedPopulation: generationRun.seedPopulation,
			generationIndex: generationRun.generationIndex,
			title: generationRun.title,
			description: generationRun.description,
			thumbnail: generationRun.thumbnail,
			fingerprint: generationRun.fingerprint,
			likeCount: generationRun.likeCount,
			bookmarkCount: generationRun.bookmarkCount,
			createdAt: generationRun.createdAt,
			updatedAt: generationRun.updatedAt,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(generationRun)
		.leftJoin(user, eq(generationRun.userId, user.id))
		.where(eq(generationRun.id, id));

	return rows[0] ?? null;
}

export async function deleteGenerationRun(id: string, userId: string) {
	return db
		.delete(generationRun)
		.where(and(eq(generationRun.id, id), eq(generationRun.userId, userId)));
}
