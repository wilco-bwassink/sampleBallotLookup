// routes/voterlookup/api/voter-details/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getVoterDetails } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { voterID, electionID, debug } = await request.json();

    if (!voterID || !electionID) {
      return json({ error: 'Missing voterID or electionID' }, { status: 400 });
    }

    const recordsets = await getVoterDetails(voterID, electionID);

    const voterInfo        = recordsets?.[0]?.[0] ?? null;
    const federalOfficials = recordsets?.[1] ?? [];
    const stateOfficials   = recordsets?.[2] ?? [];
    const countyOfficials  = recordsets?.[3] ?? [];

    // --- Ballot recordsets (robust detection) ---
    const firstRow = (rs: any) => (Array.isArray(rs) && rs.length ? rs[0] : null);

    const findRowByKey = (key: string) => {
      for (const rs of recordsets ?? []) {
        const r = firstRow(rs);
        if (r && typeof r === 'object' && key in r) return r;
      }
      return null;
    };

    // Links row = has DemBallot/RepBallot
    const ballotLinksRow =
      findRowByKey('DemBallot') ??
      findRowByKey('RepBallot') ??
      findRowByKey('DEMBALLOT') ??
      findRowByKey('REPBALLOT');

    // Style row = has BallotStyle (pipe-separated)
    const ballotStyleRow =
      findRowByKey('BallotStyle') ??
      findRowByKey('BALLOTSTYLE') ??
      findRowByKey('ballotStyle');

    // Pipe-separated style like "1428|1430"
    const combinedStyle = (ballotStyleRow?.BallotStyle ??
      ballotStyleRow?.BALLOTSTYLE ??
      ballotStyleRow?.ballotStyle ??
      '') as string;

    const [bsdRaw = '', bsrRaw = ''] = (combinedStyle || '').split('|', 2);
    const BSD = bsdRaw.trim();
    const BSR = bsrRaw.trim();

    // Interactive sample ballot URLs
    const demInteractiveUrl = (ballotLinksRow?.DemBallot ??
      ballotLinksRow?.DEMBALLOT ??
      ballotLinksRow?.DEM_BALLOT ??
      '') as string;

    const repInteractiveUrl = (ballotLinksRow?.RepBallot ??
      ballotLinksRow?.REPBALLOT ??
      ballotLinksRow?.REP_BALLOT ??
      '') as string;

    const precinct = (ballotLinksRow?.Precinct ??
      ballotLinksRow?.PRECINCT ??
      voterInfo?.PRECINCT ??
      voterInfo?.Precinct ??
      '') as string;

    const ballotStyle = {
      style: combinedStyle ?? '',
      BSD,
      BSR,
      precinct: precinct ?? '',
      interactiveSampleBallots: {
        dem: demInteractiveUrl ?? '',
        rep: repInteractiveUrl ?? ''
      },
      // legacy single-link fallback
      interactiveUrl: (demInteractiveUrl || repInteractiveUrl || '') as string
    };

    // --- debug info (fixed) ---
    const debugInfo = debug
      ? {
          electionIDEcho: electionID,
          voterIDEcho: voterID,
          recordsetMeta: (recordsets ?? []).map((rs: any, i: number) => ({
            i,
            rows: Array.isArray(rs) ? rs.length : 0,
            keys: firstRow(rs) ? Object.keys(firstRow(rs)) : []
          })),
          ballotStyleRow,
          ballotLinksRow
        }
      : undefined;

    return json({
      voterInfo,
      federalOfficials,
      stateOfficials,
      countyOfficials,
      ballotStyle,
      ...(debugInfo ? { _debug: debugInfo } : {})
    });
  } catch (err) {
    console.error('Error in /api/voter-details:', err);
    return json({ error: 'Failed to retrieve voter details' }, { status: 500 });
  }
};
