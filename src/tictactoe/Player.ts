/**
 * Represents a player during a game.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export const enum Player {
    None,
    First,
    Second
}

/**
 * Stores the type of a game player when
 * computing its score when playing against the computer.
 */
export const enum PlayerComputeType {
    Human = -1,
    None = 0,
    Computer = +1
}

/**
 * Calculates the next user that have to play.
 *
 * @param player player object
 */
export function getOpponent(player: Player): Player {
    if (player === Player.None) {
        return player;
    } else if (player === Player.First) {
        return Player.Second;
    } else {
        return Player.First;
    }
}
