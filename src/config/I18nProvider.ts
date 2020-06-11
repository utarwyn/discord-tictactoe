import i18n from 'i18n';
import fs from 'fs';
import path from 'path';
import { I18n, Replacements } from './I18n';

/**
 * Default implementation to translate messages.
 * Use the npm package "i18n" and load messages from locale files.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class I18nProvider implements I18n {
    constructor() {
        const localesPath = path.join(__dirname, '..', '..', '..', 'config', 'locales');
        const files = fs.readdirSync(localesPath);

        i18n.configure({
            locales: files.map(file => path.basename(file, '.json')),
            defaultLocale: 'en',
            directory: localesPath,
            objectNotation: true,
            updateFiles: false
        });
    }

    setLanguage(locale: string): void {
        i18n.setLocale(locale);
    }

    __(id: string, replacements?: Replacements): string {
        return this.translate(id, replacements);
    }

    getLanguage(): string {
        return i18n.getLocale();
    }

    translate(id: string, replacements?: Replacements): string {
        return i18n.__mf(id, replacements);
    }
}
