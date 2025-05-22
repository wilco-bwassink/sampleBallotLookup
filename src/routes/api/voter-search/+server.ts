import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getVoterDetails, getVoterByNameAndDob } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const { voterID, firstName, lastName, dob, electionID } = await request.json();

	if (voterID) {
		return json({ error: 'Voter ID search not yet implemented' }, { status: 501 });
	}

	if (firstName && lastName && dob) {
		const voters = await getVoterByNameAndDob(firstName, lastName, dob);
		return json({ voters });
	}

	return json({ error: 'Invalid search input' }, { status: 400 });
};
