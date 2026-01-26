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

    // The row that SHOULD contain ballot-style info (interactive link, etc.)
    const row = recordsets?.[4]?.[0] ?? null;

    // Pull the link from any plausible column the proc might return
    const interactiveUrl =
      (row?.InteractiveBallotUrl ??            // our recommended alias
       row?.interactiveBallotUrl ??            // lowercase variant
       row?.interactiveUrl ??                  // already mapped case
       row?.QA_LINK ??                         // common legacy column
       row?.Prod_Link ?? row?.PROD_LINK ??     // some envs have PROD link
       row?.BallotStyle ??                     // in older proc, QA_LINK aliased as "BallotStyle"
       '') as string;

    // Style number from any plausible column
    const styleNumber =
      (row?.BallotStyleNumber ??
       row?.ballotStyleNumber ??
       row?.BallotStyle2 ??                    // older proc sometimes emitted this
       row?.BallotStyle ??                     // (not ideal, but sometimes number was here)
       '') as string;

    const precinct =
      (row?.Precinct ?? row?.PRECINCT ?? '') as string;

    const ballotStyle = {
      number: styleNumber ?? '',
      precinct: precinct ?? '',
      interactiveUrl: interactiveUrl ?? ''
    };

    // Optional debug echo so you can inspect in Network → Response
    const debugInfo = debug
      ? {
          electionIDEcho: electionID,
          voterIDEcho: voterID,
          fifthRecordsetKeys: row ? Object.keys(row) : [],
          fifthRecordsetRow: row ?? null
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
