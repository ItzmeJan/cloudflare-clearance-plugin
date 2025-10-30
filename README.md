# cloudflare-clearance-plugin
## cloudflare-clearance-plugin

Adds `browser.getClearance()` to every Puppeteer browser instance. Calling `getClearance()` disconnects Puppeteer from the current browser session and reconnects using `puppeteer-core.connect()`. This effectively resets the automation fingerprint session and can help when Cloudflare/Turnstile starts showing challenges or blocking requests.

### Install

```bash
npm install cloudflare-clearance-plugin puppeteer-extra puppeteer-core
```

Requires a Chromium/Chrome instance with remote debugging (WebSocket) enabled; otherwise `getClearance()` will throw.

### Quick start (ESM)

```js
import puppeteer from "puppeteer-extra";
import ClearancePlugin from "cloudflare-clearance-plugin";

puppeteer.use(ClearancePlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const freshBrowser = await browser.getClearance();
  const page = await freshBrowser.newPage();
  await page.goto("https://example.com");
})();
```

### Quick start (CommonJS)

```js
const puppeteer = require("puppeteer-extra");
const ClearancePlugin = require("cloudflare-clearance-plugin");

puppeteer.use(ClearancePlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const freshBrowser = await browser.getClearance();
  const page = await freshBrowser.newPage();
  await page.goto("https://example.com");
})();
```

### API Reference

- `ClearancePlugin(opts?) => PuppeteerExtraPlugin`
  - Injects `getClearance` on every launched `Browser`.
  - `opts` (object): Reserved for future options.

- `browser.getClearance() => Promise<import("puppeteer-core").Browser>`
  - Disconnects current Puppeteer session, reconnects via `puppeteer-core.connect()` to the same Chrome instance.
  - Returns a new `Browser` bound to a fresh CDP session.

### Behavior and notes

- Requires a valid WebSocket endpoint (`browser.wsEndpoint()`), typically available when launching Chrome with remote debugging.
- The returned `Browser` is a new connection; open new pages/contexts as needed.
- Works with the `puppeteer-extra` plugin system.

### License

ISC

