import TextMessagingTunnel from '@bot/messaging/TextMessagingTunnel';
import type { BaseMessageOptions, Message } from 'discord.js';

describe('TextMessagingTunnel', () => {
    const createTunnel = (origin: Message) => new TextMessagingTunnel(origin);
    const createMessage = (overrides = {}) => ({ member: { id: 'E1' }, ...overrides }) as Message;

    it('should retrieve origin message author', () => {
        const message = createMessage();
        expect(createTunnel(message).author).toBe(message.member);
    });

    it('should retrieve origin message channel', () => {
        const message = createMessage({ channel: { id: 'C1' } });
        expect(createTunnel(message).channel).toBe(message.channel);
    });

    it('should retrieve last reply in the tunnel', () => {
        const tunnel = createTunnel(createMessage());
        expect(tunnel.reply).toBeUndefined();

        tunnel['_reply'] = createMessage({ id: 'C1' });
        expect(tunnel.reply).toBe(tunnel['_reply']);
    });

    it('should reply to the origin message', async () => {
        const answer = <BaseMessageOptions>{ content: 'My reply' };
        const tunnel = createTunnel(createMessage({ channel: { send: vi.fn() } }));
        await tunnel.replyWith(answer);

        expect(tunnel.channel.send).toHaveBeenCalledWith(answer);
    });
});
