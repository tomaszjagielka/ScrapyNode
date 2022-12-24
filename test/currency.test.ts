import * as currency from '../src/currency';


test('Converts keys to half-scrap equivalent.', () => {
    expect(currency.keysToHalfScrap(1, 1228)).toBe(1228);
    expect(currency.keysToHalfScrap(0.49, 1228)).toBe(602);
});

test('Converts refined metal to half-scrap equivalent.', () => {
    expect(currency.refinedToHalfScrap(1)).toBe(18);
    expect(currency.refinedToHalfScrap(0.47)).toBe(8);
});

test('Converts reclaimed metal to half-scrap equivalent.', () => {
    expect(currency.reclaimedToHalfScrap(1)).toBe(6);
    expect(currency.reclaimedToHalfScrap(0.47)).toBe(3);
});

test('Converts scrap metal to half-scrap equivalent.', () => {
    expect(currency.scrapToHalfScrap(1)).toBe(2);
    expect(currency.scrapToHalfScrap(0.47)).toBe(1);
});

test('Converts scrap.tf item prices to half-scrap equivalent.', () => {
    expect(currency.scraptfItemPriceToHalfScrap("1 key", 1228)).toBe(1228);
    expect(currency.scraptfItemPriceToHalfScrap("1.05 refined", 1228)).toBe(19);
    expect(currency.scraptfItemPriceToHalfScrap("1 key, 13.33 refined", 1228)).toBe(1468);
});
