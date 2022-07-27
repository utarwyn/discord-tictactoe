import localize from '@i18n/localize';
import { ApplicationCommandManager, ApplicationCommandOptionType, Message } from 'discord.js';

/**
 * Manages application command used by the module.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default class AppCommandRegister {
    /**
     * Discord.js application command manager instance
     * @private
     */
    private readonly commandManager: ApplicationCommandManager;
    /**
     * Name of the application command to register
     * @private
     */
    private readonly name: string;
    /**
     * Name of the option to mention another user
     * @private
     */
    private readonly optionName: string;

    /**
     * Constructs application command registration handler.
     *
     * @param commandManager discord.js client instance
     * @param name application name to register
     * @param optionName name of the option to mention another user
     */
    constructor(commandManager: ApplicationCommandManager, name: string, optionName: string) {
        this.commandManager = commandManager;
        this.name = name;
        this.optionName = optionName;
    }

    /**
     * Handles messages to deploy or delete
     * the application command in a specific guild.
     *
     * @param message discord.js message object
     */
    public async handleDeployMessage(message: Message): Promise<void> {
        if (
            message.guild &&
            message.member &&
            message.client.user &&
            message.mentions.has(message.client.user) &&
            message.member.permissions.has('Administrator')
        ) {
            const words = message.content.split(' ');
            if (words.length === 2) {
                if (words.includes('tttdeploy')) {
                    await this.registerInGuild(message.guild.id);
                    await message.reply(`Command /${this.name} has been registered.`);
                } else if (words.includes('tttdelete')) {
                    const executed = await this.deleteInGuild(message.guild.id);
                    if (executed) {
                        await message.reply(`Command /${this.name} has been unregistered.`);
                    } else {
                        await message.reply(`Command /${this.name} not found.`);
                    }
                }
            }
        }
    }

    /**
     * Registers the application command into a guild.
     *
     * @param guildId guild identifier which will receive the command
     * @private
     */
    private async registerInGuild(guildId: string): Promise<void> {
        await this.commandManager.create(
            {
                name: this.name,
                description: localize.__('command.description'),
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: this.optionName,
                        description: localize.__('command.option-user')
                    }
                ]
            },
            guildId
        );
    }

    /**
     * Deletes the application command from a guild.
     *
     * @param guildId guild identifier in which the command will be deleted
     * @private
     */
    private async deleteInGuild(guildId: string): Promise<boolean> {
        const commands = await this.commandManager.fetch({ guildId });
        const command = commands?.find(cmd => cmd.name === this.name);

        if (command) {
            await this.commandManager.delete(command.id, guildId);
            return true;
        } else {
            return false;
        }
    }
}
