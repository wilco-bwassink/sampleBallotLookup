import type { LayoutLoad } from './$types';
import { initI18n, setLocale } from '$lib/i18n';

export const load: LayoutLoad = async ({ params }) => {
    const lang = (params.lang as string) ?? 'en';
    await initI18n(lang);
    await setLocale(lang);
    return { lang };
};