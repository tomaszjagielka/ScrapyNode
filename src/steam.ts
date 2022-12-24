import * as fs from "fs"; 

const SteamUser = require("steam-user");
const SteamCommunity = require("steamcommunity");
const SteamTotp = require("steam-totp");
const TradeOfferManager = require("steam-tradeoffer-manager");

import * as backpacktf from "./backpack.tf";
import * as currency from "./currency";
import * as scraptf from "./scrap.tf";


export interface InventoryData {
    keys: object[];
    refined: object[];
    reclaimed: object[];
    scrap: object[];
    desiredItemCount: number;
}

export function tradeOfferDataToHalfScrap(inventoryData: InventoryData, keyPrice: number) {
    return currency.keysToHalfScrap(inventoryData.keys.length, keyPrice) +
    currency.refinedToHalfScrap(inventoryData.refined.length) +
    currency.reclaimedToHalfScrap(inventoryData.reclaimed.length) +
    currency.scrapToHalfScrap(inventoryData.scrap.length);
}

export function getMyInventoryData(myInventory: any[], desiredItemName: string) {
    const myInventoryData: InventoryData = {
        keys: [],
        refined: [],
        reclaimed: [],
        scrap: [],
        desiredItemCount: 0
    }

    for (const item of myInventory) {
        if (!item.tradable) {
            continue;
        }

        if (item.name == "Mann Co. Supply Crate Key") {
            myInventoryData.keys.push(item);
        } else if (item.name == "Refined Metal") {
            myInventoryData.refined.push(item);
        } else if (item.name == "Reclaimed Metal") {
            myInventoryData.reclaimed.push(item);
        } else if (item.name == "Scrap Metal") {
            myInventoryData.scrap.push(item);
        } else if (item.name.includes(desiredItemName)) {
            myInventoryData.desiredItemCount++;
        }
    }

    return myInventoryData;
}

export function getTradeOfferData(myInventoryData: InventoryData, keySellPrice: number, desiredItemPrice: number) {
    const myTradeOfferData: InventoryData = {
        keys: [],
        refined: [],
        reclaimed: [],
        scrap: [],
        desiredItemCount: 0
    }

    for (const key of myInventoryData.keys) {
        if (tradeOfferDataToHalfScrap(myTradeOfferData, keySellPrice) + currency.keysToHalfScrap(1, keySellPrice) > desiredItemPrice) {
            // console.log(1, desiredItemPrice, keySellPrice, myTradeOfferData);
            break;
        }
        myTradeOfferData.keys.push(key);
    }

    for (const refined of myInventoryData.refined) {
        if (tradeOfferDataToHalfScrap(myTradeOfferData, keySellPrice) + currency.refinedToHalfScrap(1) > desiredItemPrice) {
            // console.log(2, desiredItemPrice, keySellPrice, myTradeOfferData);
            break;
        }
        myTradeOfferData.refined.push(refined);
    }

    for (const reclaimed of myInventoryData.reclaimed) {
        if (tradeOfferDataToHalfScrap(myTradeOfferData, keySellPrice) + currency.reclaimedToHalfScrap(1) > desiredItemPrice) {
            // console.log(3, desiredItemPrice, keySellPrice, myTradeOfferData);
            break;
        }
        myTradeOfferData.reclaimed.push(reclaimed);
    }
    
    for (const scrap of myInventoryData.scrap) {
        if (tradeOfferDataToHalfScrap(myTradeOfferData, keySellPrice) + currency.scrapToHalfScrap(1) > desiredItemPrice) {
            // console.log(4, desiredItemPrice, keySellPrice, myTradeOfferData);
            break;
        }
        myTradeOfferData.scrap.push(scrap);
    }

    myTradeOfferData.desiredItemCount = myInventoryData.desiredItemCount;

    return myTradeOfferData;
}

