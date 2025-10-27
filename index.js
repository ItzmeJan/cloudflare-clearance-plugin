import { PuppeteerExtraPlugin } from "puppeteer-extra-plugin";
import puppeteerCore from "puppeteer-core";

/**
 * ClearancePlugin (ESM version)
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
 * import puppeteer from "puppeteer-extra";
 * import ClearancePlugin from "./clearance-plugin.js";
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
export default function ClearancePlugin(opts = {}) {
  return new class extends PuppeteerExtraPlugin {
    constructor() {
      super(opts);
    }

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
        if (!wsEndpoint) throw new Error("No WebSocket endpoint found — browser must support remote debugging.");

        // Detach current Puppeteer session
        browser.disconnect();

        // Reconnect fresh session (new CDP session)
        const freshBrowser = await puppeteerCore.connect({
          browserWSEndpoint: wsEndpoint,
          defaultViewport: null
        });

        return freshBrowser;
      };
    }
  };
}
