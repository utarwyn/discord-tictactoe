import fs from 'fs';
import path from 'path';

/**
 * Default implementation to translate messages.
 * Can load messages from integrated or external locale files.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export class I18nProvider {
    /**
     * Users must use this prefix in order to use an external file
     */
    private static readonly FILEPATH_PREFIX = 'file:';
    /**
     * Key of the default locale of the module
     */
    private static readonly DEFAULT_LOCALE = 'en';

    /**
     * Collection with paths of integrated locales in the module
     */
    private availableLocales: Map<string, string>;
    /**
     * Collection of all locale messages loaded from a language file
     */
    private localeData?: Record<string, string>;

    constructor() {
        const workingDirectory = global.__dirname ?? __dirname;
        const localesPath = path.join(workingDirectory, '..', '..', '..', 'config', 'locales');

        this.availableLocales = new Map(
            fs
                .readdirSync(localesPath)
                .map(file => [path.basename(file, '.json'), path.resolve(localesPath, file)])
        );
    }

    /**
     * Loads module messages from an internal or external file.
     *
     * @param locale locale key or language file to load
     */
    loadFromLocale(locale?: string): void {
        let filepath = this.availableLocales.get(locale ?? I18nProvider.DEFAULT_LOCALE);
        let loaded = filepath !== undefined;

        if (!loaded && locale && locale.startsWith(I18nProvider.FILEPATH_PREFIX)) {
            filepath = path.resolve(
                process.cwd(),
                locale.slice(I18nProvider.FILEPATH_PREFIX.length)
            );
        }

        try {
            if (filepath) {
                this.localeData = I18nProvider.flatten(
                    JSON.parse(fs.readFileSync(filepath, 'utf-8'))
                );
                loaded = true;
            }
        } catch (e) {
            // ignored
        }

        if (!loaded) {
            this.loadFromLocale(I18nProvider.DEFAULT_LOCALE);
            console.warn(`Cannot load language file ${filepath ?? locale}. Using default one.`);
        }
    }

    /**
     * Computes a translated message based
     * on its key using replacements if provided.
     *
     * @param key flatten message key
     * @param replacements collection of replacement to operate on the message
     * @returns translated message using replacements
     */
    __(key: string, replacements?: Replacements): string {
        if (this.localeData && this.localeData[key]) {
            let message = this.localeData[key];

            if (replacements) {
                Object.entries(replacements).forEach(replacement => {
                    message = message.replace(`{${replacement[0]}}`, replacement[1].toString());
                });
            }

            return message;
        } else {
            console.warn(`Cannot find language key ${key}. Using key instead.`);
            return key;
        }
    }

    private static flatten<T extends Record<string, any>>(
        object: T,
        objectPath: string | null = null,
        separator = '.'
    ): T {
        return Object.keys(object).reduce((acc: T, key: string): T => {
            const newObjectPath = [objectPath, key].filter(Boolean).join(separator);
            return typeof object?.[key] === 'object'
                ? { ...acc, ...I18nProvider.flatten(object[key], newObjectPath, separator) }
                : { ...acc, [newObjectPath]: object[key] };
        }, {} as T);
    }
}

/**
 * Allows to define some replacements when translating a text.
 */
export interface Replacements {
    [key: string]: string | number | string[];
}
