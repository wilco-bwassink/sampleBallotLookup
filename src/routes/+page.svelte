<script lang="ts">
    import { onMount } from 'svelte';
    import AnnouncementSection from '$lib/components/AnnouncementSection.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
    import { t, isLoading, locale, waitLocale } from 'svelte-i18n';

    let ready = false;
    let initialized = false;

    onMount(async () => {
        try {
            await waitLocale();
            initialized = true;
        } catch (error) {
            console.error('Failed to initialize i18n:', error);
        }
    });

    $: ready = initialized && !$isLoading;

	
	let electionStatus = [];
	let settings = { EnglishText: '', SpanishText: '', ShowSampleBallot: false };
	
	// Builds out month dropdown using localization
	function buildMonths(loc: string | undefined, width: 'long' | 'short' | 'narrow' = 'long') {
		const fmt = new Intl.DateTimeFormat(loc || 'en', { month: width });
		return Array.from({ length: 12 }, (_, i) => ({
			value: i +1,
			label: fmt.format(new Date(2000, i, 1))
		}));
	}	

	$: months = buildMonths($locale ?? undefined, 'long');

	const days = Array.from({ length: 31 }, (_, i) => i + 1);
	const currentYear = new Date().getFullYear();
	const startYear = currentYear - 18;
	const endYear = currentYear - 104;
	const years: number[] = [];

	for (let year = startYear; year >= endYear; year--) {
		years.push(year);
	}

	let electionData: Record<string, { IsActive:boolean }> = {};
	let elections: string[] = [];
	let selectedElection = '';
	let searchResults: Array<{ IDNUMBER: string; NAME: string; ADDRESS: string }> = [];

	onMount(async () => {
		try {
		const [eRes, sRes] = await Promise.all([
		fetch('http://dev.wilco.org/voterlookup/api/proxy-election-data'),
		fetch('http://dev.wilco.org/voterlookup/api/proxy-admin-settings')
		]);
		electionStatus = await eRes.json();
		settings = await sRes.json();
		} catch (err) {
			console.error('Data load error: ', err);
		}
	});

	

	// Search Handling
	async function handSearch() {
	const voterID = (document.getElementById('voterIDInput') as HTMLInputElement)?.value?.trim();
	const lastName = (document.getElementById('lastNameInput') as HTMLInputElement)?.value?.trim();
	const firstName = (document.getElementById('firstNameInput') as HTMLInputElement)?.value?.trim();
	const dobMonth = (document.getElementById('monthDropdown') as HTMLSelectElement)?.value;
	const dobDay = (document.getElementById('dayDropdown') as HTMLSelectElement)?.value;
	const dobYear = (document.getElementById('yearDropdown') as HTMLSelectElement)?.value;

	let payload: Record<string, string> | null = null;

	if (voterID) {
		payload = { voterID, electionID: selectedElection };
	} else if (firstName && lastName && dobYear && dobMonth && dobDay) {
		const dobMonth = (document.getElementById('monthDropdown') as HTMLSelectElement)?.value;
		const monthNumber = parseInt(dobMonth, 10);
			if (!(monthNumber >= 1 && monthNumber <= 12)) {
  				alert('Please select a valid month.');
  				return;
				}
		const dob = `${dobYear}-${String(monthNumber).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;
		payload = { firstName, lastName, dob, electionID: selectedElection };
	}

	if (!payload) {
		alert('Please provide either your Voter ID or full Name and Date of Birth.');
		return;
	}

	try {
		const res = await fetch('http://dev.wilco.org/voterlookup/api/voter-search', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const data = await res.json();

		if (data.error) {
			alert (data.error);
			return;
		}

		searchResults = data.voters || [];

		// TO DO: handle results
		console.log('Search results:', data);
	} catch (err) {
		console.error('Search failed:', err);
		alert('Search request failed. Please try again.');
	}

}


	onMount(async () => {
		try {
			const res = await fetch('http://dev.wilco.org/voterlookup/api/proxy-election-data');
			const data = await res.json();

			if ('error' in data) {
				console.error('Error from API', data.error);
				alert('Failed to load election data. Please try again later.');
				return;
			}

			electionData = data;
			elections = Object.keys(data).filter((key) => data[key]?.IsActive === true);
		} catch (err) {
			console.error('Fetch error', err);
			alert('Unable to conect to the election server.')
		}
	})

	$: console.log('locale=', $locale, 'loading=', $isLoading, 'title=', $t?.('site.title'));
</script>
{#if ready}
<header>
	<img
		src="https://apps.wilco.org/utils/wilcoMark.svg"
		width="100px"
		alt="Williamson County W Logo"
	/>
	<h1>{$t('site.title')}</h1>
	<div class="languageToggle"><LanguageToggle available={['en', 'es']}/></div>

</header>
<p>{$t('nav.directions')}</p>
{#if settings.ShowSampleBallot}
<select name="electionDropdown" id="electionDropdown" bind:value={selectedElection} title="Election Drop-down" required>
	<option value="">Select an Election</option>
	{#each elections as election}
		<option value={election}>{election}</option>
	{/each}
</select><br />
<AnnouncementSection {selectedElection} {electionData} />
{/if}
<div class="searchSection">
<div id="nameDOBSection">
<h4>{$t('voterInfo.nameTitle')}</h4>
<div class="voterName">
	<div class="firstName">
		<input type="text" name="firstName" id="firstNameInput" title="First Name Input"/><br />
		<label for="firstNameInput">{$t('voterInfo.firstName')}</label>
		
	</div>
	<div class="lastName">
		<input type="text" name="lastName" id="lastNameInput" title="Last Name Input"/><br />
		<label for="lastNameInput">{$t('voterInfo.lastName')}</label>
		
	</div>
</div>
<h4>{$t('voterInfo.dob')}</h4>
<div class="voterDOB">
	<select name="monthDropdown" id="monthDropdown" title="Voter Birth Month Drop-down">
		{#each months as m}
			<option value={m.value}>{m.label}</option>
		{/each}
	</select>
	<select name="dayDropdown" id="dayDropdown" title="Voter Birth Day Drop-down">
		{#each days as day}
			<option value={day}>{day}</option>
		{/each}
	</select>
	<select id="yearDropdown" name="yearDropdown" title="Voter Birth Year Drop-down">
		{#each years as year}
			<option value={year}>{year}</option>
		{/each}
	</select>
</div>
</div>
<div class="or">{$t('voterInfo.or')}</div>
<div id="voterIDSection">
<h4>{$t('voterInfo.vuidTitle')}</h4>
<div class="voterID">
	<input type="text" name="voterID" id="voterIDInput" title="Voter ID Input"/><br />
	<label for="voterIDInput">{$t('voterInfo.vuid')}</label>
</div>
</div>
</div>
<button class="button button__blue" on:click={handSearch}>{$t('voterInfo.search')}</button>
<div id="voterInfo"></div>
<h3>{$t('searchResults.title')}</h3>
<div class="bottomLinks">
	<a href="\#">{$t('nav.newSearch')}</a>
	<a href="http://www.wilcotx.gov/elections">{$t('nav.electionsLink')}</a>
</div>

{#if searchResults.length > 0}
<section id="searchResults">
	<h2>{$t('nav.matchingVoters')}</h2>
	<ul>
		{#each searchResults as voter}
		<li class="voterDetails">
			<p class="voterInfo"><a href="http://dev.wilco.org/voterlookup/{voter.IDNUMBER}?electionID={selectedElection}" target="_blank">{voter.NAME}</a></p>
			<p class="voterInfo">{voter.ADDRESS}</p>
		</li>
		{/each}
	</ul>
</section>
{/if}
<section>
<div class="adminInfo englishInfo">{@html settings.EnglishText.replace(/\r\n/g,'<br><br>')}</div>
<div class="adminInfo spanishInfo">{@html settings.SpanishText.replace(/\r\n/g,'<br><br>')}</div>
</section>

{:else}
<p>Loading...</p>
{/if}
<style>
	#electionDropdown {
		min-width: 15em;
	}
	.searchSection {
		display: flex;
		justify-content: space-around;
	}
	.voterName {
		display: flex;
		gap: 1em;
	}
	.voterInfo {
		text-transform: capitalize;
	}
	.bottomLinks {
		display: flex;
		gap: 1em;
	}

	.or {
		font-weight: bold;
		margin-top: 1em;
	}

	.button {
		margin-top: 1em;
		padding: .3em;
	}

	#searchResults {
		margin-top: 2em;

		ul {
			list-style-type: none;
			padding: 0;
		}

		& li {
			margin-bottom: 1em;
		}
	}

	.voterDetails {
		display: flex;
		gap: 1em;
	}

	input {
		padding: 0.5em;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1em;
		min-width: 14em;
	}
	select:focus-within {
		border: 1px #000 solid;
	}

	.languageToggle {
		position: absolute;
		top: 1em;
		right: 1em;
	}

	.spanishInfo {display: none;}

	:global(html[lang="es"]) .englishInfo { display: none; }
	:global(html[lang="es"]) .spanishInfo { display: block; }
</style>
