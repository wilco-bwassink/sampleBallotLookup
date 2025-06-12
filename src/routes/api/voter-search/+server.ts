import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getVoterByNameAndDob, getVoterDetails } from '$lib/server/db';

export const POST: RequestHandler = async ({ request } : { request: Request }) => {
	try {
		// const { voterID, firstName, lastName, dob, electionID } = await request.json();
		const raw = await request.text();
console.log('Raw request body:', raw);

let body;
try {
	body = JSON.parse(raw);
} catch (e) {
	console.error('Invalid JSON:', e);
	return json({ error: 'Invalid JSON' }, { status: 400 });
}

const { voterID, firstName, lastName, dob, electionID } = body;

		console.log('Incoming request:', { voterID, firstName, lastName, dob, electionID });

				if (voterID) {
					try {
						const voterDetails = await getVoterDetails(voterID);
						console.log('Voter details result:', voterDetails);

						// Ensure the first recordset has at least one record
						const voter = voterDetails?.[0]?.[0];
						if (!voter) {
							return json({ error: 'Voter not found' }, { status: 404 });
						}

						// Match structure expected by frontend
						const voters = [
							{
								IDNUMBER: voter.STATEVUID,
								NAME: voter.NAME,
								ADDRESS: voter.ADDRESS
							}
						];

						return json({ voters });
					} catch (err) {
						console.error('Error fetching voter details by Voter ID:', err);
						return json({ error: 'Failed to retrieve voter Details' }, { status: 500 });
					}
				}

		if (firstName && lastName && dob) {
			const voters = await getVoterByNameAndDob(firstName, lastName, dob);
			console.log('Voter result:', voters);
			return json({ voters });
		}

		return json({ error: 'Invalid search input' }, { status: 400 });

	} catch (err) {
		console.error('❌ Voter search error:', err instanceof Error ? err.stack : err);
		return json({ message: 'Internal Error' }, { status: 500 });
	}
};
