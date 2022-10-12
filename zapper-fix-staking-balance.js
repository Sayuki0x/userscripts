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

(async function () {
    "use strict";

    // fetch validator balance from custom api
    const res = await fetch(
        "https://base32.org/api/eth/validator-balance/90016445a797bb81f131146df66e094271f7df43e82603c51180a83c76f283060611967972f327b0b4566097f608dc8d"
    );
    const { balance } = await res.json();
    const rewards = balance - 32;

    // wait while loading spinner is present
    let exists = document.getElementsByClassName("lds-dual-ring");
    let timeout = 1;
    while (!exists) {
        await sleep(1);
        timeout *= 2;
    }
    // we'll wait another 50ms just to allow things to finish rendering
    await sleep(50);

    // fetching the current ether balance from zapper
    const balElement = document.querySelector('[data-testid="1"]');
    const currentBal = Number(balElement.textContent.replace(/[^\d.]/g, ""));

    // increase relevant balances
    const totalBal = currentBal + rewards;
    balElement.textContent = `Ξ ${totalBal.toFixed(2)}`;
    const spans = document.getElementsByTagName("span");
    for (const span of spans) {
        // stupidly displays something besides 32 sometimes
        if (
            span.textContent.includes("Ξ 32") ||
            span.textContent.includes("Ξ 31")
        ) {
            span.textContent = "Ξ " + (32 + rewards).toFixed(2);
        }
    }
})();
