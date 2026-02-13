import posthog from 'posthog-js';

const POSTHOG_API_KEY = 'phc_qizl68Mq6SadcmoO9LEfeqP3Bs6JRVZWvZrHAXHBsu3';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let initialized = false;

export function initPosthog() {
	if (initialized || typeof window === 'undefined') return;
	posthog.init(POSTHOG_API_KEY, {
		api_host: POSTHOG_HOST,
		capture_pageview: false
	});
	initialized = true;
}

export { posthog };
