// ScrapyNode - Backpack.tf & Scrap.tf trading bot.
// Fetches data from backpack.tf and scrapy.tf and trades with their bots if profitable.

// First it initializes APIs it uses and get items. Optionally creates alerts for them.
// Because of the alerts, it can fetch unread notifications and mark them as read.
// From alerts, it gets needed data, like item"s name or price.
// Then it calculates profit, which the bot uses to check if it should trade.
// It updates key price and item data every KEY_UPDATE_INTERVAL and ITEMS_UPDATE_INTERVAL respectively.

import { BackpackTFAPI } from "backpack.tf-api";
import PricesTF from "prices-tf-wrapper";

import * as backpacktf from "./backpack.tf";
import * as pricestf from "./prices.tf";
import * as scraptf from "./scrap.tf";
import * as steam from "./steam";

const SteamUser = require("steam-user");
const SteamCommunity = require("steamcommunity");
const SteamTotp = require("steam-totp");
const TradeOfferManager = require("steam-tradeoffer-manager");

require("dotenv").config();


// TODO:
// Remove Festivizer from backpack items. Find out how to convert steam names to backpack.tf names.

async function main() {
    // Setup prices.tf API client.
    const pricestfClient = new PricesTF();

    // Setup backpack.tf API client.
    const backpacktfClient = new BackpackTFAPI({
        token: process.env.BACKPACK_TOKEN,
    });

    // if (scraptfItems && process.env.CREATE_ALERTS == "True") {
    //     await backpacktf.createAlerts(backpacktfClient, scraptfItems[0]);
    // } 

    steam.setupTrading((manager: any, community: any) => {
        let keySellPrice: number | null | undefined;
        setInterval(async () => {
            keySellPrice = await pricestf.getKeySellPrice(pricestfClient);
        }, parseInt(process.env.KEY_UPDATE_INTERVAL || "") * 1000);

        let scraptfItems: { [itemName: string]: scraptf.ScraptfItem; }[] | undefined;
        setInterval(async () => {
            if (!keySellPrice) {
                return;
            }

            scraptfItems = await scraptf.getScraptfItems(keySellPrice);
        }, parseInt(process.env.ITEMS_UPDATE_INTERVAL || "") * 1000);

        let myInventoryContents: any[];
        setInterval(async () => {
            await manager.getInventoryContents(440, 2, true, async (_error: Error, _myInventoryContents: any[]) => {
                myInventoryContents = _myInventoryContents;
            });
        }, parseInt(process.env.INVENTORY_UPDATE_INTERVAL || "") * 1000);

        setInterval(async () => {
            if (!scraptfItems) {
                return;
            }

            backpacktf.unreadNotifications(backpacktfClient, myInventoryContents, scraptfItems[0], keySellPrice, manager, community);
        }, parseInt(process.env.GET_NOTIFICATIONS_INTERVAL || "") * 1000);

        setInterval(async () => {
            scraptf.sellItemsOnScraptf(scraptfItems, myInventoryContents);
        }, parseInt(process.env.SELL_ITEMS_INTERVAL || "") * 1000);
    });
}


if (require.main === module) {
    main();
}