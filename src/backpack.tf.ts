import { BackpackTFAPI } from "backpack.tf-api";

import * as currency from "./currency";
import * as scraptf from "./scrap.tf";
import * as steam from "./steam";


export async function markNotificationsAsReadAndReturn(client: BackpackTFAPI) {
    try {
        return await client.markNotificationsAsReadAndReturn();
    } catch (error) {
        console.error("[ERROR] Couldn't mark notifications as read and return (reason: '" + error + "').");
    }
}

export async function createAlerts(client: BackpackTFAPI, items: { [itemName: string]: scraptf.ScraptfItem; }) {
    // Creates alerts on backpack.tf.

    // Creates buy & sell alert for every item in data/item_names.json.

    // Args:
    //     client:
    //       backpack.tf API client. You can get it by initializing object of backpack_api.py class.
    //     items:
    //       Dictionary of items for which alerts will be created.

    for (const itemName in items) {
        async function createdAlerts() {
            try {
                await client.createAlert({ item: itemName, intent: "buy", blanket: true })
                await client.createAlert({ item: itemName, intent: "sell", blanket: true })

                console.log("[INFO] Created alerts for item: '" + itemName + "'.");
                return true;
            } catch {
                console.error("[ERROR] Couldn't create alerts for item: '" + itemName + "'. Retrying...");
                return false;
            }
        }

        while (!await createdAlerts());
    }
}

