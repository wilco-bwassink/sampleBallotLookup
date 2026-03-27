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
    const recordsetList = Array.isArray(recordsets) ? recordsets : Object.values(recordsets ?? {});

    const voterInfo        = recordsetList[0]?.[0] ?? null;
    const federalOfficials = recordsetList[1] ?? [];
    const stateOfficials   = recordsetList[2] ?? [];
    const countyOfficials  = recordsetList[3] ?? [];

    // --- Ballot recordsets (support both general and primary elections) ---
    const firstRow = (rs: any) => (Array.isArray(rs) && rs.length ? rs[0] : null);

    const findRowByKeys = (keys: string[]) => {
      for (const rs of recordsetList) {
        const row = firstRow(rs);
        if (!row || typeof row !== 'object') continue;
        if (keys.some((key) => key in row)) return row;
      }
      return null;
    };

    const ballotLinksRow = findRowByKeys(['DemBallot', 'RepBallot', 'DEMBALLOT', 'REPBALLOT']);
    const primaryStyleRow = findRowByKeys(['BallotStyle', 'BALLOTSTYLE', 'ballotStyle']);
    const generalBallotRow = findRowByKeys([
      'InteractiveBallotUrl',
      'interactiveBallotUrl',
      'interactiveUrl',
      'QA_LINK',
      'Prod_Link',
      'PROD_LINK',
      'BallotStyleNumber',
      'ballotStyleNumber',
      'BallotStyle2'
    ]);

    const rawCombinedStyle = (primaryStyleRow?.BallotStyle ??
      primaryStyleRow?.BALLOTSTYLE ??
      primaryStyleRow?.ballotStyle ??
      '') as string;

    const combinedStyle = rawCombinedStyle.trim();
    const [bsdRaw = '', bsrRaw = ''] = combinedStyle.split('|', 2);
    const BSD = bsdRaw.trim();
    const BSR = bsrRaw.trim();

    const styleNumber = String(
      generalBallotRow?.BallotStyleNumber ??
        generalBallotRow?.ballotStyleNumber ??
        generalBallotRow?.BallotStyle2 ??
        (combinedStyle.includes('|') ? '' : combinedStyle) ??
        ''
    ).trim();

    const demInteractiveUrl = String(
      ballotLinksRow?.DemBallot ??
        ballotLinksRow?.DEMBALLOT ??
        ballotLinksRow?.DEM_BALLOT ??
        ''
    ).trim();

    const repInteractiveUrl = String(
      ballotLinksRow?.RepBallot ??
        ballotLinksRow?.REPBALLOT ??
        ballotLinksRow?.REP_BALLOT ??
        ''
    ).trim();

    const interactiveUrl = String(
      generalBallotRow?.InteractiveBallotUrl ??
        generalBallotRow?.interactiveBallotUrl ??
        generalBallotRow?.interactiveUrl ??
        generalBallotRow?.QA_LINK ??
        generalBallotRow?.Prod_Link ??
        generalBallotRow?.PROD_LINK ??
        demInteractiveUrl ??
        repInteractiveUrl ??
        ''
    ).trim();

    const precinct = String(
      ballotLinksRow?.Precinct ??
        ballotLinksRow?.PRECINCT ??
        generalBallotRow?.Precinct ??
        generalBallotRow?.PRECINCT ??
        voterInfo?.PRECINCT ??
        voterInfo?.Precinct ??
        ''
    ).trim();

    const ballotStyle = {
      number: styleNumber,
      style: combinedStyle,
      BSD,
      BSR,
      precinct,
      interactiveSampleBallots: {
        dem: demInteractiveUrl,
        rep: repInteractiveUrl
      },
      interactiveUrl
    };

    // --- debug info (fixed) ---
    const debugInfo = debug
      ? {
          electionIDEcho: electionID,
          voterIDEcho: voterID,
          recordsetMeta: recordsetList.map((rs: any, i: number) => ({
            i,
            rows: Array.isArray(rs) ? rs.length : 0,
            keys: firstRow(rs) ? Object.keys(firstRow(rs)) : []
          })),
          primaryStyleRow,
          generalBallotRow,
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
