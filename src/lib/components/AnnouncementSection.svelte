<script>
  import { locale } from 'svelte-i18n';

  export let selectedElection;
  export let electionData;

  $: isES = $locale?.toLowerCase().startsWith('es');

  function pickAnnouncement(rec) {
    if (!rec) return null;
    const es = typeof rec.AnnouncementSpanish === 'string' ? rec.AnnouncementSpanish.trim() : '';
    const en = typeof rec.Announcement === 'string' ? rec.Announcement.trim() : '';
    return (isES ? (es || en) : (en || es)) || null;
  }

  $: currentAnnouncement = pickAnnouncement(electionData?.[selectedElection]);
</script>

{#if currentAnnouncement}
  <section class="announcements" aria-live="polite">
    <h2>{isES ? 'Anuncio' : 'Announcement'}</h2>
    <p>{currentAnnouncement}</p>
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
