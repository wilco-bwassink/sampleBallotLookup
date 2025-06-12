import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit';
import { getVoterDetails } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { voterID, electionID } = await request.json();

        if (!voterID) {
            return json({ error: 'No Voter Found' }, { status: 404 });
        }
        
        const recordsets = await getVoterDetails(voterID, electionID);

        const voterInfo = recordsets[0] && recordsets [0][0] ? recordsets[0][0] : null;

        const federalOfficials = recordsets[1] || [];
        const stateOfficials = recordsets[2] || [];
        const countyOfficials = recordsets[3] || [];
        const ballotStyle = recordsets[4] && recordsets[4][0]?.BallotStyle || '';

        return json({ voterInfo, federalOfficials, stateOfficials, countyOfficials, ballotStyle })
    } catch (err) {
        console.error('Error in /api/voter-details:', err);
        return json({ error: 'Failed to retriee voter details' }, { status: 500 });
    }
};