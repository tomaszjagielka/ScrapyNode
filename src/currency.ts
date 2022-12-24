// Helper functions to correctly convert between currencies.

// Team Fortress 2 economy uses currencies like Mann Co. Supply Crate Keys, refined metal,
// reclaimed metal and scrap metal. Half-scrap is only used here, because really cheap items,
// like commonly dropped crates are traded for 'weapons', which often cost half a scrap.

// 1 refined = 3 reclaimed = 9 scrap = 18 half-scrap (weapons).

export function keysToHalfScrap(keys: number, keyPrice: number) {
    if (isNaN(keys)) {
        return 0;
    }

    return Math.round(keys * keyPrice);
}

export function refinedToHalfScrap(refinedMetal: number) {
    if (isNaN(refinedMetal)) {
        return 0;
    }

    return Math.round(refinedMetal * 9 * 2);
}

export function reclaimedToHalfScrap(reclaimedMetal: number) {
    if (isNaN(reclaimedMetal)) {
        return 0;
    }

    return Math.round(reclaimedMetal * 3 * 2);
}

export function scrapToHalfScrap(scrapMetal: number) {
    if (isNaN(scrapMetal)) {
        return 0;
    }

    return Math.round(scrapMetal * 2);
}

export function scraptfItemPriceToHalfScrap(text: string, keyPrice: number) {
    // Converts Scrap.tf item prices to their half-scrap equivalent.
    // Scrap.tf uses only keys and refined.
    
    const textSplitted = text.split(' ') // Example text_splitted: ['1', 'key,', '13.66', 'refined'];
    let keys = 0;
    let refinedMetal = 0;

    if (textSplitted[1].includes('key')) {
        keys = parseInt(textSplitted[0], 10);

        if (textSplitted.length > 2) {
            refinedMetal = parseFloat(textSplitted[2]);
        }
    } else {
        refinedMetal = parseFloat(textSplitted[0]);  
    }

    return keysToHalfScrap(keys, keyPrice) + refinedToHalfScrap(refinedMetal);
}