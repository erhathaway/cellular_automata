import { db } from '../index';
import { tag, entityTag, tagUpvote } from '../schema';
import { eq, and, like, sql, desc } from 'drizzle-orm';

export async function searchTags(query: string, limit = 10) {
	return db
		.select({ id: tag.id, name: tag.name })
		.from(tag)
		.where(like(tag.name, `%${query.toLowerCase()}%`))
		.limit(limit);
}

export async function findOrCreateTag(name: string): Promise<string> {
	const normalized = name.toLowerCase().trim();
	const existing = await db
		.select({ id: tag.id })
		.from(tag)
		.where(eq(tag.name, normalized))
		.get();

	if (existing) return existing.id;

	const result = await db
		.insert(tag)
		.values({ name: normalized })
		.returning({ id: tag.id });
	return result[0].id;
}

export async function applyTag(params: {
	tagName: string;
	generationRunId?: string;
	cellPopulationId?: string;
	userId: string;
}) {
	const tagId = await findOrCreateTag(params.tagName);

	// Check if entity_tag already exists
	const conditions = [eq(entityTag.tagId, tagId)];
	if (params.generationRunId) {
		conditions.push(eq(entityTag.generationRunId, params.generationRunId));
	}
	if (params.cellPopulationId) {
		conditions.push(eq(entityTag.cellPopulationId, params.cellPopulationId));
	}

	const existing = await db
		.select({ id: entityTag.id })
		.from(entityTag)
		.where(and(...conditions))
		.get();

	if (existing) {
		// Auto-upvote if it already exists
		const existingUpvote = await db
			.select({ id: tagUpvote.id })
			.from(tagUpvote)
			.where(
				and(eq(tagUpvote.entityTagId, existing.id), eq(tagUpvote.userId, params.userId))
			)
			.get();

		if (!existingUpvote) {
			await db.batch([
				db.insert(tagUpvote).values({ entityTagId: existing.id, userId: params.userId }),
				db
					.update(entityTag)
					.set({ upvoteCount: sql`${entityTag.upvoteCount} + 1` })
					.where(eq(entityTag.id, existing.id))
			]);
		}

		return existing;
	}

	// Create entity_tag + auto-upvote
	const result = await db
		.insert(entityTag)
		.values({
			tagId,
			generationRunId: params.generationRunId,
			cellPopulationId: params.cellPopulationId,
			createdByUserId: params.userId,
			upvoteCount: 1
		})
		.returning();

	await db.insert(tagUpvote).values({
		entityTagId: result[0].id,
		userId: params.userId
	});

	return result[0];
}

export async function removeEntityTag(entityTagId: string, userId: string) {
	return db
		.delete(entityTag)
		.where(and(eq(entityTag.id, entityTagId), eq(entityTag.createdByUserId, userId)));
}

export async function upvoteTag(entityTagId: string, userId: string) {
	const existing = await db
		.select({ id: tagUpvote.id })
		.from(tagUpvote)
		.where(and(eq(tagUpvote.entityTagId, entityTagId), eq(tagUpvote.userId, userId)))
		.get();

	if (existing) return false;

	await db.batch([
		db.insert(tagUpvote).values({ entityTagId, userId }),
		db
			.update(entityTag)
			.set({ upvoteCount: sql`${entityTag.upvoteCount} + 1` })
			.where(eq(entityTag.id, entityTagId))
	]);
	return true;
}

export async function removeUpvote(entityTagId: string, userId: string) {
	const existing = await db
		.select({ id: tagUpvote.id })
		.from(tagUpvote)
		.where(and(eq(tagUpvote.entityTagId, entityTagId), eq(tagUpvote.userId, userId)))
		.get();

	if (!existing) return false;

	await db.batch([
		db
			.delete(tagUpvote)
			.where(and(eq(tagUpvote.entityTagId, entityTagId), eq(tagUpvote.userId, userId))),
		db
			.update(entityTag)
			.set({ upvoteCount: sql`MAX(${entityTag.upvoteCount} - 1, 0)` })
			.where(eq(entityTag.id, entityTagId))
	]);
	return true;
}

export async function getTagsForEntity(params: {
	generationRunId?: string;
	cellPopulationId?: string;
}) {
	const conditions = [];
	if (params.generationRunId) {
		conditions.push(eq(entityTag.generationRunId, params.generationRunId));
	}
	if (params.cellPopulationId) {
		conditions.push(eq(entityTag.cellPopulationId, params.cellPopulationId));
	}
	if (conditions.length === 0) return [];

	return db
		.select({
			entityTagId: entityTag.id,
			tagId: tag.id,
			tagName: tag.name,
			upvoteCount: entityTag.upvoteCount,
			createdByUserId: entityTag.createdByUserId
		})
		.from(entityTag)
		.innerJoin(tag, eq(entityTag.tagId, tag.id))
		.where(and(...conditions))
		.orderBy(desc(entityTag.upvoteCount));
}
