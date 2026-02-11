import { db } from '../index';
import { comment, commentVote, user } from '../schema';
import { eq, and, sql, desc, asc, inArray } from 'drizzle-orm';

export async function createComment(input: {
	userId: string;
	fingerprint: string;
	parentId?: string | null;
	body: string;
}) {
	// If replying, ensure parent is top-level (no reply-to-reply)
	if (input.parentId) {
		const parent = await db
			.select({ id: comment.id, parentId: comment.parentId })
			.from(comment)
			.where(eq(comment.id, input.parentId))
			.get();

		if (!parent) throw new Error('Parent comment not found');
		if (parent.parentId) throw new Error('Cannot reply to a reply');
	}

	const [inserted] = await db
		.insert(comment)
		.values({
			userId: input.userId,
			fingerprint: input.fingerprint,
			parentId: input.parentId ?? null,
			body: input.body
		})
		.returning();

	// Fetch with user info
	const result = await db
		.select({
			id: comment.id,
			userId: comment.userId,
			fingerprint: comment.fingerprint,
			parentId: comment.parentId,
			body: comment.body,
			score: comment.score,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(comment)
		.leftJoin(user, eq(comment.userId, user.id))
		.where(eq(comment.id, inserted.id))
		.get();

	return result!;
}

export async function getCommentsForFingerprint(
	fingerprint: string,
	sort: 'newest' | 'top' = 'newest'
) {
	const orderBy =
		sort === 'top'
			? [desc(comment.score), desc(comment.createdAt)]
			: [desc(comment.createdAt)];

	return db
		.select({
			id: comment.id,
			userId: comment.userId,
			fingerprint: comment.fingerprint,
			parentId: comment.parentId,
			body: comment.body,
			score: comment.score,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
			userName: sql<string>`COALESCE(${user.displayName}, ${user.name})`.as('user_name'),
			userImageUrl: user.imageUrl,
			userAvatarId: user.avatarId
		})
		.from(comment)
		.leftJoin(user, eq(comment.userId, user.id))
		.where(eq(comment.fingerprint, fingerprint))
		.orderBy(...orderBy);
}

export async function deleteComment(commentId: string, userId: string) {
	const existing = await db
		.select({ id: comment.id, userId: comment.userId })
		.from(comment)
		.where(eq(comment.id, commentId))
		.get();

	if (!existing) throw new Error('Comment not found');
	if (existing.userId !== userId) throw new Error('Not authorized');

	// Delete the comment and its replies (replies have parentId = this comment)
	await db.batch([
		db.delete(comment).where(eq(comment.parentId, commentId)),
		db.delete(comment).where(eq(comment.id, commentId))
	]);
}

export async function voteOnComment(
	userId: string,
	commentId: string,
	value: 1 | -1
) {
	const existing = await db
		.select({ id: commentVote.id, value: commentVote.value })
		.from(commentVote)
		.where(and(eq(commentVote.userId, userId), eq(commentVote.commentId, commentId)))
		.get();

	if (!existing) {
		// New vote: insert + adjust score
		await db.batch([
			db.insert(commentVote).values({ userId, commentId, value }),
			db
				.update(comment)
				.set({ score: sql`${comment.score} + ${value}` })
				.where(eq(comment.id, commentId))
		]);
		return { action: 'created' as const, value };
	}

	if (existing.value === value) {
		// Same vote again: toggle off (remove vote, reverse score)
		await db.batch([
			db.delete(commentVote).where(eq(commentVote.id, existing.id)),
			db
				.update(comment)
				.set({ score: sql`${comment.score} - ${value}` })
				.where(eq(comment.id, commentId))
		]);
		return { action: 'removed' as const, value: 0 };
	}

	// Different vote: update value, adjust score by delta (±2)
	const delta = value - existing.value; // e.g. 1 - (-1) = 2, or -1 - 1 = -2
	await db.batch([
		db
			.update(commentVote)
			.set({ value })
			.where(eq(commentVote.id, existing.id)),
		db
			.update(comment)
			.set({ score: sql`${comment.score} + ${delta}` })
			.where(eq(comment.id, commentId))
	]);
	return { action: 'changed' as const, value };
}

export async function getUserVotesForComments(userId: string, commentIds: string[]) {
	if (commentIds.length === 0) return new Map<string, number>();

	const votes = await db
		.select({ commentId: commentVote.commentId, value: commentVote.value })
		.from(commentVote)
		.where(and(eq(commentVote.userId, userId), inArray(commentVote.commentId, commentIds)));

	const map = new Map<string, number>();
	for (const v of votes) {
		map.set(v.commentId, v.value);
	}
	return map;
}

export async function getCommentCount(fingerprint: string): Promise<number> {
	const result = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(comment)
		.where(eq(comment.fingerprint, fingerprint))
		.get();
	return result?.count ?? 0;
}
