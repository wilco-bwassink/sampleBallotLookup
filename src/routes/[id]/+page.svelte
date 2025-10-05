<script lang="ts">
  import { t } from 'svelte-i18n';
  import { assets } from '$app/paths'; // use assets for files in /static

  export let data: {
    voterInfo: any;
    federalOfficials: any[];
    stateOfficials: any[];
    countyOfficials: any[];
    ballotStyle: any; // accept either string or object from API
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

  const hasValidElectionID = !!(electionID && electionID.trim() !== '');
  const showPrimaryElection  = showSampleBallot && isPrimary && hasValidElectionID;
  const showGeneralElection  = showSampleBallot && !isPrimary && hasValidElectionID;

  // ---- NORMALIZE ballotStyle for both legacy and new shapes ----
  // Interactive link:
  const interactiveHref: string =
    typeof ballotStyle === 'string'
      ? ballotStyle
      : (ballotStyle?.interactiveUrl ??
         ballotStyle?.InteractiveBallotUrl ??
         '');

  // Style number (for later PDF work; safe to keep here):
  const styleNumber: string =
    typeof ballotStyle === 'object'
      ? (ballotStyle?.number ?? ballotStyle?.BallotStyleNumber ?? '')
      : '';

  // ---- Build URLs synchronously (SSR-safe). You can ignore these for now. ----
  const root = `${assets}/sampleballots`;
  const pdfUrl   = styleNumber ? `${root}/BS${styleNumber}.pdf` : null;            // change to `${root}/${styleNumber}.pdf` if no "BS" prefix
  const demPdfUrl = styleNumber && isPrimary ? `${root}/BS${styleNumber}_DEM.pdf` : null;
  const repPdfUrl = styleNumber && isPrimary ? `${root}/BS${styleNumber}_REP.pdf` : null;
</script>

<header>
  <img
    src="https://apps.wilco.org/utils/wilcoMark.svg"
    width="100px"
    alt="Williamson County W Logo"
  />
  <h1>{$t('site.title')}</h1>
</header>
<!-- DEBUG: render the raw ballotStyle payload -->
{#if import.meta.env.DEV}
  <details class="debug" open>
    <summary>Debug: ballotStyle payload</summary>
    <div><strong>typeof:</strong> {typeof data?.ballotStyle}</div>
    {#if typeof data?.ballotStyle === 'object' && data?.ballotStyle}
      <div><strong>keys:</strong> {Object.keys(data.ballotStyle).join(', ')}</div>
    {/if}
    <pre style="white-space:pre-wrap;max-width:100%;overflow:auto">{JSON.stringify(data?.ballotStyle, null, 2)}</pre>
  </details>
{/if}
<div class="voterContainer">
  <div class="voterInfo">
    {#if voterInfo}
      <section class="voterDetailsSection">
        <h2>{$t('nav.voterInfo')}</h2>
        <div><strong>{$t('nav.idName')}:</strong>  {voterInfo.NAME}</div>
        <div><strong>{$t('nav.idVuid')}:</strong> {voterInfo.STATEVUID}</div>
        <div><strong>{$t('nav.votingPrecinct')}:</strong> {voterInfo.PRECINCT}</div>
        <div><strong>{$t('nav.status')}:</strong> {voterInfo.STATUS}</div>
        <div><strong>{$t('nav.address')}:</strong> {voterInfo.ADDRESS}
          <p><a href="https://www.wilcotx.gov/444/Name-Address-or-DPS-Change" target="_blank">{$t('nav.moved')}</a></p>
        </div>
      </section>

      {#if showGeneralElection}
        <section id="non-primary_election">
          <h2>{$t('nav.sampleBallot')}</h2>

          <div>
            <strong>PDF Sample Ballot:</strong>
            {#if styleNumber}
              <a href={pdfUrl} target="_blank" rel="noopener">
                {$t('nav.pdfBallot')}
              </a>
            {:else}
              <span>Not available</span>
            {/if}
          </div>

          <div>
            <strong>Interactive Sample Ballot:</strong>
            {#if interactiveHref}
              <a href={interactiveHref} target="_blank" rel="noopener">{$t('nav.webBallot')}</a>
            {:else}
              <span>Not available</span>
            {/if}
          </div>
        </section>
      {/if}

      {#if showPrimaryElection}
        <section id="primary_election">
          <h2>{$t('nav.sampleBallot')}</h2>

          <div>
            <strong>PDF Democrat Sample Ballot:</strong>
            {#if styleNumber}
              <a href={demPdfUrl} target="_blank" rel="noopener">
                View PDF (style {styleNumber})
              </a>
            {:else}
              <span>Not available</span>
            {/if}
          </div>

          <div>
            <strong>Interactive Democrat Sample Ballot:</strong>
            {#if interactiveHref}
              <a href={interactiveHref} target="_blank" rel="noopener">Web Ballot</a>
            {:else}
              <span>Not available</span>
            {/if}
          </div>

          <div>
            <strong>PDF Republican Sample Ballot:</strong>
            {#if styleNumber}
              <a href={repPdfUrl} target="_blank" rel="noopener">
                View PDF (style {styleNumber})
              </a>
            {:else}
              <span>Not available</span>
            {/if}
          </div>

          <div>
            <strong>Interactive Republican Sample Ballot:</strong>
            {#if interactiveHref}
              <a href={interactiveHref} target="_blank" rel="noopener">Web Ballot</a>
            {:else}
              <span>Not available</span>
            {/if}
          </div>
        </section>
      {/if}
    {/if}
  </div>

  {#if federalOfficials && federalOfficials.length > 0}
    <section class="electedOfficialSection">
      <details name="electedOfficials">
        <summary>{$t('nav.fedEOs')}</summary>
        <ul class="feds">
          {#each federalOfficials as official}
            <li>
              <div><strong>{$t('nav.eoDescription')}</strong> {official.Description}</div>
              <div><strong>{$t('nav.eoOfficial')}</strong> {official.Appointed_Official}</div>
              <div><strong><a href={official.Web_Site} target="_blank">{$t('nav.eoWebsite')}</a></strong></div>
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
        <ul class="state">
          {#each stateOfficials as official}
            <li>
              <div><strong>{$t('nav.eoDescription')}</strong> {official.Description}</div>
              <div><strong>{$t('nav.eoOfficial')}</strong> {official.Appointed_Official}</div>
              <div><strong><a href={official.Web_Site} target="_blank">{$t('nav.eoWebsite')}</a></strong></div>
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
        <ul class="county">
          {#each countyOfficials as official}
            <li>
              <div><strong>{$t('nav.eoDescription')}</strong> {official.Description}</div>
              <div><strong>{$t('nav.eoOfficial')}</strong> {official.Appointed_Official}</div>
              <div><strong><a href={official.Web_Site} target="_blank">{$t('nav.eoWebsite')}</a></strong></div>
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
  }
  strong {
    font-weight: 800;
  }
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
    li:nth-child(even) {
      background-color: var(--wc-tan-60);
    }
  }

  .state {
    max-height: 415px;
    overflow: scroll;
    li:nth-child(even) {
    background-color: var(--wc-tan-60);
    }
  }
  .county {
    max-height: 415px;
    overflow: scroll;
    li:nth-child(even) {
      background-color: var(--wc-tan-60);
    }
  }
  li {
    list-style: none;
    padding: .5em;
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
      flex-wrap: nowrap;
      width: 100%;
    }
  }
</style>
