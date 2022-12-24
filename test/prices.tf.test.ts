import PricesTF from "prices-tf-wrapper";

import * as pricestf from '../src/prices.tf';


test('Fetches prices.tf website & gets key price.', async () => {
    const api = new PricesTF();
    return api.getAccessToken().then(async () => {
        expect(await pricestf.getKeySellPrice(api)).toBeGreaterThan(0);
    });
});
