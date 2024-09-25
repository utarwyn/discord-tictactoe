import TextMessagingTunnel from '@bot/messaging/TextMessagingTunnel';
import { BaseMessageOptions, GuildMember, Message, TextChannel } from 'discord.js';

describe('TextMessagingTunnel', () => {
    const createTunnel = (origin: Message) => new TextMessagingTunnel(origin);

    it('should retrieve origin message author', () => {
        const message = <Message>{ member: <GuildMember>{ id: 'E1' } };
        expect(createTunnel(message).author).toBe(message.member);
    });

    it('should retrieve origin message channel', () => {
        const message = <Message>{ channel: <TextChannel>{ id: 'C1' } };
        expect(createTunnel(message).channel).toBe(message.channel);
    });

    it('should retrieve last reply in the tunnel', () => {
        const tunnel = createTunnel(<Message>{});
        expect(tunnel.reply).toBeUndefined();

        tunnel['_reply'] = <Message>{ id: 'C1' };
        expect(tunnel.reply).toBe(tunnel['_reply']);
    });

    it('should reply to the origin message', async () => {
        const answer = <BaseMessageOptions>{ content: 'My reply' };
        const tunnel = createTunnel(<Message>{ channel: { send: jest.fn() as unknown } });
        await tunnel.replyWith(answer);

        expect(tunnel.channel.send).toHaveBeenCalledWith(answer);
    });
});
