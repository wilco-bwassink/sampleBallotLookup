import type { PageLoad } from './$types';
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import pollingPlaces from '$lib/data/precinct_polling_places.json';
import type { ElectionMap, ElectionPayload } from '$lib/types/election';

function normalizeElectionData(payload: ElectionPayload): ElectionMap {
  if (Array.isArray(payload)) {
    return payload.reduce<ElectionMap>((acc, election) => {
      if (!election?.ElectionId) return acc;
      acc[election.ElectionId] = election;
      return acc;
    }, {});
  }

  return Object.entries(payload ?? {}).reduce<ElectionMap>((acc, [key, value]) => {
    acc[key] = {
      ElectionId: key,
      ElectionName: key,
      ElectionNameSpanish: value?.ElectionNameSpanish ?? null,
      IsActive: Boolean(value?.IsActive),
      IsPrimary: Boolean(value?.IsPrimary),
      Announcement: value?.Announcement ?? null,
      AnnouncementSpanish: value?.AnnouncementSpanish ?? null
    };
    return acc;
  }, {});
}

export const load: PageLoad = async ({ params, url, fetch }) => {
  const voterID = params.id;
  const electionID = url.searchParams.get('electionID') ?? '';
  const apiBase = `${base}/api`;

  if (!voterID) throw error(400, 'Missing voterID');
  if (!electionID) throw error(400, 'Missing electionID');

  const [settingsRes, statusRes] = await Promise.all([
    fetch(`${apiBase}/proxy-admin-settings`),
    fetch(`${apiBase}/proxy-election-data`)
  ]);

  if (!settingsRes.ok) throw error(500, `Failed to load settings: ${settingsRes.status}`);
  if (!statusRes.ok) throw error(500, `Failed to load election status: ${statusRes.status}`);

  const rawSettings = await settingsRes.json();
  const rawStatus = normalizeElectionData((await statusRes.json()) as ElectionPayload);

  let showSampleBallot = Boolean(rawSettings.ShowSampleBallot);

  if (electionID === '0') {  //Don't show sample ballot section when no election selected
    showSampleBallot = false;
  }

  let isPrimary = false;
  if (electionID && rawStatus[electionID]) {
    isPrimary = Boolean(rawStatus[electionID].IsPrimary);
  }

  const voterRes = await fetch(`${apiBase}/voter-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voterID, electionID, isPrimary, debug: import.meta.env.DEV })
  });

  if (!voterRes.ok) throw error(500, `Failed to load voter details: ${await voterRes.text()}`);

  const voterData = await voterRes.json();

  // Normalize ballotStyle to the new object shape; keep legacy fallback
  const ballotStyle =
    voterData.ballotStyle && typeof voterData.ballotStyle === 'object'
      ? voterData.ballotStyle
      : {
          style: '',
          BSD: '',
          BSR: '',
          precinct: '',
          interactiveSampleBallots: { dem: '', rep: '' },
          interactiveUrl: ''
        };
  // NEW: party-specific interactive links (primary elections)
  const demInteractiveHref: string =
    typeof ballotStyle === 'object'
      ? (ballotStyle?.interactiveSampleBallots?.dem ?? '')
      : '';

  const repInteractiveHref: string =
    typeof ballotStyle === 'object'
      ? (ballotStyle?.interactiveSampleBallots?.rep ?? '')
      : '';

  // define voterInfo once so you can safely reuse it
  const voterInfo = voterData.voterInfo;

  // precinct comes from the voter payload already fetched
  const precinctRaw = voterInfo?.PRECINCT ?? '';
  const precinctKey = String(precinctRaw).match(/\d+/)?.[0] ?? ''; // supports "116" or "P 116"

  const precinctPollingPlace =
    precinctKey && (pollingPlaces as Record<string, any>)[precinctKey]
      ? (pollingPlaces as Record<string, any>)[precinctKey]
      : null;

  return {
    voterInfo: voterData.voterInfo,
    federalOfficials: voterData.federalOfficials,
    stateOfficials: voterData.stateOfficials,
    countyOfficials: voterData.countyOfficials,
    ballotStyle,        // <- has .number, .precinct, .interactiveUrl
    demInteractiveHref,
    repInteractiveHref,
    debug: voterData._debug ?? null,
    showSampleBallot,
    isPrimary,
    electionID,
    precinctKey,
    precinctPollingPlace
  };
};
