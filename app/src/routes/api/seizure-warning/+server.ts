import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { seizureWarningResponse } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
	const auth = locals.auth();
	const body = await request.json();
	const { agreed, screenWidth, screenHeight, language, referrer } = body;

	if (typeof agreed !== 'boolean') {
		return json({ error: 'agreed is required' }, { status: 400 });
	}

	await db.insert(seizureWarningResponse).values({
		userId: auth.userId ?? null,
		agreed,
		ipAddress: getClientAddress(),
		userAgent: request.headers.get('user-agent') || '',
		language: language || '',
		screenWidth: screenWidth ?? null,
		screenHeight: screenHeight ?? null,
		referrer: referrer ?? null
	});

	return json({ success: true });
};
