import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, url, fetch }) => {
  const voterID = params.id;
  const electionID = url.searchParams.get('electionID') ?? '';

  if (!voterID) throw error(400, 'Missing voterID');
  if (!electionID) throw error(400, 'Missing electionID');

  const [voterRes, settingsRes, statusRes] = await Promise.all([
    fetch('http://dev.wilco.org/voterlookup/api/voter-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterID, electionID })
    }),
    fetch('http://dev.wilco.org/voterlookup/api/proxy-admin-settings'),
    fetch('http://dev.wilco.org/voterlookup/api/proxy-election-data')
  ]);

  if (!voterRes.ok) throw error(500, `Failed to load voter details: ${await voterRes.text()}`);
  if (!settingsRes.ok) throw error(500, `Failed to load settings: ${settingsRes.status}`);
  if (!statusRes.ok) throw error(500, `Failed to load election status: ${statusRes.status}`);

  const voterData = await voterRes.json();
  const rawSettings = await settingsRes.json();
  const rawStatus = await statusRes.json();

  let showSampleBallot = Boolean(rawSettings.ShowSampleBallot);

  if (electionID === '0') {  //Don't show sample ballot section when no election selected
    showSampleBallot = false;
  }

  let isPrimary = false;
  if (electionID && rawStatus[electionID]) {
    isPrimary = Boolean(rawStatus[electionID].IsPrimary);
  }

  // Normalize ballotStyle to the new object shape; keep legacy fallback
  const ballotStyle =
    voterData.ballotStyle && typeof voterData.ballotStyle === 'object'
      ? voterData.ballotStyle
      : {
          number: '',
          precinct: '',
          interactiveUrl:
            typeof voterData.ballotStyle === 'string' ? voterData.ballotStyle : ''
        };

  return {
    voterInfo: voterData.voterInfo,
    federalOfficials: voterData.federalOfficials,
    stateOfficials: voterData.stateOfficials,
    countyOfficials: voterData.countyOfficials,
    ballotStyle,        // <- has .number, .precinct, .interactiveUrl
    showSampleBallot,
    isPrimary,
    electionID
  };
};
