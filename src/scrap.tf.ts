import { promises as fsAsync } from "fs";

import * as cheerio from "cheerio";

import * as currency from "./currency";
import * as network from "./utils";
import * as steam from "./steam";


export interface ScraptfItem {
    itemPriceToBuy: number;
    itemPriceToSell: number;
    itemLimitBottom: number;
    itemLimitTop: number;
}

interface ScrapItems {
    (items: { [itemName: string]: ScraptfItem; }[] | undefined |  undefined): void;
}

export async function getScraptfItems(keyPrice: number) {
    // Scrapes items from scrap.tf.

    // Gets items and puts them in a dict.
    // Fetches price of the items and converts it to half-scrap currency.
    // It also saves their limits (min & max amount of allowed items) on scrap.tf website.

    // Args:
    //     key_price: Price of one key in half-scraps.

    // Returns:
    //     A dict mapping scrap.tf item names to their corresponding data.
    //     Example data:

    //     {"Non-Craftable Tough Break Key":
    //     {itemPriceToBuy: "1518", itemPriceToSell: "1494", itemLimitBottom: "3", itemLimitTop: "25"}}
    
    const scraptfRequest = await network.httpRequest("https://scrap.tf/items");

    if (scraptfRequest) {
        const backpacktfItemData = JSON.parse(await fsAsync.readFile("./data/backpack_item_names.json", {encoding:"utf8"}));
        const $ = cheerio.load(await scraptfRequest.text());
        const items: { [itemName: string]: ScraptfItem } = {};
        const originalItems: { [itemName: string]: ScraptfItem } = {};

        $("#itembanking-list > tbody > tr").each(function() {
            const itemName = $(this).children("td:nth-child(2)").text().trim();

            if (backpacktfItemData.hasOwnProperty(itemName)) {
                const itemPriceToBuy = currency.scraptfItemPriceToHalfScrap($(this).children("td:nth-child(3)").text().trim(), keyPrice);
                const itemPriceToSell = currency.scraptfItemPriceToHalfScrap($(this).children("td:nth-child(4)").text().trim(), keyPrice);
                const itemLimitBottom = parseInt($(this).find("div > div > div:nth-child(1)").text(), 10);
                const itemLimitTop = parseInt($(this).find("div > div > div:nth-child(2)").text(), 10);

                for (const backpackItemName of backpacktfItemData[itemName]) {
                    items[backpackItemName] = {
                        itemPriceToBuy: itemPriceToBuy,
                        itemPriceToSell: itemPriceToSell,
                        itemLimitBottom: itemLimitBottom,
                        itemLimitTop: itemLimitTop
                    };
                }

                originalItems[itemName] = {
                    itemPriceToBuy: itemPriceToBuy,
                    itemPriceToSell: itemPriceToSell,
                    itemLimitBottom: itemLimitBottom,
                    itemLimitTop: itemLimitTop
                };
            } else {
                console.warn("[WARN] Couldn't find an item '" + itemName + "' in the './data/backpack_item_names.json' file.");
            }
        });

        if (Object.keys(items).length > 0 && Object.keys(originalItems).length > 0) {
            return [items, originalItems];
        } else {
            console.error("[ERROR] Couldn't get scrap.tf items.");
        }
    }
}

// export async function getScraptfItemsThread(callback: ScrapItems, keyPrice: number) {
//     callback(await getScraptfItems(keyPrice));
//     setInterval(async () => {
//         callback(await getScraptfItems(keyPrice));
//     }, parseInt(process.env.KEY_UPDATE_INTERVAL || "") * 1000);
// }

export async function sellItemsOnScraptf(scraptfItems: { [itemName: string]: ScraptfItem; }[] | undefined, myInventory: any[]) {
    if (!scraptfItems) {
        console.error("[ERROR] Scrap.tf items are null.");
        return;
    }
    
    if (!myInventory) {
        console.error("[ERROR] My inventory is null.");
        return;
    }

    if (myInventory.length <= 0) {
        console.warn("[WARN] No items in my inventory.");
        return;
    }

    // TODO: Rewrite & cleanup.
    const itemsToSell = [];
    for (const item of myInventory) {
        if (!(item.market_hash_name in scraptfItems[0] || item.market_hash_name in scraptfItems[1])) {
            continue;
        }

        let itemSellLimit;
        if (item.market_hash_name in scraptfItems[0]) {
            itemSellLimit = scraptfItems[0][item.market_hash_name].itemLimitTop - scraptfItems[0][item.market_hash_name].itemLimitBottom;
        } else if (item.market_hash_name in scraptfItems[1]) {
            itemSellLimit = scraptfItems[1][item.market_hash_name].itemLimitTop - scraptfItems[1][item.market_hash_name].itemLimitBottom;
        }

        if (!itemSellLimit || itemSellLimit <= 0) {
            continue;
        }

        // TODO: Trim amount of items to sell.
        if (steam.getMyInventoryData(myInventory, item.market_hash_name).desiredItemCount > itemSellLimit) {
            continue;
        }

        itemsToSell.push(item.id);
    }

    if (itemsToSell.length == 0) {
        // console.warn("[INFO] No items to sell on scrap.tf.");
        return;
    }

    const scraptfSellUrl = "https://scrap.tf/ajax/items/Sell";
    const itemsToSellEncoded = encodeURIComponent(JSON.stringify(itemsToSell));

    let sellRequest;
    try {
        sellRequest = await (await fetch(scraptfSellUrl, {
            "headers": JSON.parse(process.env.SELL_REQUEST_HEADERS || ""),
            "referrer": "https://scrap.tf/sell/items",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "items=" + itemsToSellEncoded + "&scrap=1081&for_user=0&csrf=" + process.env.SELL_REQUEST_CSRF,
            "method": "POST",
            "mode": "cors"
        })).json();
    } catch (error) {
        console.error("[ERROR] Request to sell items on scrap.tf failed (reason: '" + error + "').");
        return;
    }

    if (!sellRequest.success && sellRequest.message != "You're already in the queue.") {
        console.error("[WARN] Failed to sell " + itemsToSell.join(", ") + " on scrap.tf (reason: '" + sellRequest.message + "').");
        return;
    }
}