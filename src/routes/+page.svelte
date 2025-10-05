<script lang="ts">
  import { onMount } from 'svelte';
  import AnnouncementSection from '$lib/components/AnnouncementSection.svelte';
  import LanguageToggle from '$lib/components/LanguageToggle.svelte';
  import { t, isLoading, locale, waitLocale } from 'svelte-i18n';
  import { showToast } from '$lib/toast';

  // wait for i18n to initialize
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

  // settings payload (global admin text + flag)
  let settings = { EnglishText: '', SpanishText: '', ShowSampleBallot: false };

  // month dropdown using localization
  function buildMonths(loc: string | undefined, width: 'long' | 'short' | 'narrow' = 'long') {
    const fmt = new Intl.DateTimeFormat(loc || 'en', { month: width });
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: fmt.format(new Date(2000, i, 1))
    }));
  }

  $: months = buildMonths($locale ?? undefined, 'long');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 18;
  const endYear = currentYear - 104;
  const years: number[] = [];
  for (let year = startYear; year >= endYear; year--) years.push(year);

  // election data typing to match your JSON shape
  type ElectionRecord = {
    IsActive?: boolean;
    ElectionNameSpanish?: string;
    Announcement?: string;
    AnnouncementSpanish?: string;
    // ...any other fields you may add
  };

  let electionData: Record<string, ElectionRecord> = {};
  let elections: string[] = [];
  let selectedElection = '0';

  // voter search results
  let searchResults: Array<{ IDNUMBER: string; NAME: string; ADDRESS: string }> = [];

  // fetch elections + settings (single block)
  onMount(async () => {
    try {
      const [res, settingsRes] = await Promise.all([
        fetch('http://dev.wilco.org/voterlookup/api/proxy-election-data'),
        fetch('http://dev.wilco.org/voterlookup/api/proxy-admin-settings')
      ]);
      const [data, settingsJson] = await Promise.all([res.json(), settingsRes.json()]);
      settings = settingsJson || settings;

      if ('error' in data) {
        console.error('Error from API', (data as any).error);
        alert('Failed to load election data. Please try again later.');
        return;
      }

      electionData = data;
      elections = Object.keys(data).filter((key) => data[key]?.IsActive === true);
    } catch (err) {
      console.error('Fetch error', err);
      alert('Unable to connect to the election server.');
    }
  });

  // locale helpers
  $: isES = $locale?.toLowerCase().startsWith('es');

  // show Spanish label when Spanish is active; keep key as value
  function getElectionLabel(key: string): string {
    const rec = electionData?.[key];
    if (!rec) return key;
    return isES ? (rec.ElectionNameSpanish || key) : key;
  }

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
        alert(data.error);
        return;
      }

      searchResults = data.voters || [];

      const count = Array.isArray(searchResults) ? searchResults.length : 0;
      if (count > 0) {
        showToast(`${count} result${count === 1 ? '' : 's'} found`);
      } else {
        showToast('No matching voters found', 2500);
      }
      console.log('Search results:', data);
    } catch (err) {
      console.error('Search failed:', err);
      alert('Search request failed. Please try again.');
    }
  }

  // debug
  $: console.log('locale=', $locale, 'loading=', $isLoading, 'title=', $t('site.title'));
</script>

