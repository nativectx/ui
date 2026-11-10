// Run after pnpm build && pnpm --filter demo export:web. Serves the real demo export locally.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('apps/demo/dist');
const server = process.env.LAYOUT_BASE_URL ? null : createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = pathname === '/' ? '/index.html' : pathname;
  if (relative.includes('..')) { response.writeHead(400).end(); return; }
  for (const suffix of ['', '.html', '/index.html']) {
    try {
      const file = root + relative + suffix;
      const body = await readFile(file);
      const contentType = file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': contentType }).end(body);
      return;
    } catch { /* Try static export's extension and index conventions. */ }
  }
  response.writeHead(404).end();
});
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseURL = process.env.LAYOUT_BASE_URL ?? `http://127.0.0.1:${server.address().port}`;
const output = process.env.LAYOUT_OUTPUT ?? 'docs/pr-evidence/web-layout';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const measurements = [];
try {
  const context = await browser.newContext();
  await context.route('https://docs.expo.dev/**', route => route.fulfill({ contentType: 'text/html', body: '<title>External navigation verified</title>' }));
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  for (const width of [390, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(baseURL);
    const menu = page.getByRole('button', { name: 'Open menu' });
    if (width < 1024) {
      await menu.waitFor();
      await page.screenshot({ path: `${output}/home-${width}.png` });
      await menu.click();
      const drawerLink = page.getByText('Expo Docs', { exact: true });
      await drawerLink.waitFor();
      await page.waitForFunction(el => {
        for (let node = el; node; node = node.parentElement) {
          const transform = getComputedStyle(node).transform;
          if (transform !== 'none' && Math.abs(new DOMMatrixReadOnly(transform).m41) >= 0.1) return false;
        }
        const bounds = el.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= innerWidth;
      }, await drawerLink.elementHandle());
      const drawerBounds = await drawerLink.boundingBox();
      assert.ok(drawerBounds.x >= 0 && drawerBounds.x + drawerBounds.width <= width);
      await page.screenshot({ path: `${output}/drawer-${width}.png` });
      const popupPromise = page.waitForEvent('popup');
      await drawerLink.click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(new URL(popup.url()).hostname, 'docs.expo.dev');
      await popup.close();
      await page.getByRole('button', { name: 'Explore', exact: true }).click();
      await page.waitForURL('**/explore');
      measurements.push({ width, drawerBounds, drawerNavigation: 'passed', drawerExternalNavigation: 'passed' });
    } else {
      const home = page.locator('a').filter({ hasText: /Home$/ });
      const external = page.getByRole('link', { name: /Expo Docs/ });
      await external.waitFor();
      const metrics = async locator => locator.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const css = getComputedStyle(el);
        return { height: rect.height, left: css.paddingLeft, right: css.paddingRight };
      });
      const internal = await metrics(home);
      const outgoing = await metrics(external);
      assert.equal(outgoing.height, internal.height);
      assert.ok(outgoing.height >= 60);
      assert.equal(outgoing.left, internal.left);
      assert.equal(outgoing.left, '16px');
      assert.equal(outgoing.right, '16px');
      assert.equal(await external.getAttribute('href'), 'https://docs.expo.dev');
      assert.equal(await external.getAttribute('target'), '_blank');
      assert.match(await external.getAttribute('rel'), /noopener/);
      assert.match(await external.getAttribute('rel'), /noreferrer/);
      measurements.push({ width, internal, external: outgoing });
      const normalColor = await external.locator('[dir="auto"]').last().evaluate(el => getComputedStyle(el).color);
      await external.hover();
      const hoverColor = await external.locator('[dir="auto"]').last().evaluate(el => getComputedStyle(el).color);
      assert.notEqual(hoverColor, normalColor);
      await page.mouse.down();
      await page.waitForFunction(el => getComputedStyle(el).opacity === '0.7', await external.elementHandle());
      await page.mouse.move(0, 850);
      await page.mouse.up();
      await page.waitForFunction(el => getComputedStyle(el).opacity === '1', await external.elementHandle());
      // Reach the link using keyboard traversal, then activate with Enter.
      await home.focus();
      for (let i = 0; i < 8 && !(await external.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
      assert.ok(await external.evaluate(el => el === document.activeElement));
      await page.screenshot({ path: `${output}/home-keyboard-${width}.png` });
      const popupPromise = page.waitForEvent('popup');
      await page.keyboard.press('Enter');
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(new URL(popup.url()).hostname, 'docs.expo.dev');
      assert.equal(await popup.evaluate(() => window.opener), null);
      await popup.close();
      await external.evaluate(el => el.blur());
      await page.screenshot({ path: `${output}/home-${width}.png` });
    }
    await page.goto(`${baseURL}/explore/divider`);
    for (const rtl of [false, true]) {
      for (const inset of ['none', 'start', 'middle']) {
        const wrapper = page.getByTestId(`divider-${rtl ? 'rtl-' : ''}${inset}`);
        await wrapper.waitFor();
        const bounds = await wrapper.evaluate(el => {
          const parent = el.getBoundingClientRect();
          const line = el.firstElementChild.getBoundingClientRect();
          return { left: line.left - parent.left, right: parent.right - line.right, height: line.height };
        });
        const leading = inset === 'none' ? 0 : 16;
        const trailing = inset === 'middle' ? 16 : 0;
        assert.ok(Math.abs(bounds.left - (rtl ? trailing : leading)) < 1, JSON.stringify({ width, rtl, inset, bounds }));
        assert.ok(Math.abs(bounds.right - (rtl ? leading : trailing)) < 1, JSON.stringify({ width, rtl, inset, bounds }));
        assert.ok(bounds.height > 0);
        // A horizontal divider also fills an ordinary HTML block parent.
        const blockBounds = await wrapper.evaluate(el => {
          const previous = el.style.display;
          el.style.display = 'block';
          const parent = el.getBoundingClientRect();
          const line = el.firstElementChild.getBoundingClientRect();
          el.style.display = previous;
          return { left: line.left - parent.left, right: parent.right - line.right };
        });
        assert.ok(Math.abs(blockBounds.left - bounds.left) < 1);
        assert.ok(Math.abs(blockBounds.right - bounds.right) < 1);
        measurements.push({ width, rtl, inset, bounds, blockBounds });
      }
    }
    const vertical = await page.getByTestId('divider-vertical').evaluate(el => [...el.children].filter((_, index) => index === 1 || index === 3).map(child => ({ width: child.getBoundingClientRect().width, height: child.getBoundingClientRect().height })));
    assert.equal(vertical.length, 2);
    assert.ok(vertical.every(line => line.width > 0 && line.width <= 1 && line.height === 32));
    await page.getByTestId('divider-start').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/divider-${width}.png` });
  }
  await writeFile(`${output}/measurements.json`, JSON.stringify(measurements, null, 2));
  console.log(`Web layout checks passed; evidence: ${output}`);
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
