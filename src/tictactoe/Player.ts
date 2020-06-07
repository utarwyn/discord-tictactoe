/**
 * Represents a player during a game.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export const enum Player {
    None,
    First,
    Second
}

/**
 * Calculates the next user that have to play.
 *
 * @param player player object
 */
export function nextPlayer(player: Player): Player {
    if (player == Player.None) {
        return player;
    } else if (player == Player.First) {
        return Player.Second;
    } else {
        return Player.First;
    }
}