// TODO: Change any to proper types.
export async function unreadNotifications(backpacktfClient: any, myInventory: any[], scraptfItems: any, keySellPrice: any, manager: any, community: any) {
    const unreadNotifications = await markNotificationsAsReadAndReturn(backpacktfClient);

    if (!scraptfItems || !keySellPrice || !unreadNotifications || !unreadNotifications.length) {
        return;
    }

    for (const unreadNotification of unreadNotifications) {
        // DEBUG:
        // unreadNotification = {
        //     "id": "62ca12ffa6cd747a2009edbf",
        //     "steamid": "76561199192225457",
        //     "unread": true,
        //     "lastMoved": 1657410303,
        //     "elementId": "440_11836530668",
        //     "userId": "76561199101172467",
        //     "targetUser": {
        //     "id": "76561199101172467",
        //     "name": "Bread Bot",
        //     "avatar": "https://avatars.akamai.steamstatic.com/7cb2fbcd4b3b36a94564285ce7af35e563cfd1b1_medium.jpg",
        //     "avatarFull": "https://avatars.akamai.steamstatic.com/7cb2fbcd4b3b36a94564285ce7af35e563cfd1b1_full.jpg",
        //     "premium": true,
        //     "online": true,
        //     "banned": false,
        //     "customNameStyle": "awesome6",
        //     "acceptedSuggestions": 0,
        //     "class": "awesome6",
        //     "style": "",
        //     "role": null,
        //     "tradeOfferUrl": "https://steamcommunity.com/tradeoffer/new/?partner=1140906739&token=98vdhhb5",
        //     "isMarketplaceSeller": false,
        //     "flagImpersonated": null,
        //     "bans": []
        //     },
        //     "type": 11,
        //     // @ts-ignore
        //     "bundle": {
        //     "listing": {
        //         "id": "440_11836530668",
        //         "steamid": "76561199101172467",
        //         "appid": 440,
        //         "currencies": {
        //         "metal": 10,
        //         "keys": 1
        //         },
        //         "value": {
        //         "raw": 92.99,
        //         "short": "1.34 keys",
        //         "long": "1 key, 23.77 ref"
        //         },
        //         "tradeOffersPreferred": true,
        //         "buyoutOnly": true,
        //         "details": "⚡️Stock ->🤑 1 / 1🐇Want me to send an offer? Add Me and type !buy Taunt: The Fubar Fanfare🐇",
        //         "listedAt": 1657387795,
        //         "bumpedAt": 1657409419,
        //         "intent": "sell",
        //         "count": 1,
        //         "status": "active",
        //         "source": "userAgent",
        //         "item": {
        //         "appid": 440,
        //         "baseName": "Taunt: The Fubar Fanfare",
        //         "defindex": 30761,
        //         "id": "11836530668",
        //         "imageUrl": "https://steamcdn-a.akamaihd.net/apps/440/icons/fumblers_fanfare.1ea9567c982f1947483f2d8c156ef1aa5e00f601.png",
        //         "marketName": "Taunt: The Fubar Fanfare",
        //         "name": "Taunt: The Fubar Fanfare",
        //         "origin": {
        //             "id": 0,
        //             "name": "Timed Drop"
        //         },
        //         "originalId": "0",
        //         "price": {
        //             "community": {
        //             "value": 1.3,
        //             "valueHigh": 1.3,
        //             "currency": "keys",
        //             "raw": 89.986,
        //             "short": "1.3 keys",
        //             "long": "89.99 ref, $2.02",
        //             "usd": 2.024685,
        //             "updatedAt": 1654419636,
        //             "difference": 5.27062500000001
        //             },
        //             "suggested": {
        //             "raw": 89.986,
        //             "short": "1.3 keys",
        //             "long": "89.99 ref, $2.02",
        //             "usd": 2.024685
        //             }
        //         },
        //         "quality": {
        //             "id": 6,
        //             "name": "Unique",
        //             "color": "#FFD700"
        //         },
        //         "summary": "Level 15 Special Taunt",
        //         "level": 15,
        //         "class": [
        //             "Soldier"
        //         ],
        //         "slot": "taunt",
        //         "tradable": true,
        //         "craftable": true
        //         },
        //         "userAgent": {
        //         "client": "Gladiator.tf - Rent your own bot from 4 keys per month",
        //         "lastPulse": 1657410260
        //         },
        //         "user": {
        //         "id": "76561199101172467",
        //         "name": "Bread Bot",
        //         "avatar": "https://avatars.akamai.steamstatic.com/7cb2fbcd4b3b36a94564285ce7af35e563cfd1b1_medium.jpg",
        //         "avatarFull": "https://avatars.akamai.steamstatic.com/7cb2fbcd4b3b36a94564285ce7af35e563cfd1b1_full.jpg",
        //         "premium": true,
        //         "online": true,
        //         "banned": false,
        //         "customNameStyle": "awesome6",
        //         "acceptedSuggestions": 0,
        //         "class": "awesome6",
        //         "style": "",
        //         "role": null,
        //         "tradeOfferUrl": "https://steamcommunity.com/tradeoffer/new/?partner=1140906739&token=98vdhhb5",
        //         "isMarketplaceSeller": false,
        //         "flagImpersonated": null,
        //         "bans": []
        //         }
        //     }
        //     },
        //     "contents": {
        //         "subject": "Listing alert",
        //         "message": "Taunt: The Fubar Fanfare - listed for 92.99 ref, 1.34 keys, $2.09 (sell order)",
        //         "url": "/classifieds?item=Taunt%3A+The+Fubar+Fanfare&quality=6&tradable=1&craftable=1&australium=-1&killstreak_tier=0",
        //         // @ts-ignore
        //         "nuxtUrl": "/classifieds/440_11836530668"
        //     }
        // }

        const notificationSubject = unreadNotification.contents.subject;
        const listing = unreadNotification.bundle!["listing"];
        const desiredItemCurrencies = listing["currencies"];
        const desiredItemName = listing["item"]["name"];

        // There are other types of notifications, so we check only those with the subject "Listing alert".
        if (notificationSubject != "Listing alert" || !(desiredItemCurrencies["keys"] || desiredItemCurrencies["metal"])) {
            continue;
        }

        if (!(desiredItemName in scraptfItems)) {
            console.warn("[WARN] Couldn't find an item: '" + desiredItemName + "' in the scrap.tf item list.");
            continue;
        }
        
        const desiredItemKeysInHalfScrap = currency.keysToHalfScrap(desiredItemCurrencies["keys"], keySellPrice);
        const desiredItemRefinedInHalfScrap = currency.refinedToHalfScrap(desiredItemCurrencies["metal"]);
        const desiredItemPrice = desiredItemKeysInHalfScrap + desiredItemRefinedInHalfScrap;
        const desiredItemUrl = unreadNotification.contents.url;
        const listingIntent = listing["intent"];

        if (listingIntent == "sell") {
            if (scraptfItems[desiredItemName].itemLimitTop - scraptfItems[desiredItemName].itemLimitBottom <= 0) {
                continue;
            }

            const profit = scraptfItems[desiredItemName].itemPriceToSell - desiredItemPrice;

            if (profit <= 0) {
                continue;
            }

            console.log("[SELL] Profit: " + profit + ", price: " + desiredItemPrice +
            ", name: " + desiredItemName + ", url: https://backpack.tf" +
            desiredItemUrl);

            if (!myInventory) {
                console.error("[ERROR] Couldn't get my inventory.");
                return;
            }

            if (myInventory.length <= 0) {
                console.warn("[WARN] No items in my inventory.");
                return;
            }

            const myTradeOfferData = steam.getTradeOfferData(steam.getMyInventoryData(myInventory, desiredItemName), keySellPrice, desiredItemPrice);

            if (myTradeOfferData.desiredItemCount >= scraptfItems[desiredItemName].itemLimitTop - scraptfItems[desiredItemName].itemLimitBottom) {
                console.log("[WARN] You have reached the item limit for '" + desiredItemName + "'.");
                return;
            }

            const myTradeOfferValue = steam.tradeOfferDataToHalfScrap(myTradeOfferData, keySellPrice);

            // myTradeOfferValue should never be greater than desiredItemPrice.
            if (myTradeOfferValue != desiredItemPrice) {
                console.warn("[WARN] Your trade offer value doesn't match the price of '" + desiredItemName + "' (" + myTradeOfferValue + "/" + desiredItemPrice + ").");
                return;
            }

            // @ts-expect-error: backpack.tf-api library is incomplete.
            const partnerTradeOfferUrl = unreadNotification["targetUser"]["tradeOfferUrl"];

            if (!partnerTradeOfferUrl) {
                console.warn("[INFO] Couldn't create a trade offer (reason: 'Trade offer url is null').");
                return;
            }

            // TODO: Fix any?
            let tradeOffer: any;
            try {
                tradeOffer = manager.createOffer(partnerTradeOfferUrl);
            } catch {
                console.error("[ERROR] Couldn't create trade offer using trade offer url: '" + partnerTradeOfferUrl + "'.");
                return;
            }
            
            tradeOffer.addMyItems(myTradeOfferData.keys.concat(myTradeOfferData.refined, myTradeOfferData.reclaimed, myTradeOfferData.scrap));

            interface DesiredItem {
                assetid: number;
                appid: number;
                contextid: number;
            }
            const desiredItem: DesiredItem = {
                assetid: listing["item"]["id"],
                appid: listing["item"]["appid"],
                // Notifications don"t have a contextid, so I"m using 2 (appid and contextid shouldn"t ever change).
                contextid: 2,
            }
            tradeOffer.addTheirItem(desiredItem);
            
            console.log("[INFO] Sending trade offer for '" + desiredItemName + "'...");
            tradeOffer.send((error: Error, status: string) => {
                if (error) {
                    console.error("[ERROR] Couldn't send trade offer (reason: '" + error.message + "').");
                    return;
                } 

                if (status == "pending") {
                    try {
                        // Automatically accept trade offer.
                        community.acceptConfirmationForObject(process.env.STEAM_IDENTITY_SECRET, tradeOffer.id, (error: Error) => {
                            if (error) {
                                console.error("[ERROR] Couldn't confirm trade offer #" + tradeOffer.id + " (reason: '" + error.message + "').");
                                return;
                            }
                            
                            console.log("[INFO] Trade offer #"+ tradeOffer.id + " sent successfully.");
                        });
                    } catch (error) {
                        console.error("[ERROR] Error confirming trade offer #" + tradeOffer.id + " (reason: '" + error + "').")
                    }
                }
            });
        } else {
            if (scraptfItems[desiredItemName].itemLimitBottom <= 0) {
                continue;
            }

            const profit = desiredItemPrice - scraptfItems[desiredItemName].itemPriceToBuy;

            if (profit <= 0) {
                return;
            }

            console.log("[BUY] Profit: " + profit + ", price: " + desiredItemPrice +
            ", name: " + desiredItemName + ", url: https://backpack.tf" +
            desiredItemUrl);
        }
    }
}