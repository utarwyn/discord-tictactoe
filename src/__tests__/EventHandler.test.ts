import EventHandler from '@bot/EventHandler';

describe('EventHandler', () => {
    let eventHandler: EventHandler;
    const listener = jest.fn();

    beforeEach(() => {
        eventHandler = new EventHandler();
    });

    test('should initialize supported events', () => {
        expect(Array.from(eventHandler.listeners.keys())).toEqual(['win', 'tie']);
    });

    test('should register a listener if event exists', () => {
        eventHandler.registerListener('tie', listener);
        expect(eventHandler.listeners.get('tie')).toContain(listener);
    });

    test('should throw an error during register if event does not exist', () => {
        expect(() => eventHandler.registerListener('unknown' as any, listener)).toThrow();
        expect(eventHandler.listeners.get('tie')).toHaveLength(0);
    });

    test('should emit an event if exists', () => {
        const data = { foo: true, bar: 1 };
        eventHandler.listeners.get('tie')!.push(listener);
        eventHandler.emitEvent('tie', data);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(data);
    });

    test('should do nothing when emiting an event that does not exist', () => {
        eventHandler.emitEvent('unknown' as any);
        expect(listener).toHaveBeenCalledTimes(0);
    });
});
