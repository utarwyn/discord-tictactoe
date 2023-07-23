import Entity from '@tictactoe/Entity';

/**
 * Supported type of events
 */
export type EventTypes = {
    newGame: (data: { players: Entity[] }) => void;
    win: (data: { winner: Entity; loser: Entity }) => void;
    tie: (data: { players: Entity[] }) => void;
};

/**
 * Handles events emitted during games.
 *
 * @author Utarwyn
 * @since 2.1.0
 */
export default class EventHandler {
    /**
     * Map whiches store all registered listeners.
     */
    listeners: Map<keyof EventTypes, Array<(data?: any) => void>>;

    /**
     * Constructs a new instance of the event handling system.
     */
    constructor() {
        this.listeners = new Map();

        this.supportEvent('newGame');
        this.supportEvent('win');
        this.supportEvent('tie');
    }

    /**
     * Register a new listener to a specific event.
     *
     * @param eventName name of the event for which the listener will be registered
     * @param callback  method called when the event is emitted
     */
    public registerListener<T extends keyof EventTypes, V extends EventTypes[T]>(
        eventName: T,
        callback: V
    ): void {
        const array = this.listeners.get(eventName);
        if (array) {
            array.push(callback);
        } else {
            throw new Error(`Cannot register event "${eventName}" because it does not exist`);
        }
    }

    /**
     * Emits an event by its name
     * (call all listeners that want to catch that event).
     *
     * @param eventName name of the event to emit
     * @param data      data object which will be passed to listeners
     */
    public emitEvent(eventName: keyof EventTypes, data?: any): void {
        this.listeners.get(eventName)?.forEach(listener => listener(data));
    }

    /**
     * Adds the support of a specific event by its name.
     *
     * @param eventName name of the event to create
     * @private
     */
    private supportEvent(eventName: keyof EventTypes): void {
        this.listeners.set(eventName, []);
    }
}
