<script>
	export let selectedElection;
	export let electionData;

	function getCurrentAnnouncement() {
		const a = electionData?.[selectedElection]?.Announcement;
		return typeof a === 'string' && a.trim() ? a.trim() : null;
	}
</script>

{#if getCurrentAnnouncement()}
	<section class="announcements">
		<h2>Announcement</h2>
		<p>{getCurrentAnnouncement()}</p>
	</section>
{/if}

<style>
	.announcements {
		background: #f5f5f5;
		border-left: 5px solid #0075c2;
		padding: 0.25em 1em;
		margin-bottom: 1em;
	}
</style>
