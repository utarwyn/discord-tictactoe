/**
 * Interface to communicate with an i18n package.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export interface I18n {
    getLanguage(): string;

    setLanguage(locale: string): void;

    translate(id: string, replacements?: Replacements): string;

    __(id: string, replacements?: Replacements): string;
}

/**
 * Allows to define some replacements when translating a text.
 */
export interface Replacements {
    [key: string]: string | number | string[];
}
