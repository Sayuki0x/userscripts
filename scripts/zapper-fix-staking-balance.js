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

const sleep = async (ms) => new Promise((res) => setTimeout(res, ms));

const prettyNumber = (x) => {
    return x.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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

    await sleep(200);

    // wait while loading spinner is pbalResent
    let exists = document.getElementsByClassName("lds-dual-ring");
    let timeout = 1;
    while (exists.length === 1) {
        await sleep(1);
        timeout *= 2;
        exists = document.getElementsByClassName("lds-dual-ring");
    }

    console.log("loaded");

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
    usdBalSpan.style.color = TEXT_ALT_COLOR;
    usdBalSpan.style.float = "right";
    usdBalSpan.style.marginTop = "7px";
    usdBalSpan.style.marginRight = "10px";

    percentSpan.style.fontSize = "small";
    percentSpan.style.marginLeft = "0.77rem";
    percentSpan.style.marginTop = "2.5px";
    percentSpan.style.color =
        priceInfo.percentage < 0 ? "rgb(236, 140, 212)" : "rgb(57, 255, 185)";

    setUsdBal(priceInfo);
    setPercentSpan(priceInfo);

    balElement.appendChild(usdBalSpan);

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

    let ethPriceSpan = document.createElement("span");

    for (const link of links) {
        if (link.href.includes("/dashboard")) {
            const newLink = link.cloneNode(true);
            ethPriceSpan.appendChild(newLink);
            link.parentElement.prepend(ethPriceSpan);
            break;
        }
    }

    console.log(ethPriceSpan);

    const [ethPriceImg] = ethPriceSpan.getElementsByTagName("img");
    ethPriceImg.src = "https://zapper.fi/images/networks/ethereum-icon.png";

    const [ethPriceTextSpan] = ethPriceSpan.getElementsByTagName("span");
    ethPriceTextSpan.parentElement.appendChild(percentSpan);
    ethPriceTextSpan.style.color = "#FFF";
    ethPriceTextSpan.textContent = `$${prettyNumber(priceInfo.last)}`;

    const setPriceText = (priceInfo) => {
        ethPriceTextSpan.textContent = `$${prettyNumber(priceInfo.last)}`;
    };

    const ws = new WebSocket("wss://base32.org/api/eth/price");
    ws.onopen = () => {
        console.log("websocket is listening");
    };
    ws.onmessage = (msg) => {
        const priceInfo = JSON.parse(msg.data);
        setUsdBal(priceInfo);
        setPercentSpan(priceInfo);
        setPriceText(priceInfo);
    };
})();
