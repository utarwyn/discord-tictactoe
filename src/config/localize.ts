import { I18nProvider, Replacements } from '@config/I18nProvider';

const provider = new I18nProvider();

const getLanguage = (): string => provider.getLanguage();
const setLanguage = (locale: string): void => provider.setLanguage(locale);
const translate = (id: string, replacements?: Replacements): string =>
    provider.translate(id, replacements);
const __ = (id: string, replacements?: Replacements): string => provider.__(id, replacements);

export default { getLanguage, setLanguage, translate, __ };
