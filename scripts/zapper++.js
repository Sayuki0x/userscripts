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

let totalBal = 0;

async function main() {
    setBalance();
    listenToSocket();
}

async function listenToSocket() {
    const ws = new WebSocket("wss://base32.org/api/eth/price");
    ws.onopen = () => {
        console.log("websocket is listening");
    };
    ws.onmessage = (msg) => {
        const priceInfo = JSON.parse(msg.data);
        console.log(priceInfo);
        setUsdBal(priceInfo);
    };
}

function prettyNumber(x) {
    return x.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

async function getEthPrice() {
    // fetch eth price
    const priceRes = await fetch("https://base32.org/api/eth/price");
    return priceRes.json();
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


function setUsdBal(priceInfo) {
    const usdBal = document.getElementById("usd-bal-span");

    if (!usdBal) {
        return;
    }

    usdBal.textContent = `$${prettyNumber(totalBal * priceInfo.last)}`;
}

const sleep = async (ms) => new Promise((res) => setTimeout(res, ms));

async function setBalance() {
    // fetch eth price
    const priceRes = await fetch("https://base32.org/api/eth/price");
    const priceInfo = await priceRes.json();

    // wait while loading spinner is pbalResent
    while (true) {
        // check if refresh button is present to determine page load
        const exists = getRefreshButton();
        if (exists) {
            break;
        }
        await sleep(10);
    }
    console.log("page loaded");

    // fetching the current ether balance from zapper
    const refreshButton = getRefreshButton();
    const balElement = refreshButton.parentElement;

    console.log(balElement.children);
    const currentBal = Number(balElement.textContent.replace(/[^\d.]/g, ""));

    // increase relevant balances
    totalBal = currentBal;

    // add usd balance
    const usdBalContainer = document.createElement("div");

    usdBalContainer.id = "usd-bal-span";
    usdBalContainer.style.fontSize = "15px";
    usdBalContainer.style.marginTop = "10px";

    balElement.insertBefore(usdBalContainer, refreshButton);
    setUsdBal(priceInfo);
}

main();
