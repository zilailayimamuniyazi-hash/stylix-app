import { writeFile } from "node:fs/promises";

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:3001";
const DEBUG = process.env.QA_DEBUG_URL || "http://127.0.0.1:9222";

class Cdp {
  constructor(url) {
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.ws = new WebSocket(url);
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const handler = this.pending.get(message.id);
        if (handler) {
          this.pending.delete(message.id);
          if (message.error) handler.reject(new Error(message.error.message));
          else handler.resolve(message.result);
        }
      } else if (message.method) {
        for (const handler of this.events.get(message.method) ?? []) handler(message.params ?? {});
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, handler) {
    this.events.set(method, [...(this.events.get(method) ?? []), handler]);
  }
  close() { this.ws.close(); }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createBrowser() {
  const response = await fetch(`${DEBUG}/json/new?${encodeURIComponent(BASE)}`, { method: "PUT" });
  const target = await response.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Network.enable"),
  ]);
  return { cdp, target };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(cdp, path, wait = 1400) {
  await cdp.send("Page.navigate", { url: `${BASE}${path}` });
  for (let index = 0; index < 80; index++) {
    const ready = await evaluate(cdp, "document.readyState").catch(() => "loading");
    if (ready === "complete") break;
    await sleep(100);
  }
  await sleep(wait);
}

async function screenshot(cdp, name) {
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`/tmp/stylix-qa-${name}.png`, Buffer.from(data, "base64"));
}

async function clickText(cdp, text, exact = false) {
  return evaluate(cdp, `(() => {
    const wanted = ${JSON.stringify(text)};
    const nodes = [...document.querySelectorAll('button,a,label')];
    const node = nodes.find((item) => ${exact ? "item.textContent?.trim() === wanted" : "item.textContent?.includes(wanted)"});
    if (!node) return false;
    node.click();
    return true;
  })()`);
}

async function audit(cdp, path, name) {
  await navigate(cdp, path);
  const metrics = await evaluate(cdp, `(() => ({
    title: document.title,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: document.querySelector('h1')?.textContent?.trim() || '',
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    unlabeledButtons: [...document.querySelectorAll('button')].filter((button) => !button.textContent?.trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')).length,
    unlabeledFields: [...document.querySelectorAll('input:not([type="hidden"]),textarea,select')].filter((field) => {
      const id = field.getAttribute('id');
      return !field.getAttribute('aria-label') && !(id && document.querySelector('label[for="' + CSS.escape(id) + '"]')) && !field.closest('label');
    }).length,
    internalCopy: [...document.querySelectorAll('body *')].filter((node) => node.children.length === 0 && /placeholder page|coming soon|后续可|预留|demo mode|这里先做成/i.test(node.textContent || '')).map((node) => node.textContent.trim()).slice(0, 8),
  }))()`);
  await screenshot(cdp, name);
  return { path, ...metrics };
}