export function setupTrading(callback: any) {
    const client = new SteamUser();
    const community = new SteamCommunity();
    const manager = new TradeOfferManager({
        "steam": client,
        "community": community
    });

    if (fs.existsSync("./data/polldata.json")) {
        manager.pollData = JSON.parse(fs.readFileSync("data/polldata.json").toString("utf8"));
    }

    client.logOn({
        "accountName": process.env.STEAM_ACCOUNT_NAME,
        "password": process.env.STEAM_PASSWORD,
        "twoFactorCode": SteamTotp.getAuthCode(process.env.STEAM_SHARED_SECRET),
        "logonID": "Scrapy"
    });

    // setTimeout(function(){
    //     //for debugging purposes, kill cookies after 10 second
    //     console.log("rip cookies :(");
    //     community.setCookies(["steamLogin=1||invalid", "steamLoginSecure=1||invalid"]);
    //     manager.setCookies(["steamLogin=1||invalid", "steamLoginSecure=1||invalid"]);
    // }, 30000);

    client.on("webSession", (_sessionID: number, cookies: string[]) => {
        manager.setCookies(cookies, (error: Error) => {
            if (error) {
                throw error;
            }
        });
    
        community.setCookies(cookies);
    });

    client.on("loggedOn", () => {
        console.log("[INFO] Logged into Steam as '" + client.steamID.getSteam3RenderedID() + "'.\n[INFO] Looking for backpack.tf notifications...");
        callback(manager, community);
    });

    community.on("sessionExpired", () => {
        console.log("session expired");
        client.webLogOn();
    }); 

    manager.on("pollData", (pollData: any) => {
        fs.writeFileSync("./data/polldata.json", JSON.stringify(pollData));
    });

    manager.on("newOffer", (tradeOffer: any) => {
        let knownUser = false;

        for (const userId of JSON.parse(process.env.ALWAYS_ACCEPT_TRADES_FROM_USER_IDS || "")) {
            if (tradeOffer.partner.getSteam3RenderedID() != userId) {
                continue;
            }

            console.log("[INFO] Accepting a new trade offer #" + tradeOffer.id + " from known user '" + tradeOffer.partner.getSteam3RenderedID() + "'...");

            tradeOffer.accept((error: Error, status: string) => {
                if (error) {
                    console.error("[ERROR] Unable to accept offer #" + tradeOffer.id + " (reason: '" + error.message + "').");
                    return;
                }

                if (status == "pending") {
                    try {
                        community.acceptConfirmationForObject(process.env.STEAM_IDENTITY_SECRET, tradeOffer.id, (error: Error) => {
                            if (error) {
                                console.error("[ERROR] Couldn't confirm trade offer #" + tradeOffer.id + " (reason: '" + error.message + "').");
                                return;
                            }
    
                            console.log("[INFO] Confirmed trade offer #" + tradeOffer.id + ".");
                        });
                    } catch (error) {
                        console.error("[ERROR] Error confirming trade offer #" + tradeOffer.id + " (reason: '" + error + "').")
                    }
                }
            });

            knownUser = true;
            break;
        }

        if (!knownUser) {
            console.log("[INFO] New trade offer #" + tradeOffer.id + " from unknown user '" + tradeOffer.partner.getSteam3RenderedID() + "'.");
        }
    });

    manager.on("receivedOfferChanged", (tradeOffer: any, oldState: any) => {
        console.log("[INFO] Trade offer #" + tradeOffer.id + ": " + TradeOfferManager.ETradeOfferState[oldState] + " -> " + TradeOfferManager.ETradeOfferState[tradeOffer.state] + ".");
    
        if (tradeOffer.state == TradeOfferManager.ETradeOfferState.Accepted) {
            tradeOffer.getExchangeDetails((error: any, status: string, _tradeInitTime: number, receivedItems: any[], sentItems: any[]) => {
                if (error) {
                    console.log("[ERROR] Error getting trade offer's exchange details (reason: '" + error + "').");
                    return;
                }
    
                // Create arrays of just the new assetids using Array.prototype.map and arrow functions
                let newReceivedItems = receivedItems.map(item => item.new_assetid);
                let newSentItems = sentItems.map(item => item.new_assetid);
    
                console.log("[INFO] Trade offer #" + tradeOffer.id + ": Received items: " + newReceivedItems.length + ", sent items: " + newSentItems.length + ", status: " + TradeOfferManager.ETradeStatus[status] + ".");
            })
        }
    });
}