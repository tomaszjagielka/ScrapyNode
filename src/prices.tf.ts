import PricesTF from "prices-tf-wrapper";

interface KeySellPrice {
    (value: number | null | undefined): void;
}

export async function getKeySellPrice(client: PricesTF) {
    // Updates key price for later use.

    // It uses prices.tf API to update key price.
    // It's needed to correctly calculate profit value.

    // Args:
    //     client:
    //       prices.tf API client. You can get it by initializing object of PricesTF class.

    // Returns:
    //     Price of a key in half-scraps.

    try {
        return (await client.getPrice("5021;6")).sellHalfScrap;
    } catch (error) {
        console.error("[ERROR] Couldn't get the price of a key. (reason: '" + error + "').");
    }
}

// export async function getKeySellPriceThread(callback: KeySellPrice, client: PricesTF) {
//     try {
//         await client.getAccessToken();
//         callback(await getKeySellPrice(client));
//         setInterval(async () => {
//             callback(await getKeySellPrice(client));
//         }, parseInt(process.env.KEY_UPDATE_INTERVAL || "", 10) * 1000);
//     } catch {
//         throw Error("Couldn't get prices.tf access token.");
//     }
// }