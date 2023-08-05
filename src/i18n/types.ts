/**
 * Represents a collection of replacements when translating a text.
 */
export type Replacements = { [key: string]: string | number | string[] };

/**
 * Represents a message provider added programmatically.
 */
export type MessageProvider = () => string;
