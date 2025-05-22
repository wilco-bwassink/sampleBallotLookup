<script lang="ts">
	import { onMount } from 'svelte';
	import AnnouncementSection from '$lib/components/AnnouncementSection.svelte';

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

	const days = Array.from({ length: 31 }, (_, i) => i + 1);
	const currentYear = new Date().getFullYear();
	const startYear = currentYear - 18;
	const endYear = currentYear - 104;
	const years = [];

	for (let year = startYear; year >= endYear; year--) {
		years.push(year);
	}

	let electionData = {};
	let elections = [];
	let selectedElection = '';

	onMount(async () => {
		// const res = await fetch('/data/electionStatus.json');
		const res = await fetch('http://dev.wilco.org/sampleBallotAdmin/data/electionStatus.json');
		const data = await res.json();
		electionData = data;
		elections = Object.keys(data).filter((key) => data[key]?.IsActive === true);
	});

	// Search Handling
	async function handSearch() {
		const voterID = document.getElementById('voterIDInput')?.value?.trim();
		const lastName = document.getElementById('lastNameInput')?.value?.trim();
		const firstName = document.getElementById('firstNameInput')?.value?.trim();
		const dobMonth = document.getElementById('monthDropdown')?.value;
		const dobDay = document.getElementById('dayDropdown')?.value;
		const dobYear = document.getElementById('yearDropdown')?.value;

		const dob = `${dobYear}-${string(dobMonth).padStart(2, '0')} -${String(dobDay).padStart(2, '0')}`;

		const payload = voterID
			? { voterID }
			: firstName && lastName && dobYear && dobMonth && dobDay
				? { firstName, lastName, dob }
				: null;

		if (!payload) {
			alert('Please provide either your Voter ID or full Name and Date of Birth.');
			return;
		}

		const res = await fetch('/api/voter-search', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const data = await res.json();
		console.log(data);
	}
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
<button class="button button__blue">Search</button>
<div id="voterInfo"></div>
<h3>
	After you click the "Search" button, a list of matching names will appear below. You MUST click on
	your name to view your voter information and sample Ballot.
</h3>
<div class="bottomLinks">
	<a href="\#">Start a New Search</a>
	<a href="http://www.wilcotx.gov/elections">Williamson County Elections</a>
</div>

<style>
	.voterName {
		display: flex;
		gap: 1em;
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
</style>
