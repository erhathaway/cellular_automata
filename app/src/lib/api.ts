export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
	const opts: RequestInit = {
		method,
		headers: { 'Content-Type': 'application/json' }
	};
	if (body !== undefined) {
		opts.body = JSON.stringify(body);
	}

	const res = await fetch(path, opts);

	if (!res.ok) {
		const text = await res.text();
		let message: string;
		try {
			message = JSON.parse(text).message ?? text;
		} catch {
			message = text;
		}
		throw new Error(`${res.status}: ${message}`);
	}

	return res.json();
}
