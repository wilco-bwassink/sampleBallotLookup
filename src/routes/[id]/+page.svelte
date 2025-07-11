<script lang="ts">
    export let data;
const { 
    voterInfo, 
    federalOfficials, 
    stateOfficials, 
    countyOfficials, 
    ballotStyle 
} = data;

    // console.log('Rendering data', data);

</script>
<div class="voterContainer">
<div class="voterInfo">
{#if voterInfo}
    <section class="voterDetailsSection">
        <h2>Personal Information</h2>
        <div><strong>Name:</strong>  {voterInfo.NAME}</div>
        <div><strong>TX Voter ID (VUID):</strong> {voterInfo.STATEVUID}</div>
        <div><strong>Address:</strong> {voterInfo.ADDRESS}</div>
        </section>
        <section>
        <h2>Voting Information</h2>
        <div><strong>Ballot Style:</strong> <a href="{ballotStyle}">{ballotStyle}</a></div>
        <div><strong>Sample Ballot:</strong> <a href="{ballotStyle}">Web Ballot</a></div>
        <div><strong>Voting Precinct:</strong> {voterInfo.PRECINCT}</div>
        <div><strong>Effective Date:</strong> {voterInfo.EFFECTIVE_DATE}</div>
        <div><strong>Status:</strong> {voterInfo.STATUS}</div>
    </section>
{/if}
</div>
{#if federalOfficials && federalOfficials.length > 0}
<section class="electedOfficialSection">
    <details name="electedOfficials">
        <summary>Federal Elected Officials</summary>
        <ul class="feds">
            {#each federalOfficials as official}
            <li>
                <div><strong>Description:</strong> {official.Description}</div>
                <div><strong>Official:</strong> {official.Appointed_Official}</div>
                <div><strong>Website:</strong> 
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
        <summary>State Elected Officials</summary>
        <ul class="state">
            {#each stateOfficials as official}
            <li>
                <div><strong>Description:</strong> {official.Description}</div>
                <div><strong>Official:</strong> {official.Appointed_Official}</div>
                <div><strong>Website:</strong> 
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
        <summary>County Elected Officials</summary>
        <ul class="county">
            {#each countyOfficials as official}
            <li>
                <div><strong>Description:</strong> {official.Description}</div>
                <div><strong>Official:</strong> {official.Appointed_Official}</div>
                <div><strong>Website:</strong> 
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
     }

     .feds {
        max-height: 320px;
     }

    .state {
        max-height: 960px;
        overflow: hidden;
    }
    .county {
        max-height: 340px;
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
        }
    }
</style>