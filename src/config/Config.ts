/**
 * Contains the needed configuration values to start the bot.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default interface Config {
    token?: string;
    language?: string;
    command?: string;
    requestExpireTime?: number;
    gameExpireTime?: number;
}
