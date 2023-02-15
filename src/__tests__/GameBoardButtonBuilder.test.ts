import GameBoardButtonBuilder from '@bot/builder/GameBoardButtonBuilder';
import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import { Player } from '@tictactoe/Player';
import { MessageButton } from 'discord.js';

jest.mock('@tictactoe/ai/AI');

describe('GameBoardButtonBuilder', () => {
    let builder: GameBoardButtonBuilder;

    beforeAll(() => {
        localize.loadFromLocale('en');
    });

    beforeEach(() => {
        builder = new GameBoardButtonBuilder();
    });

    it('should send empty message by default', () => {
        expect(builder.toMessageOptions()).toEqual({ content: '', components: [], embeds: [] });
    });

    it('should compute board components', () => {
        const options = builder
            .withBoard(2, [Player.First, Player.None, Player.None, Player.Second])
            .toMessageOptions();

        expect(options.components).toHaveLength(2);
        expect(options.components![0].components).toHaveLength(2);
        expect(options.components![1].components).toHaveLength(2);
        expect((options.components![0].components[0] as MessageButton).label).toBe('X');
        expect((options.components![0].components[1] as MessageButton).label).toBe('-');
        expect((options.components![1].components[0] as MessageButton).label).toBe('-');
        expect((options.components![1].components[1] as MessageButton).label).toBe('O');
    });

    it('should compute board using two custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:')
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.First])
            .toMessageOptions();

        expect((options.components![0].components[0] as MessageButton).emoji?.name).toBe('dog');
        expect((options.components![0].components[1] as MessageButton).emoji?.name).toBe('cat');
        expect((options.components![1].components[0] as MessageButton).emoji?.name).toBeUndefined();
        expect((options.components![1].components[1] as MessageButton).emoji?.name).toBe('dog');
    });

    it('should compute board using three custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:', ':square:')
            .withBoard(2, [Player.First, Player.None, Player.Second, Player.None])
            .toMessageOptions();

        expect((options.components![0].components[0] as MessageButton).emoji?.name).toBe('dog');
        expect((options.components![0].components[1] as MessageButton).emoji?.name).toBe('square');
        expect((options.components![1].components[0] as MessageButton).emoji?.name).toBe('cat');
        expect((options.components![1].components[1] as MessageButton).emoji?.name).toBe('square');
    });

    it.each`
        entity                        | state
        ${undefined}                  | ${''}
        ${new AI()}                   | ${':robot: AI is playing, please wait...'}
        ${{ toString: () => 'fake' }} | ${'fake, select your move:'}
    `('should set state based if playing entity is $entity', ({ entity, state }) => {
        builder.withEntityPlaying(entity);
        expect(builder.toMessageOptions()).toEqual({ content: state, components: [], embeds: [] });
    });

    it('should compute board using disabled buttons after been used', () => {
        const options = builder
            .withButtonsDisabledAfterUse()
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.None])
            .toMessageOptions();

        expect((options.components![0].components[0] as MessageButton).disabled).toBeTruthy();
        expect((options.components![0].components[1] as MessageButton).disabled).toBeTruthy();
        expect((options.components![1].components[0] as MessageButton).disabled).toBeFalsy();
        expect((options.components![1].components[1] as MessageButton).disabled).toBeFalsy();
    });

    it('should disable all buttons if game has ended', () => {
        const options = builder
            .withButtonsDisabledAfterUse()
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.None])
            .withEndingMessage()
            .toMessageOptions();

        expect((options.components![0].components[0] as MessageButton).disabled).toBeTruthy();
        expect((options.components![0].components[1] as MessageButton).disabled).toBeTruthy();
        expect((options.components![1].components[0] as MessageButton).disabled).toBeTruthy();
        expect((options.components![1].components[1] as MessageButton).disabled).toBeTruthy();
    });

    it('should use an embed if configured to use it', () => {
        const color = '#00ff00';
        const options = builder.withEmbed(color).toMessageOptions();
        expect(options.content).toBeUndefined();
        expect(options.embeds).toHaveLength(1);
        expect(options.embeds![0].color).toBe(color);
    });
});
