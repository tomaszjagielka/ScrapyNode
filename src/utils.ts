export async function httpRequest(url: string) {
    try {
        const response = await fetch(url);

        if (response.ok) {
            return response;
        } else {
            console.error("[ERROR] Couldn't get the document from the url: '" + url + "' (reason: '" + response.statusText + "').");
        }
    } catch (error) {
        console.error("[ERROR] Couldn't fetch the url: '" + url + "' (reason: '" + error + "').");
    }
}