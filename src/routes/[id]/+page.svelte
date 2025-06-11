<script lang="ts">
    export let data;
    const { voterInfo, electedOfficials, ballotStyle } = data;
    console.log('Rednering data', data);

    let showOfficials = false;
</script>

{#if voterInfo}
    <section class="voterDetailsSection">
        <h2>Personal Information</h2>
        <div><strong>Name:</strong>  {voterInfo.NAME}</div>
        <div><strong>TX Voter ID (VUID):</strong> {voterInfo.STATEVUID}</div>
        <div><strong>Address:</strong> {voterInfo.ADDRESS}</div>
        <h2>Voting Information</h2>
        <div><strong>Voting Precinct:</strong> {voterInfo.PRENINCT}</div>
        <div><strong>Effective Date:</strong> {voterInfo.EFFECTIVE_DATE}</div>
        <div><strong>Status:</strong> {voterInfo.STATUS}</div>
    </section>
{/if}

{#if electedOfficials && electedOfficials.length > 0}
<section class="electedOffcialSection">
    <details>
    <summary>Elected Officials (show/hide)</summary>
    <ul>
        {#each electedOfficials as official}
        <li>
            <div>Description: {official.Description}</div>
            <div>Official: {official.Appointed_Official}</div>
            <div>Website: <a href={official.Web_Site} target="_blank">{official.Web_Site}</a></div>
        </li>
        {/each}
    </ul>
    </details>
</section>
{/if}

<style>
    strong {
        font-weight: bolder;
    }
    ul {
        display: flex;
        gap: 1em;
    }

    details {
        margin: 1em 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: .5em;
    }
    summary {
        font-weight: bold;
        color: var(--wc-main);
        cursor: pointer;
        padding: .25em;
    }
</style>