import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
    const voterID = params.id;
    const electionID = url.searchParams.get('electionID') ?? '';

    const res = await fetch('/api/voter-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterID, electionID })
    });

    if (!res.ok) {
        console.error('Failed to load voter details:', await res.text())
        throw new Error('Failed to load voter details');
    }

    const data = await res.json();
    console.log('Loaded voter data:', data)
    return {
        voterInfo: data.voterInfo,
        electedOfficials: data.electedOfficials,
        ballotStyle: data.ballotStyle
    };
};