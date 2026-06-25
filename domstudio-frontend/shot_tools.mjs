import { chromium } from 'playwright';
const out = 'C:\\Users\\nate-\\AppData\\Local\\Temp\\claude\\c--Users-nate--Desktop-projects-domstudio\\b51fd33d-496a-40f7-98b7-69c670444e7f\\scratchpad\\tools_template.png';
const browser = await chromium.launch();
const ctx = await browser.newContext();

await ctx.addInitScript(() => {
  localStorage.setItem('domstudio_access', 'preview-access');
  localStorage.setItem('domstudio_refresh', 'preview-refresh');
  localStorage.setItem('domstudio_auth_storage_version', '2026-06-23-auth-v2');
});

const mockUser = { id: 1, email: 'demo@domstudio.ru', tokens: 500, plan: 'starter', is_verified: true };
await ctx.route('**/users/me/full', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) }));
await ctx.route('**/auth/refresh', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'preview-access', refresh_token: 'preview-refresh' }) }));
await ctx.route('**/content/tools', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tools: [] }) }));
await ctx.route('**/subscriptions/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
await ctx.route('**/users/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) }));

const page = await ctx.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://127.0.0.1:5173');
await page.waitForTimeout(3500);
await page.evaluate(() => {
  document.querySelector('[data-route="tools"]')?.click();
});
await page.waitForTimeout(800);
// Inject a mock removed-bg result so we can see the template picker
await page.evaluate(() => {
  // Create a tiny transparent PNG as a stand-in for the removed bg result
  const c = document.createElement('canvas'); c.width = 200; c.height = 200;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e0c080'; ctx.beginPath(); ctx.arc(100,100,80,0,Math.PI*2); ctx.fill();
  window.__state.templateBgRemoved = c.toDataURL();
  window.__state.templateSelected = 'studio';
  window.__render({ motion: false });
});
await page.waitForTimeout(400);
await page.evaluate(() => {
  document.querySelector('#tool-template')?.scrollIntoView({ block: 'start' });
});
await page.waitForTimeout(200);
await page.screenshot({ path: out, fullPage: false });
await browser.close();
