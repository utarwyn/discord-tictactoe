import GameBoardButtonBuilder from '@bot/builder/GameBoardButtonBuilder';
import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import { Player } from '@tictactoe/Player';
import { ButtonComponent } from 'discord.js';

jest.mock('@tictactoe/ai/AI');

describe('GameBoardButtonBuilder', () => {
    let builder: GameBoardButtonBuilder;

    const getButton = (options: any, row: number, col: number) =>
        options.components[row].components[col].toJSON() as ButtonComponent;

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
        expect(getButton(options, 0, 0).label).toBe('X');
        expect(getButton(options, 0, 1).label).toBe('-');
        expect(getButton(options, 1, 0).label).toBe('-');
        expect(getButton(options, 1, 1).label).toBe('O');
    });

    it('should compute board using two custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:')
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.First])
            .toMessageOptions();

        expect(getButton(options, 0, 0).emoji?.name).toBe('dog');
        expect(getButton(options, 0, 1).emoji?.name).toBe('cat');
        expect(getButton(options, 1, 0).emoji?.name).toBeUndefined();
        expect(getButton(options, 1, 1).emoji?.name).toBe('dog');
    });

    it('should compute board using three custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:', ':square:')
            .withBoard(2, [Player.First, Player.None, Player.Second, Player.None])
            .toMessageOptions();

        expect(getButton(options, 0, 0).emoji?.name).toBe('dog');
        expect(getButton(options, 0, 1).emoji?.name).toBe('square');
        expect(getButton(options, 1, 0).emoji?.name).toBe('cat');
        expect(getButton(options, 1, 1).emoji?.name).toBe('square');
    });

    it('should do nothing when a loading message is added', () => {
        const options = builder.withLoadingMessage().toMessageOptions();
        expect(options.content).toBe('');
    });

    it.each`
        entity                        | state
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

        expect(getButton(options, 0, 0).disabled).toBeTruthy();
        expect(getButton(options, 0, 1).disabled).toBeTruthy();
        expect(getButton(options, 1, 0).disabled).toBeFalsy();
        expect(getButton(options, 1, 1).disabled).toBeFalsy();
    });

    it('should disable all buttons if game has ended', () => {
        const options = builder
            .withButtonsDisabledAfterUse()
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.None])
            .withEndingMessage()
            .toMessageOptions();

        expect(getButton(options, 0, 0).disabled).toBeTruthy();
        expect(getButton(options, 0, 1).disabled).toBeTruthy();
        expect(getButton(options, 1, 0).disabled).toBeTruthy();
        expect(getButton(options, 1, 1).disabled).toBeTruthy();
    });

    it('should use an embed if configured to use it', () => {
        const color = 16711680;
        const options = builder.withEmbed(color).toMessageOptions();
        expect(options.content).toBeUndefined();
        expect(options.embeds).toHaveLength(1);
        expect((options.embeds![0] as any).color).toBe(color);
    });
});
