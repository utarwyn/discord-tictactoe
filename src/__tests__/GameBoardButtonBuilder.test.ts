import GameBoardButtonBuilder from '@bot/builder/GameBoardButtonBuilder';
import localize from '@i18n/localize';
import AI from '@tictactoe/AI';
import { Player } from '@tictactoe/Player';
import { ActionRow, ButtonComponent } from 'discord.js';

jest.mock('@tictactoe/AI');

describe('GameBoardButtonBuilder', () => {
    let builder: GameBoardButtonBuilder;

    beforeAll(() => {
        localize.loadFromLocale('en');
    });

    beforeEach(() => {
        builder = new GameBoardButtonBuilder();
    });

    it('should send empty message by default', () => {
        expect(builder.toMessageOptions()).toEqual({ content: '', components: [] });
    });

    it('should compute board components', () => {
        const options = builder
            .withBoard(2, [Player.First, Player.None, Player.None, Player.Second])
            .toMessageOptions();

        expect(options.components).toHaveLength(2);
        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components).toHaveLength(2);
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components).toHaveLength(2);
        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components[0].label).toBe('X');
        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components[1].label).toBe(' ');
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components[0].label).toBe(' ');
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components[1].label).toBe('O');
    });

    it('should compute board using custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:')
            .withBoard(2, [Player.First, Player.Second, Player.Second, Player.First])
            .toMessageOptions();

        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components[0].emoji?.name).toBe('dog');
        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components[1].emoji?.name).toBe('cat');
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components[0].emoji?.name).toBe('cat');
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components[1].emoji?.name).toBe('dog');
    });

    it.each`
        entity                        | state
        ${undefined}                  | ${''}
        ${new AI()}                   | ${':robot: AI is playing, please wait...'}
        ${{ toString: () => 'fake' }} | ${'fake, select your move:'}
    `('should set state based if playing entity is $entity', ({ entity, state }) => {
        builder.withEntityPlaying(entity);
        expect(builder.toMessageOptions()).toEqual({ content: state, components: [] });
    });

    it('should compute board using disabled buttons after been used', () => {
        const options = builder
            .withButtonsDisabledAfterUse()
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.None])
            .toMessageOptions();

        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components[0].disabled).toBeTruthy();
        expect((<ActionRow<ButtonComponent>>options.components![0]).toJSON().components[1].disabled).toBeTruthy();
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components[0].disabled).toBeFalsy();
        expect((<ActionRow<ButtonComponent>>options.components![1]).toJSON().components[1].disabled).toBeFalsy();
    });
});
