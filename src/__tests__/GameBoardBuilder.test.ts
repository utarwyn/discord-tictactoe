import GameBoardBuilder from '@bot/builder/GameBoardBuilder';
import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import { Player } from '@tictactoe/Player';

jest.mock('@i18n/localize');
jest.mock('@tictactoe/ai/AI');

describe('GameBoardBuilder', () => {
    let builder: GameBoardBuilder;

    beforeAll(() => {
        jest.spyOn(localize, '__').mockImplementation(t => t);
    });

    beforeEach(() => {
        builder = new GameBoardBuilder();
    });

    it('should send empty message by default', () => {
        expect(builder.toMessageOptions()).toEqual({
            allowedMentions: { parse: ['users'] },
            content: '',
            components: []
        });
    });

    it('should compute title based on entity names', () => {
        const spyLocalize = jest.spyOn(localize, '__');
        builder.withTitle({ id: '1', displayName: 'entity1' }, { id: '2', displayName: 'entity2' });
        expect(builder.toMessageOptions()).toEqual(
            expect.objectContaining({ content: 'game.title\n\n' })
        );
        expect(spyLocalize).toHaveBeenCalledWith('game.title', {
            player1: 'entity1',
            player2: 'entity2'
        });
    });

    it('should compute board using two custom emojies', () => {
        builder
            .withEmojies(':dog:', ':cat:')
            .withBoard(2, [Player.First, Player.None, Player.Second, Player.First]);

        expect(builder.toMessageOptions()).toEqual(
            expect.objectContaining({ content: ':dog: ⬜ \n:cat: :dog: \n' })
        );
    });

    it('should compute board using three custom emojies', () => {
        builder
            .withEmojies(':dog:', ':cat:', ':square:')
            .withBoard(2, [Player.First, Player.None, Player.None, Player.Second]);

        expect(builder.toMessageOptions()).toEqual(
            expect.objectContaining({ content: ':dog: :square: \n:square: :cat: \n' })
        );
    });

    it('should add an empty line between board and state if both defined', () => {
        builder.withBoard(1, [Player.None]).withEntityPlaying();
        expect(builder.toMessageOptions().content).toContain('\n');
    });

    it.each`
        entity                        | state                | stateParams
        ${undefined}                  | ${'game.load'}       | ${[]}
        ${new AI()}                   | ${'game.waiting-ai'} | ${[]}
        ${{ toString: () => 'fake' }} | ${'game.action'}     | ${[{ player: 'fake' }]}
    `('should set state based on playing entity $entity', ({ entity, state, stateParams }) => {
        const spyLocalize = jest.spyOn(localize, '__');
        builder.withEntityPlaying(entity);
        expect(builder.toMessageOptions()).toEqual(expect.objectContaining({ content: state }));
        expect(spyLocalize).toHaveBeenCalledWith(state, ...stateParams);
    });

    it.each`
        entity                        | state         | stateParams
        ${undefined}                  | ${'game.end'} | ${[]}
        ${{ toString: () => 'fake' }} | ${'game.win'} | ${[{ player: 'fake' }]}
    `('should set state based on winning entity $entity', ({ entity, state, stateParams }) => {
        const spyLocalize = jest.spyOn(localize, '__');
        builder.withEndingMessage(entity);
        expect(builder.toMessageOptions()).toEqual(expect.objectContaining({ content: state }));
        expect(spyLocalize).toHaveBeenCalledWith(state, ...stateParams);
    });

    it('should set state based if game has expired', () => {
        builder.withExpireMessage();
        expect(builder.toMessageOptions()).toEqual(
            expect.objectContaining({ content: 'game.expire', embeds: undefined })
        );
    });

    it('should use an embed if configured to use it', () => {
        const color = 16711680;
        const options = builder.withExpireMessage().withEmbed(color).toMessageOptions();
        expect(options.content).toBeUndefined();
        expect(options.embeds).toHaveLength(1);
        expect((options.embeds![0] as any).color).toBe(color);
    });
});
