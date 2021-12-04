import { I18nProvider } from '@i18n/I18nProvider';

describe('I18nProvider', () => {
    let provider: I18nProvider;

    beforeEach(() => {
        provider = new I18nProvider();
    });

    it('compute available locales from internal files', () => {
        const locales = provider['availableLocales'];
        expect(locales).toBeDefined();
        expect(locales.size).toBeGreaterThan(0);
    });

    it.each`
        locale                           | warned   | expectedMessage
        ${'en'}                          | ${false} | ${'please'}
        ${'fr'}                          | ${false} | ${'patienter'}
        ${'file:config/locales/en.json'} | ${false} | ${'please '}
        ${'file:config/locales/fr.json'} | ${false} | ${'patienter'}
        ${'file:config/locales/unknown'} | ${true}  | ${'please'}
        ${'unknown'}                     | ${true}  | ${'please'}
    `('should try to load locale $locale', ({ locale, warned, expectedMessage }) => {
        const spyWarn = jest.spyOn(global.console, 'warn').mockImplementation();

        provider.loadFromLocale(locale);

        expect(provider.__('game.load')).toContain(expectedMessage);
        expect(spyWarn).toHaveBeenCalledTimes(warned ? 1 : 0);
        spyWarn.mockRestore();
    });

    it.each`
        data                           | key          | replacements                    | warned   | expected
        ${{ key: 'fake' }}             | ${'key'}     | ${null}                         | ${false} | ${'fake'}
        ${{ 'key.awo': '{p1}: {p2}' }} | ${'key.awo'} | ${{ p1: 'test1', p2: 'test2' }} | ${false} | ${'test1: test2'}
        ${{ key2: 'key2' }}            | ${'key'}     | ${null}                         | ${true}  | ${'key'}
        ${undefined}                   | ${'my.key'}  | ${null}                         | ${true}  | ${'my.key'}
    `(
        'should translate $key with replacements $replacements',
        ({ data, key, replacements, warned, expected }) => {
            const spyWarn = jest.spyOn(global.console, 'warn').mockImplementation();

            provider['localeData'] = data;

            expect(provider.__(key, replacements)).toBe(expected);
            expect(spyWarn).toHaveBeenCalledTimes(warned ? 1 : 0);
            spyWarn.mockRestore();
        }
    );
});
