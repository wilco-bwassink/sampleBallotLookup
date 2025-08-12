import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
    const voterID = params.id;
    const electionID = url.searchParams.get('electionID') ?? '';

    console.log('voterID', voterID);
    console.log('electionID', electionID);

    const [voterRes, settingsRes, statusRes] = await Promise.all([
        fetch('http://dev.wilco.org/voterlookup/api/voter-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ voterID, electionID })
        }),
        fetch('http://dev.wilco.org/voterlookup/api/proxy-admin-settings'),
        fetch('http://dev.wilco.org/voterlookup/api/proxy-election-data')
    ]);

if (!voterRes.ok) {
    console.log('Failed to load voter details:', await voterRes.text());
    throw new Error('Failed to load voter details');
}

if (!settingsRes.ok) {
    console.log('Failed to load settings', settingsRes.status);
    throw new Error (`Failed to load settings: ${settingsRes.status}`);
}
if (!statusRes.ok) {
    console.log('Failed to load election status', statusRes.status);
    throw new Error (`Failed to load election status: ${statusRes.status}`);
}

const voterData = await voterRes.json();
const rawSettings = await settingsRes.json();
const rawStatus = await statusRes.json();

// console.log('voterData', voterData)
// console.log('rawSettings', rawSettings)
// console.log('rawStatus', rawStatus)

const showSampleBallot = Boolean(rawSettings.ShowSampleBallot);
// console.log('showSampleBallot:', showSampleBallot)

let isPrimary = false;
if (electionID && rawStatus[electionID]) {
    const specificElection = rawStatus[electionID];
    isPrimary = Boolean(specificElection.IsPrimary);
    // console.log('specificElection:', specificElection);
    // console.log('isPrimary:', isPrimary);
} else {
    console.log('Election not found or no electionID provided');
    console.log('Available elections:', Object.keys(rawStatus));
}

return {
    voterInfo: voterData.voterInfo,
    federalOfficials: voterData.federalOfficials,
    stateOfficials: voterData.stateOfficials,
    countyOfficials: voterData.countyOfficials,
    ballotStyle: voterData.ballotStyle,
    showSampleBallot,
    isPrimary,
    electionID
};
};