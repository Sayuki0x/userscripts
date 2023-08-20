// ==UserScript==
// @name         Zapper++
// @namespace    https://base32.org/
// @version      0.1
// @description  Fetches validator rewards from custom API and adds them to your zapper balance
// @author       ExtraHash
// @invlude        https://zapper.fi*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zapper.fi
// @grant        none
// ==/UserScript==

let currentDisplayCurrency;

async function main() {
    await waitForLoad();
    console.log("page loaded");

    currentDisplayCurrency = getCurrentDisplayCurrency();
    console.log(currentDisplayCurrency);

    document.addEventListener('keydown', (event) => {
        const { key } = event;

        switch(key) {
            case 't':
                changeDisplayCurrency();
                break;
        }

      }, false);
}

const sleep = async (ms) => new Promise((res) => setTimeout(res, ms));

function waitForLoad() {
    return new Promise(async (res, rej) => {
        setTimeout(() => {
            rej();
        }, 10000)
        while (true) {
            // check if refresh button is present to determine page load
            const exists = getRefreshButton();
            if (exists) {
                break;
            }
            await sleep(10);
        }
        res();
    })
}

function waitForId(id) {
    return new Promise(async (res, rej) => {
        setTimeout(() => {
            rej();
        }, 10000)
        while (true) {
            // check if refresh button is present to determine page load
            const element = document.getElementById(id);
            if (element !== null) {
                res(element);
                break;
            }
            await sleep(10);
        }
        
    })
}

async function changeDisplayCurrency() {
    // find and click button with id headlessui-popover-button-3
    const button = document.querySelector(`[id="headlessui-popover-button-3"]`);
    button.click();

    const popover = await waitForId("headlessui-popover-panel-4");

    let popoverImgs = popover.getElementsByTagName("img");
    for (const popoverImg of popoverImgs) {
        if (popoverImg.src.includes("currencies")) {
            popoverImg.click();
        }
    }
    await sleep(50);
    popoverImgs = popover.getElementsByTagName("img");
    for (const popoverImg of popoverImgs) {
        if (currentDisplayCurrency === "USD" && popoverImg.src.includes("ETH")) {
            console.log(popoverImg.src);
            popoverImg.click();
            currentDisplayCurrency = "ETH";
            break;
        }
        if (currentDisplayCurrency === "ETH" && popoverImg.src.includes("USD")) {
            console.log(popoverImg.src);
            popoverImg.click();
            currentDisplayCurrency = "USD";
            break;
        }
    }
    button.click();
}


function getRefreshButton() {
    return (
        document.querySelector(`[title="Refresh"]`) ??
        document.querySelector(
            `[title="Please wait 5 minutes before refreshing again"]`
        ) ??
        document.querySelector(
            `[title="Please wait 4 minutes before refreshing again"]`
        ) ??
        document.querySelector(
            `[title="Please wait 3 minutes before refreshing again"]`
        ) ??
        document.querySelector(
            `[title="Please wait 2 minutes before refreshing again"]`
        ) ??
        document.querySelector(
            `[title="Please wait 1 minutes before refreshing again"]`
        )
    );
}

function getCurrentDisplayCurrency() {
    // fetch element with title attribute "Refresh"
    const refreshButton = getRefreshButton();
    if (refreshButton.parentElement.textContent.includes("$")) {
        return "USD";
    }
    if (refreshButton.parentElement.textContent.includes("ETH")) {
        return "ETH";
    }
    throw new Error("Display currency not found");
}

main();
