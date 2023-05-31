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
        updateEthPrice(priceInfo);
        setUsdBal(priceInfo);
    };
}

function prettyNumber(x) {
    return x.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function setUsdBal(priceInfo) {
    const usdBal = document.getElementById("usd-bal-span");

    if (!usdBal) {
        return;
    }

    usdBal.textContent = `$${prettyNumber(totalBal * priceInfo.last)}`;
}

async function getEthPrice() {
    // fetch eth price
    const priceRes = await fetch("https://base32.org/api/eth/price");
    return priceRes.json();
}

async function updateEthPrice(priceInfo) {
    const ethPriceText = document.getElementById("eth-header-price-text");
    if (!ethPriceText) {
        return;
    }
    ethPriceText.textContent = `$${prettyNumber(priceInfo.last)}`;
    const percentSpan = document.getElementById("eth-24h-price-change");
    if (!percentSpan) {
        return;
    }
    percentSpan.textContent = `${priceInfo.percentage.toFixed(2)}%`;
    percentSpan.style.color =
        priceInfo.percentage < 0 ? "rgb(236, 140, 212)" : "rgb(57, 255, 185)";
}

const sleep = async (ms) => new Promise((res) => setTimeout(res, ms));

async function setBalance() {
    // fetch eth price
    const priceRes = await fetch("https://base32.org/api/eth/price");
    const priceInfo = await priceRes.json();

    console.log("fetched info", priceInfo);

    // wait while loading spinner is pbalResent
    let timeout = 10;
    while(true) {
        // check if refresh button is present to determine page load
        if (document.querySelector(`[title="Refresh"]`)) {
            break;
        }
        timeout += 1;
        await sleep(timeout);
    }


    // fetching the current ether balance from zapper
    const balElement = document.querySelector('[data-testid="1"]');
    const currentBal = Number(balElement.textContent.replace(/[^\d.]/g, ""));


    // increase relevant balances
    totalBal = currentBal;

    console.log("total balance: " + totalBal);
    balElement.textContent = `${prettyNumber(totalBal)} ETH`;

    // add usd balance
    const usdBalContainer = document.createElement("div");

    usdBalContainer.id = "usd-bal-span";
    usdBalContainer.style.fontSize = "medium";
    usdBalContainer.style.float = "right";
    usdBalContainer.style.marginTop = "7px";
    usdBalContainer.style.marginLeft = "10px";

    console.log(balElement, usdBalContainer);

    balElement.appendChild(usdBalContainer);
    setUsdBal(priceInfo);

    const links = document.getElementsByTagName("a");
    for (const link of links) {
        if (link.href.includes("ethereum-staking")) {
            // the one we're after has child nodes
            if (link.hasChildNodes) {
                const spans = link.getElementsByTagName("span");
                for (const span of spans) {
                    if (span.textContent.includes("Ξ")) {
                        span.textContent = `Ξ ${prettyNumber(balance)}`;
                    }
                }
            }
        }
    }
}

main();
