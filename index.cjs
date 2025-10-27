const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");
const puppeteerCore = require("puppeteer-core");

/**
 * ClearancePlugin (CommonJS version)
 *
 * Adds `browser.getClearance()` to every Puppeteer browser instance.
 *
 * `getClearance()` disconnects Puppeteer from the current browser session
 * and reconnects using `puppeteer-core.connect()`, effectively resetting the
 * automation fingerprint session, useful when Cloudflare / Turnstile starts
 * showing challenges or blocking requests.
 *
 * Example:
 * ```js
 * const puppeteer = require("puppeteer-extra");
 * const ClearancePlugin = require("./clearance-plugin.cjs");
 *
 * puppeteer.use(ClearancePlugin());
 *
 * (async () => {
 *   const browser = await puppeteer.launch({ headless: false });
 *   // ... Cloudflare blocks ...
 *   const freshBrowser = await browser.getClearance();
 *   const page = await freshBrowser.newPage();
 *   await page.goto("https://example.com");
 * })();
 * ```
 *
 * @param {object} [opts]
 * @returns {PuppeteerExtraPlugin}
 */
module.exports = function ClearancePlugin(opts = {}) {
  return new class extends PuppeteerExtraPlugin(opts) {
    get name() {
      return "clearance-plugin";
    }

    async onBrowser(browser) {

      /**
       * Refresh Puppeteer connection to bypass Cloudflare automation detection.
       *
       * Disconnects the current Puppeteer instance and reconnects it through
       * `puppeteer-core.connect()` using the same Chrome instance and WebSocket.
       *
       * @example
       * ```js
       * const freshBrowser = await browser.getClearance();
       * ```
       *
       * @returns {Promise<import("puppeteer-core").Browser>}
       */
      browser.getClearance = async function () {
        const wsEndpoint = browser.wsEndpoint();
        if (!wsEndpoint) throw new Error("No WebSocket endpoint found — is this a remote/real browser?");

        // Detach current Puppeteer session
        browser.disconnect();

        // Reconnect fresh session (new CDP control session)
        const freshBrowser = await puppeteerCore.connect({
          browserWSEndpoint: wsEndpoint,
          defaultViewport: null
        });

        return freshBrowser;
      };
    }
  };
};
