import type { RequestHandler } from './$types';

const site = 'https://cellulose.studio';

const staticRoutes = ['/', '/mine', '/handbook', '/gallery', '/miners', '/miners/leaderboard'];

export const GET: RequestHandler = () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map((route) => `  <url><loc>${site}${route}</loc></url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml' }
	});
};
