import { register, init, getLocaleFromNavigator, locale as $locale, waitLocale } from 'svelte-i18n';

register('en', () => import('$lib/locales/en.json'));
register('es', () => import('$lib/locales/es.json'));

let initialized = false;

export async function initI18n(initialLocale = 'en') {
    if (initialized) return;

    init({
        fallbackLocale: 'en',
        initialLocale: initialLocale,
        warnOnMissingMessages: true
    });

    await waitLocale();
    initialized = true;
}

export async function setLocale(lang: string) {
    if (!initialized) await initI18n(lang);
$locale.set(lang);
await waitLocale();
}

export { waitLocale };