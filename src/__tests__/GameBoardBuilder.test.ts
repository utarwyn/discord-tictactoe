import GameBoardBuilder from '@bot/builder/GameBoardBuilder';
import localize from '@i18n/localize';
import AI from '@tictactoe/AI';
import { Player } from '@tictactoe/Player';

jest.mock('@tictactoe/AI');

describe('GameBoardBuilder', () => {
    let builder: GameBoardBuilder;

    beforeAll(() => {
        localize.loadFromLocale('en');
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
        builder.withTitle({ id: '1', displayName: 'entity1' }, { id: '2', displayName: 'entity2' });
        expect(builder.toMessageOptions()).toEqual(
            expect.objectContaining({ content: ':game_die: `entity1` **VS** `entity2`\n\n' })
        );
    });

    it('should compute board using custom emojies', () => {
        builder
            .withEmojies(':dog:', ':cat:')
            .withBoard(2, [Player.First, Player.Second, Player.Second, Player.First]);

        expect(builder.toMessageOptions()).toEqual(
            expect.objectContaining({ content: ':dog: :cat: \n:cat: :dog: \n' })
        );
    });

    it('should add an empty line between board and state if both defined', () => {
        builder.withBoard(1, [Player.None]).withEntityPlaying();
        expect(builder.toMessageOptions().content).toContain('\n');
    });

    it.each`
        entity                        | state
        ${undefined}                  | ${'Reactions are loading, please wait...'}
        ${new AI()}                   | ${':robot: AI is playing, please wait...'}
        ${{ toString: () => 'fake' }} | ${'fake, select your move:'}
    `('should set state based if playing entity is $entity', ({ entity, state }) => {
        builder.withEntityPlaying(entity);
        expect(builder.toMessageOptions()).toEqual(expect.objectContaining({ content: state }));
    });

    it.each`
        entity                        | state
        ${undefined}                  | ${"No one won the game, it's a tie! Let's try again?"}
        ${{ toString: () => 'fake' }} | ${':tada: fake has won the game!'}
    `('should set state based if winning entity is $entity', ({ entity, state }) => {
        builder.withEndingMessage(entity);
        expect(builder.toMessageOptions()).toEqual(expect.objectContaining({ content: state }));
    });
});
