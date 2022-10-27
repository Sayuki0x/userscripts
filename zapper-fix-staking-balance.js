// ==UserScript==
// @name         Zapper - Fix Staking Balance
// @namespace    https://base32.org/
// @version      0.1
// @description  Fetches validator rewards from custom API and adds them to your zapper balance
// @author       ExtraHash
// @match        https://zapper.fi/dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zapper.fi
// @grant        none
// ==/UserScript==

const sleep = async (ms) => new Promise((res, rej) => setTimeout(res, ms));

const prettyNumber = (x) => {
    return Number(x.toFixed(2))
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

(async function () {
    "use strict";

    const TEXT_ALT_COLOR = "#c7d2da";

    // fetch validator balance from custom api
    const balRes = await fetch(
        "https://base32.org/api/eth/validator-balance/90016445a797bb81f131146df66e094271f7df43e82603c51180a83c76f283060611967972f327b0b4566097f608dc8d"
    );
    const { balance } = await balRes.json();
    const rewards = balance - 32;

    // fetch eth price
    const priceRes = await fetch("https://base32.org/api/eth/price");
    const priceInfo = await priceRes.json();

    console.log("fetched info", priceInfo);

    // wait while loading spinner is pbalResent
    let exists = document.getElementsByClassName("lds-dual-ring");
    let timeout = 1;
    while (exists.length === 1) {
        await sleep(1);
        timeout *= 2;
        exists = document.getElementsByClassName("lds-dual-ring");
    }

    // fetching the current ether balance from zapper
    const balElement = document.querySelector('[data-testid="1"]');
    const currentBal = Number(balElement.textContent.replace(/[^\d.]/g, ""));
    console.log("current balance: " + currentBal);
    console.log("rewards: " + rewards);

    // increase relevant balances
    const totalBal = currentBal + rewards;

    console.log("total balance: " + totalBal);

    balElement.textContent = `Ξ ${prettyNumber(totalBal)}`;

    // add usd balance
    const usdBalSpan = document.createElement("span");

    const percentSpan = document.createElement("span");

    const setUsdBal = (priceInfo) => {
        usdBalSpan.textContent = `$${prettyNumber(totalBal * priceInfo.last)}`;
    };

    const setPercentSpan = (priceInfo) => {
        percentSpan.textContent = `${priceInfo.percentage.toFixed(2)}%`;
        percentSpan.style.color =
            priceInfo.percentage < 0
                ? "rgb(236, 140, 212)"
                : "rgb(57, 255, 185)";
    };

    usdBalSpan.style.fontSize = "medium";
    usdBalSpan.style.marginLeft = "0.77rem";
    usdBalSpan.style.color = TEXT_ALT_COLOR;

    percentSpan.style.fontSize = "small";
    percentSpan.style.marginLeft = "0.77rem";
    percentSpan.style.color =
        priceInfo.percentage < 0 ? "rgb(236, 140, 212)" : "rgb(57, 255, 185)";

    setUsdBal(priceInfo);
    setPercentSpan(priceInfo);

    balElement.appendChild(usdBalSpan);
    balElement.appendChild(percentSpan);

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

    const ws = new WebSocket("wss://base32.org/api/eth/price");
    ws.onopen = () => {
        console.log("websocket is listening");
    };
    ws.onmessage = (msg) => {
        const priceInfo = JSON.parse(msg.data);
        setUsdBal(priceInfo);
        setPercentSpan(priceInfo);
    };
})();
