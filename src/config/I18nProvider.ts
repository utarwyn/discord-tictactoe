import { I18n } from 'i18n';
import fs from 'fs';
import path from 'path';

/**
 * Default implementation to translate messages.
 * Use the npm package "i18n" and load messages from locale files.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export class I18nProvider {
    private readonly instance: I18n;

    constructor() {
        const localesPath = path.join(__dirname, '..', '..', '..', 'config', 'locales');
        const files = fs.readdirSync(localesPath);

        this.instance = new I18n();
        this.instance.configure({
            locales: files.map(file => path.basename(file, '.json')),
            defaultLocale: 'en',
            directory: localesPath,
            objectNotation: true,
            updateFiles: false
        });
    }

    setLanguage(locale: string): void {
        this.instance.setLocale(locale);
    }

    __(id: string, replacements?: Replacements): string {
        return this.translate(id, replacements);
    }

    getLanguage(): string {
        return this.instance.getLocale();
    }

    translate(id: string, replacements?: Replacements): string {
        return this.instance.__mf(id, replacements);
    }
}

/**
 * Allows to define some replacements when translating a text.
 */
export interface Replacements {
    [key: string]: string | number | string[];
}
