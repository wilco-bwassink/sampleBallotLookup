<script lang="ts">
  import { waitLocale, setLocale } from '$lib/i18n';
  import { browser } from '$app/environment';
  export let data: { lang: string };

  // If user has picked a language apply it asap
  if (browser) {
    const saved = localStorage.getItem('locale');
    if (saved) {
      setLocale(saved);
    }
  } 
  // Promise resolves once init() + current locale messages are loaded
  const ready = waitLocale();
</script>

<svelte:head>
  <meta property="og:locale" content={data.lang} />
</svelte:head>

{#await ready}
  <div style="padding:1rem">Loading…</div>
{:then}
  <slot />
{/await}