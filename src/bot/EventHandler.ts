/**
 * Supported type of events
 */
export type EventType = 'win' | 'tie';

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
    listeners: Map<EventType, Array<(data?: any) => void>>;

    /**
     * Constructs a new instance of the event handling system.
     */
    constructor() {
        this.listeners = new Map();

        this.supportEvent('win');
        this.supportEvent('tie');
    }

    /**
     * Register a new listener to a specific event.
     *
     * @param eventName name of the event for which the listener will be registered
     * @param callback  method called when the event is emitted
     */
    registerListener(eventName: EventType, callback: (data?: any) => void): void {
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
    emitEvent(eventName: EventType, data?: any): void {
        this.listeners.get(eventName)?.forEach(listener => listener(data));
    }

    /**
     * Adds the support of a specific event by its name.
     *
     * @param eventName name of the event to create
     * @private
     */
    private supportEvent(eventName: EventType): void {
        this.listeners.set(eventName, []);
    }
}
