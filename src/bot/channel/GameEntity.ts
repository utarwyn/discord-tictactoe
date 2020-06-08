/**
 * Represents a game entity. Can be a real user or an AI.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default interface GameEntity {
    /**
     * Unique identifier of the entity.
     */
    id: string;
    /**
     * Display name of the entity.
     */
    displayName: string;

    /**
     * Generates the text to mention the entity into a Discord chat.
     */
    toString(): string;
}
