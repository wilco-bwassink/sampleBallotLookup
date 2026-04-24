// routes/voterlookup/api/voter-details/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getVoterDetails, getVoterDetailsPrimary } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { voterID, electionID, debug, isPrimary = false } = await request.json();

    if (!voterID || !electionID) {
      return json({ error: 'Missing voterID or electionID' }, { status: 400 });
    }

    const primaryElection = Boolean(isPrimary);
    const recordsets = primaryElection
      ? await getVoterDetailsPrimary(voterID, electionID)
      : await getVoterDetails(voterID, electionID);
    const recordsetList = Array.isArray(recordsets) ? recordsets : Object.values(recordsets ?? {});

    const voterInfo        = recordsetList[0]?.[0] ?? null;
    const federalOfficials = recordsetList[1] ?? [];
    const stateOfficials   = recordsetList[2] ?? [];
    const countyOfficials  = recordsetList[3] ?? [];

    // --- Ballot recordsets (support both general and primary elections) ---
    const firstRow = (rs: any) => (Array.isArray(rs) && rs.length ? rs[0] : null);
    const allRows = recordsetList.flatMap((rs: any) =>
      Array.isArray(rs) ? rs.filter((row) => row && typeof row === 'object') : []
    );

    const findRowsByKeys = (keys: string[]) =>
      allRows.filter((row) => keys.some((key) => key in row));

    const getFirstValue = (rows: any[], keys: string[]) => {
      for (const row of rows) {
        for (const key of keys) {
          if (!(key in row)) continue;
          const value = row[key];
          if (value === null || value === undefined) continue;
          const trimmed = String(value).trim();
          if (trimmed) return trimmed;
        }
      }
      return '';
    };

    const ballotLinkRows = findRowsByKeys([
      'DemBallot',
      'RepBallot',
      'DEMBALLOT',
      'REPBALLOT',
      'DEM_BALLOT',
      'REP_BALLOT',
      'DemInteractiveBallotUrl',
      'RepInteractiveBallotUrl',
      'DemInteractiveUrl',
      'RepInteractiveUrl',
      'DEM_LINK',
      'REP_LINK',
      'Split_ID'
    ]);
    const primaryStyleRows = findRowsByKeys([
      'BallotStyle',
      'BALLOTSTYLE',
      'ballotStyle',
      'BSD',
      'BSR',
      'Split_ID',
      'DemBallotStyle',
      'RepBallotStyle',
      'DEMSTYLE',
      'REPSTYLE'
    ]);
    const generalBallotRows = findRowsByKeys([
      'InteractiveBallotUrl',
      'interactiveBallotUrl',
      'interactiveUrl',
      'QA_LINK',
      'Prod_Link',
      'PROD_LINK',
      'BallotStyleNumber',
      'ballotStyleNumber',
      'BallotStyle2',
      'Split_ID'
    ]);

    const demSplitRow =
      allRows.find(
        (row) => typeof row?.Split_ID === 'string' && row.Split_ID.trim().toUpperCase().startsWith('BSD')
      ) ?? null;
    const repSplitRow =
      allRows.find(
        (row) => typeof row?.Split_ID === 'string' && row.Split_ID.trim().toUpperCase().startsWith('BSR')
      ) ?? null;

    const rawCombinedStyle = getFirstValue(primaryStyleRows, [
      'BallotStyle',
      'BALLOTSTYLE',
      'ballotStyle'
    ]);

    const combinedStyle = rawCombinedStyle.trim();
    const [bsdRaw = '', bsrRaw = ''] = combinedStyle.split('|', 2);
    const BSD = (
      bsdRaw.trim() ||
      String(demSplitRow?.Split_ID ?? '').replace(/^BSD/i, '') ||
      getFirstValue(primaryStyleRows, ['BSD', 'DemBallotStyle', 'DEMSTYLE'])
    ).trim();
    const BSR = (
      bsrRaw.trim() ||
      String(repSplitRow?.Split_ID ?? '').replace(/^BSR/i, '') ||
      getFirstValue(primaryStyleRows, ['BSR', 'RepBallotStyle', 'REPSTYLE'])
    ).trim();

    const styleNumber = (
      getFirstValue(generalBallotRows, [
        'BallotStyleNumber',
        'ballotStyleNumber',
        'BallotStyle2'
      ]) ||
      (combinedStyle.includes('|') ? '' : combinedStyle) ||
      BSD ||
      BSR
    ).trim();

    const demInteractiveUrl = getFirstValue(ballotLinkRows, [
      'DemBallot',
      'DEMBALLOT',
      'DEM_BALLOT',
      'DemInteractiveBallotUrl',
      'DemInteractiveUrl',
      'DEM_LINK'
    ]) || String(demSplitRow?.QA_LINK ?? '').trim();

    const repInteractiveUrl = getFirstValue(ballotLinkRows, [
      'RepBallot',
      'REPBALLOT',
      'REP_BALLOT',
      'RepInteractiveBallotUrl',
      'RepInteractiveUrl',
      'REP_LINK'
    ]) || String(repSplitRow?.QA_LINK ?? '').trim();

    const interactiveUrl = (
      getFirstValue(generalBallotRows, [
        'InteractiveBallotUrl',
        'interactiveBallotUrl',
        'interactiveUrl',
        'QA_LINK',
        'Prod_Link',
        'PROD_LINK'
      ]) ||
      demInteractiveUrl ||
      repInteractiveUrl
    ).trim();

    const precinct = (
      getFirstValue([...ballotLinkRows, ...generalBallotRows, ...primaryStyleRows], [
        'Precinct',
        'PRECINCT'
      ]) ||
      String(voterInfo?.PRECINCT ?? voterInfo?.Precinct ?? '')
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
          isPrimary: primaryElection,
          recordsetMeta: recordsetList.map((rs: any, i: number) => ({
            i,
            rows: Array.isArray(rs) ? rs.length : 0,
            keys: firstRow(rs) ? Object.keys(firstRow(rs)) : []
          })),
          primaryStyleRows,
          generalBallotRows,
          ballotLinkRows
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
    const message = err instanceof Error ? err.message : 'Failed to retrieve voter details';
    return json(
      {
        error: 'Failed to retrieve voter details',
        details: message
      },
      { status: 500 }
    );
  }
};
