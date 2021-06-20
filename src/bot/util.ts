import { Util } from 'discord.js';

/**
 * Formats an entity name before displaying it to a message.
 *
 * @param name name of an entity to be formatted
 * @returns formatted name
 */
export const formatDiscordName = (name: string): string =>
    Util.removeMentions(name.replace(/`/g, ''));
