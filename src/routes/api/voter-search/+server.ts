import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getVoterByNameAndDob, getVoterDetails } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	try {
		const body = await request.json();
		const { voterID, firstName, lastName, dob, electionID } = body;

		console.log('Incoming request:', { voterID, firstName, lastName, dob, electionID });

		if (voterID) {
			try {
				if (!electionID) {
					return json({ error: 'Missing electionID' }, { status: 400 });
				}

				const voterDetails = await getVoterDetails(voterID, electionID);
				console.log('Voter details result:', voterDetails);
				const recordsetList = Array.isArray(voterDetails)
					? voterDetails
					: Object.values(voterDetails ?? {});

				// Ensure the first recordset has at least one record
				const voter = recordsetList[0]?.[0];
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
				const message = err instanceof Error ? err.message : 'Failed to retrieve voter details';
				return json({ error: message }, { status: 500 });
			}
		}

		if (firstName && lastName && dob) {
			try {
				const voters = await getVoterByNameAndDob(firstName, lastName, dob);
				console.log('Voter result:', voters);
				return json({ voters });
			} catch (err) {
				console.error('Error fetching voters by name and DOB:', err);
				const message =
					err instanceof Error ? err.message : 'Failed to retrieve voters by name and date of birth';
				return json({ error: message }, { status: 500 });
			}
		}

		return json({ error: 'Invalid search input' }, { status: 400 });
	} catch (err) {
		console.error('Voter search error:', err instanceof Error ? err.stack : err);
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
