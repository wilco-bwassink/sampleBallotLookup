<script lang="ts">
  import { locale } from 'svelte-i18n';
  import { browser } from '$app/environment';

  // persist + keep <html lang> in sync
  $: if (browser && $locale) {
    localStorage.setItem('locale', $locale);
    document.documentElement.setAttribute('lang', $locale);
  }
</script>
<div>
<label for="lang" class="sr-only">Language</label>
<select id="lang" bind:value={$locale} aria-label="Language">
  <option value="en">English</option>
  <option value="es">Español</option>
</select>
</div>

    <style>
      div {
        display: flex;
        /* flex-direction: column; */
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: flex-end;
        gap: 0.5rem;
        /* width: 10svw; */

        label {
          align-self:center;
        }
      }
      select {
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
      }
      </style>