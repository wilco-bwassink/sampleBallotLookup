// hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // console.log('Hooks: Adding CORS headers to response:', event.request.method);
    // console.log('Hooks: Adding CORS headers to response:', event.url.pathname);

	if (event.request.method === 'OPTIONS') {
        // console.log('Hooks: Handling OPTIONS request')
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization'
			}
		});
	}

	const response = await resolve(event);

    // console.log('Hooks: Adding CORS headers to response')
	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	return response;
};
