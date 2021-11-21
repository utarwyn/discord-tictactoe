import localize from '@i18n/localize';
import { Client, Message } from 'discord.js';

/**
 * Manages application command used by the module.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default class AppCommandRegister {
    /**
     * Discord.js client instance
     * @private
     */
    private readonly client: Client;
    /**
     * Name of the application command to rregister
     * @private
     */
    private readonly name: string;

    /**
     * Constructs application command registration handler.
     *
     * @param client discord.js client instance
     * @param name application name to register
     */
    constructor(client: Client, name: string) {
        this.client = client;
        this.name = name;
    }

    /**
     * Handles messages to deploy or delete
     * the application command in a specific guild.
     *
     * @param message discord.js message object
     */
    public async handleDeployMessage(message: Message): Promise<void> {
        if (message.guild && message.member && message.member.permissions.has('ADMINISTRATOR')) {
            if (message.content === '?tttdeploy') {
                await this.registerInGuild(message.guild.id);
                await message.reply(`Command /${this.name} has been registered.`);
            } else if (message.content === '?tttdelete') {
                const executed = await this.deleteInGuild(message.guild.id);
                if (executed) {
                    await message.reply(`Command /${this.name} has been unregistered.`);
                } else {
                    await message.reply(`Command /${this.name} not found.`);
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
        return (this.client['api'] as any)
            .applications(this.client.user!.id)
            .guilds(guildId)
            .commands.post({
                data: {
                    name: this.name,
                    description: localize.__('command.description'),
                    options: [
                        {
                            type: 6,
                            name: 'opponent',
                            description: localize.__('command.option-user')
                        }
                    ]
                }
            });
    }

    /**
     * Deletes the application command from a guild.
     *
     * @param guildId guild identifier in which the command will be deleted
     * @private
     */
    private async deleteInGuild(guildId: string): Promise<boolean> {
        // Firstly, retrieve command based on its name using Discord API
        const command = [
            ...(await (this.client['api'] as any)
                .applications(this.client.user!.id)
                .guilds(guildId)
                .commands.get())
        ].find((command: any) => command.name === this.name);

        // Delete it using Discord API if exists in the command list
        if (command) {
            await (this.client['api'] as any)
                .applications(this.client.user!.id)
                .guilds(guildId)
                .commands(command.id)
                .delete();
            return true;
        } else {
            return false;
        }
    }
}
