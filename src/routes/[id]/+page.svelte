<script lang="ts">
    import { t } from 'svelte-i18n';

  export let data: {
    voterInfo: any;
    federalOfficials: any[];
    stateOfficials: any[];
    countyOfficials: any[];
    ballotStyle: string;
    showSampleBallot: boolean;
    isPrimary: boolean;
    electionID: string;
  };

  const {
    voterInfo,
    federalOfficials,
    stateOfficials,
    countyOfficials,
    ballotStyle,
    showSampleBallot,
    isPrimary,
    electionID
  } = data;

  const hasValidElectionID = electionID && electionID.trim() !== '';
  const showPrimaryElection = showSampleBallot && isPrimary && hasValidElectionID;
  const showGeneralElection = showSampleBallot && !isPrimary && hasValidElectionID;

  console.log({ showSampleBallot, isPrimary, showPrimaryElection, showGeneralElection });
</script>


<div class="voterContainer">
<div class="voterInfo">
{#if voterInfo}
    <section class="voterDetailsSection">
        <h2>{$t('nav.voterInfo')}</h2>
        <!-- <h2>Voter Information</h2> -->
        <div><strong>{$t('nav.idName')}:</strong>  {voterInfo.NAME}</div>
        <!-- <div><strong>Name:</strong>  {voterInfo.NAME}</div> -->
        <div><strong>{$t('nav.idVuid')}:</strong> {voterInfo.STATEVUID}</div>
        <!-- <div><strong>TX Voter ID (VUID):</strong> {voterInfo.STATEVUID}</div> -->
        <div><strong>{$t('nav.votingPrecinct')}:</strong> {voterInfo.PRECINCT}</div>
        <!-- <div><strong>Voting Precinct:</strong> {voterInfo.PRECINCT}</div> -->
        <div><strong>{$t('nav.status')}:</strong> {voterInfo.STATUS}</div>
        <!-- <div><strong>Status:</strong> {voterInfo.STATUS}</div> -->
        <div><strong>{$t('nav.address')}:</strong> {voterInfo.ADDRESS}
        <!-- <div><strong>Address:</strong> {voterInfo.ADDRESS} -->
        <p><a href="https://www.wilcotx.gov/444/Name-Address-or-DPS-Change">{$t('nav.moved')}</a></p>
        <!-- <p><a href="https://www.wilcotx.gov/444/Name-Address-or-DPS-Change">Have you moved?</a></p> -->
        </div>
        </section>

        {#if showGeneralElection}
    <section id="non-primary_election">
        <h2>{$t('nav.sampleBallot')}</h2>
        <!-- <h2>Sample Ballot</h2> -->
        <div><strong>{$t('nav.pdfSampleBallot')}:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div>
        <!-- <div><strong>PDF Sample Ballot Ballot:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div> -->
        <div><strong>{$t('nav.intSampleBallot')}:</strong> <a href="{ballotStyle}">Web Ballot</a></div>
        <!-- <div><strong>Interactive Sample Ballot:</strong> <a href="{ballotStyle}">Web Ballot</a></div> -->
        <!-- <div><strong>Effective Date:</strong> {voterInfo.EFFECTIVE_DATE}</div> -->
    </section>
    {/if}
    {#if showPrimaryElection}
    <section id="primary_election">
        <h2>{$t('nav.sampleBallot')}</h2>
        <!-- <h2>Sample Ballot</h2> -->
        <div><strong>{$t('nav.pdfDemSampleBallot')}:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div>
        <!-- <div><strong>PDF Democrat Sample Ballot Ballot:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div> -->
        <div><strong>{$t('nav.intDemSampleBallot')}:</strong> <a href="{ballotStyle}">Web Ballot</a></div>
        <!-- <div><strong>Interactive Democrat Sample Ballot:</strong> <a href="{ballotStyle}">Web Ballot</a></div> -->
        <div><strong>{$t('nav.pdfRepSampleBallot')}:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div>
        <!-- <div><strong>PDF Republican Sample Ballot Ballot:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div> -->
        <div><strong>{$t('nav.intRepSampleBallot')}:</strong> <a href="{ballotStyle}">Web Ballot</a></div>
        <!-- <div><strong>Interactive Republican Sample Ballot:</strong> <a href="{ballotStyle}">Web Ballot</a></div> -->
    </section>
    {/if}
{/if}
</div>
{#if federalOfficials && federalOfficials.length > 0}
<section class="electedOfficialSection">
    <details name="electedOfficials">
        <summary>{$t('nav.fedEOs')}</summary>
        <!-- <summary>Federal Elected Officials</summary> -->
        <ul class="feds">
            {#each federalOfficials as official}
            <li>
                <div><strong>{$t('nav.eoDescription')}</strong> {official.Description}</div>
                <div><strong>{$t('nav.eoOfficial')}</strong> {official.Appointed_Official}</div>
                <div><strong>{$t('nav.eoWebsite')}</strong> 
                    <a href={official.Web_Site} target="_blank">{official.Web_Site}</a>
                </div>
            </li>
            {/each}
        </ul>
    </details>
</section>
{/if}

{#if stateOfficials && stateOfficials.length > 0}
<section class="electedOfficialSection">
    <details name="electedOfficials">
        <summary>{$t('nav.stateEOs')}</summary>
        <!-- <summary>State Elected Officials</summary> -->
        <ul class="state">
            {#each stateOfficials as official}
            <li>
                <div><strong>{$t('nav.eoDescription')}</strong> {official.Description}</div>
                <div><strong>{$t('nav.eoOfficial')}</strong> {official.Appointed_Official}</div>
                <div><strong>{$t('nav.eoWebsite')}</strong> 
                    <a href={official.Web_Site} target="_blank">{official.Web_Site}</a>
                </div>
            </li>
            {/each}
        </ul>
    </details>
</section>
{/if}

{#if countyOfficials && countyOfficials.length > 0}
<section class="electedOfficialSection">
    <details name="electedOfficials">
        <summary>{$t('nav.countyEOs')}</summary>
        <!-- <summary>County Elected Officials</summary> -->
        <ul class="county">
            {#each countyOfficials as official}
            <li>
                <div><strong>{$t('nav.eoDescription')}</strong> {official.Description}</div>
                <div><strong>{$t('nav.eoOfficial')}</strong> {official.Appointed_Official}</div>
                <div><strong>{$t('nav.eoWebsite')}</strong> 
                    <a href={official.Web_Site} target="_blank">{official.Web_Site}</a>
                </div>
            </li>
            {/each}
        </ul>
    </details>
</section>
{/if}
</div>

<style>
    .voterContainer {
        container-type: inline-size;
        container-name: voter;
        padding: 1em;
    }

    .voterInfo {
        display: flex;
        gap: 1em;
        /* text-transform: capitalize; */
    }
    strong {
        font-weight: 800;
    }
    /* ul {
        display: grid;
        grid: auto-flow / 1fr 1fr 1fr;
        gap: 1em;
        max-width: 90vw;
    } */
     ul {
        display: flex;
        gap: 1em;
        width: 90vw;
        flex-direction: column;
        flex-wrap: wrap;
        align-content: flex-start;
        padding-inline-start: 0;
     }

     .feds {
        max-height: 320px;
        overflow: scroll;
     }

    .state {
        max-height: 960px;
        overflow: scroll;

        li:nth-child(even) {
            background-color: var(--wc-tan-60);/**#e7e5e2;**/
        }
    }
    .county {
        max-height: 400px;
        overflow: scroll;
        li:nth-child(even) {
            background-color: var(--wc-tan-60);/**#e7e5e2;**/
        }
    }
    li {
        list-style: none;
    }
    details {
        margin: 1em 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: .5em;
        overflow-wrap: break-word;
        word-break: normal;
    }
    summary {
        font-weight: bold;
        color: var(--wc-main);
        cursor: pointer;
        padding: .25em;
    }

    @container voter (width<600px) {
        .voterInfo {
            flex-direction: column;
        }

        ul {
            grid-template-columns: 1fr;
            margin-block: 0;
            flex-wrap:nowrap;
            width: 100%;
        }
    }
</style>