{#if ready}
  <header>
    <img src="https://apps.wilco.org/utils/wilcoMark.svg" width="100px" alt="Williamson County W Logo" />
    <h1>{$t('site.title')}</h1>
    <div class="languageToggle"><LanguageToggle available={['en', 'es']} /></div>
  </header>

  <p>{$t('nav.directions')}</p>

  {#if settings.ShowSampleBallot}
    <h2>{$t('nav.electionSelect')}</h2>
    <select
      name="electionDropdown"
      id="electionDropdown"
      bind:value={selectedElection}
      title="Election Drop-down"
      required
    >
      <option value="0">{ $t('nav.selectElection') || 'Select an Election' }</option>
      {#each elections as electionKey}
        <option value={electionKey}>{getElectionLabel(electionKey)}</option>
      {/each}
    </select>
    <br />
    <AnnouncementSection {selectedElection} {electionData} />
  {/if}

  <div class="searchShell">
    <div class="searchSection">
      <div id="nameDOBSection">
        <h4>{$t('voterInfo.nameTitle')}</h4>
        <div class="voterName">
          <div class="firstName">
            <input type="text" name="firstName" id="firstNameInput" title="First Name Input" /><br />
            <label for="firstNameInput">{$t('voterInfo.firstName')}</label>
          </div>
          <div class="lastName">
            <input type="text" name="lastName" id="lastNameInput" title="Last Name Input" /><br />
            <label for="lastNameInput">{$t('voterInfo.lastName')}</label>
          </div>
        </div>

        <h4>{$t('voterInfo.dob')}</h4>
        <div class="voterDOB">
          <div class="voterDOBelement">
          <select name="monthDropdown" id="monthDropdown" title="Voter Birth Month Drop-down">
            {#each months as m}
              <option value={m.value}>{m.label}</option>
            {/each}
          </select>
          <label for="monthDropdown">{$t('voterInfo.month')}</label>
          </div>
          <div class="voterDOBelement">
          <select name="dayDropdown" id="dayDropdown" title="Voter Birth Day Drop-down">
            {#each days as day}
              <option value={day}>{day}</option>
            {/each}
          </select>
          <label for="dayDropdown">{$t('voterInfo.day')}</label>
          </div>
          <div class="voterDOBelement">
          <select id="yearDropdown" name="yearDropdown" title="Voter Birth Year Drop-down">
            {#each years as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
          <label for="yearDropdown">{$t('voterInfo.year')}</label>
        </div>
        </div>
      </div>

      <div class="or">{$t('voterInfo.or')}</div>

      <div id="voterIDSection">
        <h4>{$t('voterInfo.vuidTitle')}</h4>
        <div class="voterID">
          <input type="text" name="voterID" id="voterIDInput" title="Voter ID Input" /><br />
          <label for="voterIDInput">{$t('voterInfo.vuid')}</label>
        </div>
      </div>
    </div>
  </div>

  <button class="button button__blue" on:click={handSearch}>{$t('voterInfo.search')}</button>

  <div id="voterInfo"></div>

  <h3>{$t('searchResults.title')}</h3>

  <div class="bottomLinks">
    <!-- <a href="#">{$t('nav.newSearch')}</a> -->
    <a href="http://www.wilcotx.gov/elections">{$t('nav.electionsLink')}</a>
  </div>

  {#if searchResults.length > 0}
    <section id="searchResults">
      <h2>{$t('nav.matchingVoters')}</h2>
      <ul>
        {#each searchResults as voter}
          <li class="voterDetails">
            <p class="voterInfo">
              <a
                href={`http://dev.wilco.org/voterlookup/${voter.IDNUMBER}?electionID=${selectedElection}`}
                target="_blank"
                rel="noopener noreferrer"
              >{voter.NAME}</a>
            </p>
            <p class="voterInfo">{voter.ADDRESS}</p>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- Global admin info (already localized via CSS lang switch) -->
  <section>
    <div class="adminInfo englishInfo">
      {@html settings.EnglishText.replace(/\r\n/g, '<br><br>')}
    </div>
    <div class="adminInfo spanishInfo">
      {@html settings.SpanishText.replace(/\r\n/g, '<br><br>')}
    </div>
  </section>
{:else}
  <p>Loading...</p>
{/if}

<style>
  /* Container queries */
  .searchShell {
    container: shell / inline-size;
  }

  @container shell (width <= 700px) {
    .searchSection {
      flex-direction: column;
      align-items: stretch;
    }

    .searchSection > * {
      inline-size: 100%;
    }

    .or {
      text-align: center;
      margin-block: 0.75em;
      font-size: 1.5em;
    }
  }

  @container shell (width >= 700px) {
    .searchSection {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .searchSection {
    display: flex;
    justify-content: space-around;
    gap: 1.25rem;
  }

  .searchSection > * {
    flex: 1 1 0;
    min-inline-size: 16rem;
  }

  .searchSection .or {
    align-self: center;
    font-weight: 700;
    text-align: center;
    font-size: 1.5em;
  }

  #nameDOBSection {
    container: name / inline-size;
  }

  #nameDOBSection .voterName {
    display: flex;
    gap: 1em;
  }

  #nameDOBSection .voterDOB {
    display: flex;
    gap: 0.75em;
  }

  @container name (width <= 480px) {
    #nameDOBSection .voterName {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5em;
    }
    #nameDOBSection .voterDOB {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5em;
    }
  }

  @container name (width >= 640px) {
    #nameDOBSection .voterDOB {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75em;
    }
  }

  #voterIDSection {
    container: vuid / inline-size;
  }

  @container vuid (width <= 420px) {
    #voterIDSection .voterID {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    #voterIDSection input {
      min-width: 0;
    }
  }

  header {
    container: header / inline-size;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    flex-direction: row;
    justify-content: space-between;
  }

  header img {
    flex-shrink: 0;
  }

  header h1 {
    font-size: 1.5rem;
    line-height: 1.2;
    flex: 1;
  }

  header .languageToggle {
    margin-left: auto;
  }

  @container header (width <= 600px) {
    header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    header h1 {
      font-size: 1.25rem;
      margin-block: 0.5rem;
    }

    header .languageToggle {
      margin-left: 0;
      position: static;
      width: 150px;
    }
  }

  @container header (width > 1000px) {
    header h1 {
      font-size: 2rem;
    }
  }

  .voterInfo {
    text-transform: capitalize;
  }

  .voterDOBelement {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }
  .bottomLinks {
    display: flex;
    gap: 1em;
  }

  .button {
    margin-top: 1em;
    padding: 0.3em;
  }

  #searchResults {
    margin-top: 2em;
    background-color: #fff;
    border-radius: 8px;
    padding: .5em;
  }

  #searchResults ul {
    list-style-type: none;
    padding: 0;
  }

  #searchResults li {
    margin-bottom: 1em;
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

  .spanishInfo {
    display: none;
  }

  :global(html[lang='es']) .englishInfo {
    display: none;
  }
  :global(html[lang='es']) .spanishInfo {
    display: block;
  }
</style>
