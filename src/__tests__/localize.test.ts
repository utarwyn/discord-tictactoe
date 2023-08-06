const provider = { loadFromLocale: jest.fn(), __: jest.fn(), addProvider: jest.fn() };

jest.mock('@i18n/I18nProvider', () => ({
    I18nProvider: jest.fn().mockImplementation(() => provider)
}));

import localize from '@i18n/localize';

describe('Localize', () => {
    it('should call loadFromLocale from the provider', () => {
        localize.loadFromLocale('fr');
        expect(provider.loadFromLocale).toHaveBeenCalledTimes(1);
        expect(provider.loadFromLocale).toHaveBeenCalledWith('fr');
    });

    it('should call __ from the provider', () => {
        const replacements = { player: 'utarwyn' };
        localize.__('key', replacements);
        expect(provider.__).toHaveBeenCalledTimes(1);
        expect(provider.__).toHaveBeenCalledWith('key', replacements);
    });

    it('should call addProvider from the provider', () => {
        const messageProvider = () => 'custom message';
        localize.addProvider('key', messageProvider);
        expect(provider.addProvider).toHaveBeenCalledTimes(1);
        expect(provider.addProvider).toHaveBeenCalledWith('key', messageProvider);
    });
});
