import { I18nProvider, Replacements } from '@i18n/I18nProvider';

const provider = new I18nProvider();

const loadFromLocale = (locale?: string): void => provider.loadFromLocale(locale);
const __ = (id: string, replacements?: Replacements): string => provider.__(id, replacements);

export default { loadFromLocale, __ };
