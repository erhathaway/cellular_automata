import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generationRunFingerprint } from '$lib/server/fingerprint';
import {
	createComment,
	getCommentsForFingerprint,
	getUserVotesForComments
} from '$lib/server/db/queries/comments';

export const GET: RequestHandler = async ({ url, locals }) => {
	const dimension = parseInt(url.searchParams.get('d') ?? '');
	const ruleType = url.searchParams.get('rt') ?? '';
	const ruleDefinition = url.searchParams.get('rd') ?? '';
	const neighborhoodRadius = parseInt(url.searchParams.get('nr') ?? '1');
	const sort = (url.searchParams.get('sort') as 'newest' | 'top') ?? 'newest';

	if (!dimension || !ruleType || !ruleDefinition) {
		return json({ comments: [], userVotes: {}, fingerprint: '' });
	}

	const fingerprint = generationRunFingerprint(dimension, ruleType, ruleDefinition, neighborhoodRadius);
	const comments = await getCommentsForFingerprint(fingerprint, sort);

	const auth = locals.auth();
	let userVotes: Record<string, number> = {};

	if (auth.userId && comments.length > 0) {
		const commentIds = comments.map((c) => c.id);
		const votesMap = await getUserVotesForComments(auth.userId, commentIds);
		userVotes = Object.fromEntries(votesMap);
	}

	return json({ comments, userVotes, fingerprint, currentUserId: auth.userId ?? null });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const auth = locals.auth();
	if (!auth.userId) return error(401, 'Authentication required');

	const body = await request.json();
	const { dimension, ruleType, ruleDefinition, neighborhoodRadius, parentId, text } = body;

	if (!dimension || !ruleType || !ruleDefinition) {
		return error(400, 'Missing rule parameters');
	}

	if (!text || typeof text !== 'string') {
		return error(400, 'Comment text is required');
	}

	const trimmed = text.trim();
	if (trimmed.length === 0) return error(400, 'Comment text is required');
	if (trimmed.length > 2000) return error(400, 'Comment too long (max 2000 characters)');

	const fingerprint = generationRunFingerprint(
		dimension,
		ruleType,
		ruleDefinition,
		neighborhoodRadius ?? 1
	);

	try {
		const newComment = await createComment({
			userId: auth.userId,
			fingerprint,
			parentId: parentId ?? null,
			body: trimmed
		});
		return json(newComment, { status: 201 });
	} catch (e: any) {
		if (e.message === 'Parent comment not found') return error(404, e.message);
		if (e.message === 'Cannot reply to a reply') return error(400, e.message);
		throw e;
	}
};