async function main() {
  const { cdp, target } = await createBrowser();
  const consoleErrors = [];
  const requestFailures = [];
  cdp.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error") consoleErrors.push(event.args.map((arg) => arg.value ?? arg.description).join(" "));
  });
  cdp.on("Network.loadingFailed", (event) => {
    if (!event.canceled) requestFailures.push(`${event.errorText} ${event.blockedReason ?? ""}`.trim());
  });
  cdp.on("Network.responseReceived", (event) => {
    if (event.response.status >= 400) requestFailures.push(`${event.response.status} ${event.response.url}`);
  });

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  const results = [];
  for (const [path, name] of [
    ["/", "home"], ["/shop", "shop"], ["/collection", "collection"],
    ["/product/aurora-celestial-band", "product"], ["/bead-lab", "diy"],
    ["/try-on", "tryon"], ["/test", "test"], ["/member", "member"],
    ["/vip-atelier", "atelier"], ["/daily", "daily"], ["/result", "result"],
    ["/identity-portrait", "identity-portrait"], ["/advisor", "advisor"],
    ["/wishlist", "wishlist"], ["/profile", "profile"], ["/vip", "vip"],
    ["/designers", "designers"], ["/admin/login", "admin-login"],
    ["/privacy", "privacy"], ["/terms", "terms"],
  ]) results.push(await audit(cdp, path, name));

  await navigate(cdp, "/bead-lab", 1800);
  await clickText(cdp, "手链", true);
  await sleep(700);
  await clickText(cdp, "晶石单圈手链");
  await sleep(900);
  await clickText(cdp, "18颗");
  await clickText(cdp, "配色方案", true);
  await sleep(400);
  await clickText(cdp, "蜜桃鎏金");
  await sleep(900);
  await clickText(cdp, "逐珠搭配", true);
  await sleep(500);
  await screenshot(cdp, "diy-crystal-editor");
  const diy = await evaluate(cdp, `({ canvas: !!document.querySelector('canvas'), buttons: document.querySelectorAll('button').length, text: document.body.innerText.includes('粉晶') })`);

  await navigate(cdp, "/bead-lab", 1600);
  await clickText(cdp, "手链", true);
  await sleep(500);
  await clickText(cdp, "晶石单圈手链");
  await sleep(700);
  await clickText(cdp, "长度", true);
  const braceletVariants = [];
  for (const count of [18, 19, 20, 21]) {
    await clickText(cdp, `${count}颗`);
    await sleep(450);
    const state = await evaluate(cdp, `(() => {
      const source = document.querySelector('canvas');
      if (!source) return { count: ${count}, canvas: false };
      const copy = document.createElement('canvas');
      copy.width = source.width; copy.height = source.height;
      const ctx = copy.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, 0, 0);
      const { data } = ctx.getImageData(0, 0, copy.width, copy.height);
      let minX = copy.width, minY = copy.height, maxX = -1, maxY = -1, pixels = 0;
      for (let y = 0; y < copy.height; y += 2) for (let x = 0; x < copy.width; x += 2) {
        const i = (y * copy.width + x) * 4;
        const bright = Math.max(data[i], data[i+1], data[i+2]);
        const dark = Math.min(data[i], data[i+1], data[i+2]);
        if (data[i+3] > 20 && bright > 105 && bright - dark > 10) {
          minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); pixels++;
        }
      }
      const selected = [...document.querySelectorAll('button')].find((button) => button.textContent?.includes('${count}颗') && button.getAttribute('aria-pressed') === 'true')?.textContent?.trim() || '';
      return { count: ${count}, canvas: true, selected, width: copy.width, height: copy.height, pixels,
        bounds: maxX < 0 ? null : { left: minX/copy.width, top: minY/copy.height, right: maxX/copy.width, bottom: maxY/copy.height } };
    })()`);
    braceletVariants.push(state);
    await screenshot(cdp, `bracelet-${count}`);
  }

  const categories = [];
  for (const label of ["戒指", "手镯", "项链", "耳饰", "手链"]) {
    await clickText(cdp, label, true);
    await sleep(500);
    const categoryState = await evaluate(cdp, `({
      label: ${JSON.stringify(label)},
      canvas: !!document.querySelector('canvas, model-viewer'),
      next: [...document.querySelectorAll('button')].some((button) => button.textContent?.includes('下一步')),
      summary: [...document.querySelectorAll('section')].map((section) => section.innerText).join(' ').includes('你的作品'),
    })`);
    categories.push(categoryState);
    await clickText(cdp, "下一步", true);
    await sleep(250);
    await clickText(cdp, "上一步", true);
    await sleep(250);
  }
  await clickText(cdp, "换个灵感", true);
  await sleep(350);
  const randomize = await evaluate(cdp, "document.body.innerText.includes('你的作品')");
  await clickText(cdp, "保存作品", true);
  await sleep(200);
  await clickText(cdp, "分享作品", true);
  await sleep(2200);
  const share = await evaluate(cdp, "!!document.querySelector('[role=dialog]') || document.body.innerText.includes('分享链接')");

  await navigate(cdp, "/try-on", 900);
  await clickText(cdp, "使用示例照片");
  await sleep(4500);
  await screenshot(cdp, "tryon-sample");
  await clickText(cdp, "戒指", true);
  await sleep(500);
  const ringButtons = await evaluate(cdp, "document.querySelectorAll('button[title]').length");

  await navigate(cdp, "/product/aurora-celestial-band", 1200);
  const added = await clickText(cdp, "加入购物袋");
  await sleep(500);
  await navigate(cdp, "/bag", 900);
  const bag = await evaluate(cdp, `({ hasItem: document.body.innerText.includes('Aurora Celestial Band'), hasCheckout: document.body.innerText.includes('结账') || document.body.innerText.includes('Checkout') })`);
  await screenshot(cdp, "bag-with-item");

  await navigate(cdp, "/checkout", 700);
  const checkout = await evaluate(cdp, `({
    fields: document.querySelectorAll('input,select').length,
    hasChina: [...document.querySelectorAll('option')].some((option) => option.value === 'CN'),
    hasSubmit: [...document.querySelectorAll('button')].some((button) => /支付|continue|checkout/i.test(button.textContent || '')),
  })`);
  await screenshot(cdp, "checkout");

  await navigate(cdp, "/test", 500);
  for (let step = 0; step < 4; step++) {
    await evaluate(cdp, `document.querySelectorAll('article').forEach((article) => article.querySelector('button')?.click())`);
    await sleep(250);
    if (step === 0) await clickText(cdp, "跳过，继续测试");
    else if (step < 3) await clickText(cdp, "继续下一部分");
    await sleep(350);
  }
  await clickText(cdp, "生成今日身份卡");
  await sleep(900);
  const jmti = await evaluate(cdp, `({ path: location.pathname, hasResult: document.body.innerText.includes('JMTI') && !!document.querySelector('h1') })`);
  await screenshot(cdp, "jmti-result");

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
  const mobile = [];
  for (const [path, name] of [["/", "mobile-home"], ["/test", "mobile-test"], ["/vip-atelier", "mobile-atelier"], ["/bead-lab", "mobile-diy"], ["/try-on", "mobile-tryon"], ["/shop", "mobile-shop"], ["/collection", "mobile-collection"], ["/product/aurora-celestial-band", "mobile-product"], ["/member", "mobile-member"], ["/bag", "mobile-bag"], ["/checkout", "mobile-checkout"]]) {
    mobile.push(await audit(cdp, path, name));
  }

  const report = { results, diy, braceletVariants, categories, randomize, share, ringButtons, added, bag, checkout, jmti, mobile, consoleErrors: [...new Set(consoleErrors)], requestFailures: [...new Set(requestFailures)] };
  const serialized = JSON.stringify(report, null, 2);
  await writeFile("/tmp/stylix-qa-report.json", serialized);
  console.log(serialized);
  cdp.close();
  await fetch(`${DEBUG}/json/close/${target.id}`);
}

const keepAlive = setInterval(() => {}, 1000);
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => clearInterval(keepAlive));
