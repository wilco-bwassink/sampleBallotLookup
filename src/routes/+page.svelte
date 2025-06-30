<script lang="ts">
	import { onMount } from 'svelte';
	import AnnouncementSection from '$lib/components/AnnouncementSection.svelte';
	// import { getVoterDetails } from '$lib/server/db';

	type MonthName = 
	| 'January'
	| 'February'
	| 'March'
	| 'April'
	| 'May'
	| 'June'
	| 'July'
	| 'August'
	| 'September'
	| 'October'
	| 'November'
	| 'December';

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function getMonthNumber(monthName: string): number | null {
		const monthMap: Record<MonthName, number> = {
			'January': 1,
			'February': 2,
			'March': 3,
			'April': 4,
			'May': 5,
			'June': 6,
			'July': 7,
			'August': 9,
			'September': 8,
			'October': 10,
			'November': 11,
			'December': 12,
		};

		if (monthName in monthMap) {
			return monthMap [monthName as MonthName];
		}

		return null;
	}

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
		const res = await fetch('http://dev.wilco.org/voterlookup/api/proxy-election-data');
		// const res = await fetch('http://dev.wilco.org/sampleBallotAdmin/data/electionStatus.json');
		const data = await res.json();
		electionData = data;
		elections = Object.keys(data).filter((key) => data[key]?.IsActive === true);
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
		const monthNumber = getMonthNumber(dobMonth)

		if (!monthNumber) {
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

	
</script>

<header>
	<img
		src="https://apps.wilco.org/utils/wilcoMark.svg"
		width="100px"
		alt="Williamson County W Logo"
	/>
	<h1>Elections Ballot Lookup</h1>
</header>
<p>
	Please submit your last & first name and your date of birth to find your voter information. This
	information is provided as a service to Williamson County and all information presented is based
	solely on the names and addresses of registered voters. Voter information is updated daily. If you
	feel there is any discrepancy in the provided information please feel free to contact us at (512)
	943-1630. <!--All fields are required.-->
</p>
<p>
	Voter registrations are effective 30 days after the submission of the application and may take 2-4
	weeks to be fully processed. This lookup is updated daily to reflect applications that are fully
	processed. If you have recently applied and do not see your name in the lookup, please check back
	daily.
</p>
<select name="electionDropdown" id="electionDropdown" bind:value={selectedElection}>
	{#each elections as election}
		<option value={election}>{election}</option>
	{/each}
</select><br />
<AnnouncementSection {selectedElection} {electionData} />
<div class="voterID">
	<input type="text" name="voterID" id="voterIDInput" /><br />
	<label for="voterIDInput">Voter ID</label>
</div>
<div class="or">or</div>
<div class="voterName">
	<div class="lastName">
		<input type="text" name="lastName" id="lastNameInput" /><br />
		<label for="lastNameInput">Last Name</label>
	</div>
	<div class="firstName">
		<input type="text" name="firstName" id="firstNameInput" /><br />
		<label for="firstNameInput">First Name</label>
	</div>
</div>
<div class="voterDOB">
	<select name="monthDropdown" id="monthDropdown">
		{#each months as month}
			<option value={month}>{month}</option>
		{/each}
	</select>
	<select name="dayDropdown" id="dayDropdown">
		{#each days as day}
			<option value={day}>{day}</option>
		{/each}
	</select>
	<select id="yearDropdown" name="yearDropdown">
		{#each years as year}
			<option value={year}>{year}</option>
		{/each}
	</select>
</div>
<button class="button button__blue" on:click={handSearch}>Search</button>
<div id="voterInfo"></div>
<h3>
	After you click the "Search" button, a list of matching names will appear below. You MUST click on
	your name to view your voter information and sample Ballot.
</h3>
<div class="bottomLinks">
	<a href="\#">Start a New Search</a>
	<a href="http://www.wilcotx.gov/elections">Williamson County Elections</a>
</div>

{#if searchResults.length > 0}
<section id="searchResults">
	<h2>Matching Voters</h2>
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

<style>
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
	}

	.button {
		margin-top: 1em;
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
</style>
