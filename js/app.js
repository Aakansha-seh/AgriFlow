/* ============================================================
   AgriFlow Sampurna — Application shell, views & rendering
   Vanilla JS single-page app. No frameworks, no build step.
   ============================================================ */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let VIEW = location.hash.replace("#", "") || "home";
let lastRec = null;            // last advisor result (for re-render on lang switch)
let lastRecInput = null;
let pricesCache = {};          // per-crop mandi price cache for the prices view
let currentPriceCrop = "tomato";

// ---------- persistent demo state (localStorage) ----------
const Store = {
  get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

function stats() {
  return Store.get("agf_stats", { advisories: 0, lossAverted: 0, pooledQtl: 0, bookings: 0 });
}
function bumpStats(patch) {
  const s = stats();
  Object.entries(patch).forEach(([k, v]) => s[k] = (s[k] || 0) + v);
  Store.set("agf_stats", s);
}

function pools() {
  let p = Store.get("agf_pools", null);
  if (!p) {
    const tomorrow = offsetDateStr(1);
    p = SEED_POOLS.map(x => ({ ...x, date: tomorrow }));
    Store.set("agf_pools", p);
  }
  return p;
}

// ---------- navigation ----------
function nav(view) {
  VIEW = view;
  location.hash = view;
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
window.addEventListener("hashchange", () => {
  const v = location.hash.replace("#", "");
  if (v && v !== VIEW) { VIEW = v; renderAll(); }
});

// ---------- helpers ----------
function fmtINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function cropOptions(sel) {
  return Object.values(CROPS).map(c =>
    `<option value="${c.id}" ${c.id === sel ? "selected" : ""}>${c.icon} ${c.agmark}</option>`).join("");
}
function districtOptions(sel) {
  return `<option value="">${t("selectDistrict")}</option>` + DISTRICTS.map(d =>
    `<option value="${d.id}" ${d.id === sel ? "selected" : ""}>${d.name}</option>`).join("");
}
function sourceBadge(src) {
  return src === "live"
    ? `<span class="badge badge-live">● ${t("live")}</span>`
    : `<span class="badge badge-cached">● ${t("cached")}</span>`;
}

/** Minimal responsive SVG line chart. */
function lineChart(series, { width = 640, height = 220, highlight = -1 } = {}) {
  const pad = { l: 56, r: 16, t: 18, b: 30 };
  const min = Math.min(...series) * 0.97, max = Math.max(...series) * 1.03;
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const x = i => pad.l + (i / (series.length - 1)) * W;
  const y = v => pad.t + H - ((v - min) / (max - min || 1)) * H;
  const pts = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${pad.l},${pad.t + H} ${pts} ${x(series.length - 1)},${pad.t + H}`;
  const gridLines = [0, 0.5, 1].map(f => {
    const v = min + (max - min) * f;
    return `<line x1="${pad.l}" y1="${y(v)}" x2="${width - pad.r}" y2="${y(v)}" class="grid"/>
            <text x="${pad.l - 8}" y="${y(v) + 4}" class="axis" text-anchor="end">₹${Math.round(v)}</text>`;
  }).join("");
  const dots = series.map((v, i) =>
    `<circle cx="${x(i)}" cy="${y(v)}" r="${i === highlight ? 6 : 3.5}" class="${i === highlight ? "dot-hl" : "dot"}"/>` +
    (i === highlight ? `<text x="${x(i)}" y="${y(v) - 12}" class="dot-label" text-anchor="middle">₹${v}</text>` : "")
  ).join("");
  const labels = series.map((v, i) =>
    `<text x="${x(i)}" y="${height - 8}" class="axis" text-anchor="middle">${i === 0 ? "Today" : "+" + i + "d"}</text>`).join("");
  return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="price chart">
    ${gridLines}
    <polygon points="${area}" class="area"/>
    <polyline points="${pts}" class="line"/>
    ${dots}${labels}
  </svg>`;
}

function barChart(items, { width = 640, height = 200 } = {}) {
  const pad = { l: 10, r: 10, t: 24, b: 30 };
  const max = Math.max(...items.map(i => i.value), 1);
  const W = width - pad.l - pad.r;
  const bw = W / items.length * 0.6;
  const bars = items.map((it, i) => {
    const bx = pad.l + (i + 0.2) * (W / items.length);
    const bh = (it.value / max) * (height - pad.t - pad.b);
    const by = height - pad.b - bh;
    return `<rect x="${bx}" y="${by}" width="${bw}" height="${Math.max(2, bh)}" rx="4" class="bar"/>
      <text x="${bx + bw / 2}" y="${by - 6}" class="axis" text-anchor="middle">${it.value}</text>
      <text x="${bx + bw / 2}" y="${height - 10}" class="axis" text-anchor="middle">${it.label}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${width} ${height}" class="chart">${bars}</svg>`;
}

// ============================================================
// VIEWS
// ============================================================

function viewHome() {
  const s = stats();
  return `
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-badge">🇮🇳 Sampurna Grand Challenge 2026 · Track: Digital Decision Systems</div>
      <h1>${t("heroTitle")}</h1>
      <p class="hero-sub">${t("heroSub")}</p>
      <div class="hero-cta">
        <button class="btn btn-primary btn-lg" onclick="nav('advisor')">🌾 ${t("ctaAdvisor")}</button>
        <button class="btn btn-ghost btn-lg" onclick="nav('prices')">📈 ${t("ctaPrices")}</button>
      </div>
      <div class="hero-stats">
        <div class="hstat"><b>25–40%</b><span>post-harvest loss today</span></div>
        <div class="hstat"><b>₹92,000 Cr</b><span>lost nationally / year</span></div>
        <div class="hstat"><b>7 crops</b><span>onion · mango · banana · tomato · grapes · pomegranate · pineapple</span></div>
        <div class="hstat"><b>₹0</b><span>infrastructure cost to run</span></div>
      </div>
    </div>
  </section>

  <section class="cards-3">
    <div class="feature" onclick="nav('advisor')">
      <div class="feature-ic">🧠</div><h3>${t("navAdvisor")}</h3>
      <p>Sell / Store / Process / Wait — one confidence-scored answer per batch, explained in plain language.</p>
    </div>
    <div class="feature" onclick="nav('prices')">
      <div class="feature-ic">📡</div><h3>${t("navPrices")}</h3>
      <p>Live Agmarknet prices from the Govt. of India open-data API. Zero cost, always current.</p>
    </div>
    <div class="feature" onclick="nav('storage')">
      <div class="feature-ic">❄️</div><h3>${t("navStorage")}</h3>
      <p>Find free cold-storage capacity near your farm with distance and per-day cost.</p>
    </div>
    <div class="feature" onclick="nav('pool')">
      <div class="feature-ic">🚚</div><h3>${t("navPool")}</h3>
      <p>Share one refrigerated truck with neighbours — cut logistics cost by up to 60%.</p>
    </div>
    <div class="feature" onclick="nav('dash')">
      <div class="feature-ic">🏛️</div><h3>${t("navDash")}</h3>
      <p>District-level surplus signals and infrastructure utilisation for government & FPOs.</p>
    </div>
    <div class="feature">
      <div class="feature-ic">📱</div><h3>Offline-first PWA</h3>
      <p>Installs on any smartphone, keeps working on 2G or no network — built for rural reality.</p>
    </div>
  </section>

  ${s.advisories > 0 ? `
  <section class="panel">
    <h2>📊 This device so far</h2>
    <div class="stat-row">
      <div class="stat"><b>${s.advisories}</b><span>${t("dashAdvisories")}</span></div>
      <div class="stat"><b>${fmtINR(s.lossAverted)}</b><span>${t("dashLossAverted")}</span></div>
      <div class="stat"><b>${s.pooledQtl}</b><span>${t("dashPooled")}</span></div>
    </div>
  </section>` : ""}`;
}

// ---------- Advisor ----------
function viewAdvisor() {
  const today = todayStr();
  return `
  <section class="panel">
    <h1>🧠 ${t("advisorTitle")}</h1>
    <p class="sub">${t("advisorSub")}</p>
    <form id="advForm" class="grid-form" onsubmit="runAdvisor(event)">
      <label>${t("crop")}
        <select id="advCrop" required>${cropOptions(lastRecInput?.cropId || "tomato")}</select>
      </label>
      <label>${t("quantity")}
        <input id="advQty" type="number" min="1" max="10000" value="${lastRecInput?.qtyQtl || 15}" required>
      </label>
      <label>${t("harvestDate")}
        <input id="advDate" type="date" max="${today}" value="${lastRecInput?.harvestDate || today}" required>
      </label>
      <label>${t("district")}
        <select id="advDistrict" required>${districtOptions(lastRecInput?.districtId || "kolar")}</select>
      </label>
      <button class="btn btn-primary btn-lg" type="submit">⚡ ${t("getRec")}</button>
    </form>
    <div id="advResult">${lastRec ? renderRecommendation(lastRec, lastRecInput) : ""}</div>
  </section>`;
}

async function runAdvisor(e) {
  e.preventDefault();
  const input = {
    cropId: $("#advCrop").value,
    qtyQtl: parseFloat($("#advQty").value),
    harvestDate: $("#advDate").value,
    districtId: $("#advDistrict").value
  };
  $("#advResult").innerHTML = `<div class="loading"><div class="spinner"></div>${t("analyzing")}</div>`;
  const [priceData, weatherData] = await Promise.all([
    API.mandiPrices(input.cropId),
    API.weather(input.districtId)
  ]);
  const rec = Engine.recommend({ ...input, priceData, weatherData });
  lastRec = rec; lastRecInput = input;
  // Loss-averted heuristic: acting on advice saves ~12% of today's batch value
  bumpStats({ advisories: 1, lossAverted: Math.round(rec.revenueNow * 0.12) });
  $("#advResult").innerHTML = renderRecommendation(rec, input);
  $("#advResult").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRecommendation(rec, input) {
  const crop = CROPS[input.cropId];
  const explanation = Engine.explain(rec, input.cropId, LANG);
  const actionClass = { SELL_NOW: "act-sell", WAIT: "act-wait", STORE: "act-store", PROCESS: "act-process" }[rec.action];
  const actionIcon = { SELL_NOW: "🏷️", WAIT: "⏳", STORE: "❄️", PROCESS: "🏭" }[rec.action];
  const alts = rec.ranked.slice(1).filter(([, v]) => v > 0).map(([a, v]) =>
    `<span class="alt-chip">${t("actionNames")[a]} · ${t("actionScore")} ${Math.round(v)}</span>`).join("");

  return `
  <div class="rec-card ${actionClass}">
    <div class="rec-head">
      <div class="rec-action">${actionIcon} ${t("actionNames")[rec.action]}</div>
      <div class="rec-conf">
        <div class="conf-ring" style="--pct:${rec.confidence}"><b>${rec.confidence}%</b></div>
        <span>${t("confidence")}</span>
      </div>
    </div>
    <p class="rec-explain">${esc(explanation)}</p>
    <div class="rec-facts">
      <div class="fact"><span>${t("shelfLife")}</span><b>${rec.shelf} ${t("days")}</b></div>
      <div class="fact"><span>${t("revenueNow")}</span><b>${fmtINR(rec.revenueNow)}</b></div>
      <div class="fact"><span>${t("revenueBest")}</span><b>${fmtINR(rec.revenueBest)}</b></div>
      <div class="fact"><span>Δ</span><b class="${rec.revenueBest > rec.revenueNow ? "pos" : ""}">+${fmtINR(rec.revenueBest - rec.revenueNow)}</b></div>
    </div>
    <h3>${t("outlook7")} ${sourceBadge(rec.dataSources.price)}</h3>
    ${lineChart(rec.outlook.series, { highlight: rec.bestDay })}
    <div class="rec-cols">
      ${rec.storage ? `
      <div class="mini-card">
        <h4>❄️ ${t("nearestStorage")}</h4>
        <b>${esc(rec.storage.name)}</b>
        <p>${rec.storage.km} km · ${rec.storage.freeT} t ${t("free").toLowerCase()} · ₹${rec.storage.pricePerQtlDay}/qtl/${t("days").slice(0, 3)}</p>
      </div>` : ""}
      ${rec.processor ? `
      <div class="mini-card">
        <h4>🏭 ${t("nearestProcessor")}</h4>
        <b>${esc(rec.processor.name)}</b>
        <p>${rec.processor.km} km · ${esc(rec.processor.products)} · min ${rec.processor.minQtl} qtl</p>
      </div>` : ""}
    </div>
    <h4 class="alts-h">${t("alternatives")}</h4>
    <div class="alts">${alts}</div>
    <div class="weather-strip">
      🌡️ 3-day max ${rec.heat}°C · 🌧️ rain probability ${rec.rain3d}% ${sourceBadge(rec.dataSources.weather)}
    </div>
  </div>`;
}

// ---------- Mandi prices ----------
function viewPrices() {
  return `
  <section class="panel">
    <h1>📡 ${t("pricesTitle")}</h1>
    <p class="sub">${t("pricesSub")}</p>
    <div class="crop-tabs">
      ${Object.values(CROPS).map(c =>
        `<button class="crop-tab ${c.id === currentPriceCrop ? "on" : ""}" onclick="loadPrices('${c.id}')">${c.icon} ${c.agmark}</button>`).join("")}
    </div>
    <div id="priceTable"><div class="loading"><div class="spinner"></div>${t("analyzing")}</div></div>
  </section>`;
}

async function loadPrices(cropId) {
  currentPriceCrop = cropId;
  $$(".crop-tab").forEach(b => b.classList.toggle("on", b.textContent.includes(CROPS[cropId].agmark)));
  const el = $("#priceTable");
  if (el) el.innerHTML = `<div class="loading"><div class="spinner"></div>${t("analyzing")}</div>`;
  if (!pricesCache[cropId]) pricesCache[cropId] = await API.mandiPrices(cropId);
  const data = pricesCache[cropId];
  if (!$("#priceTable")) return;
  const rows = data.records.slice(0, 15).map(r => `
    <tr>
      <td>${esc(r.market)}</td>
      <td class="num"><b>${fmtINR(r.modal)}</b></td>
      <td class="num">${fmtINR(r.min)}</td>
      <td class="num">${fmtINR(r.max)}</td>
      <td>${esc(r.date || "")}</td>
    </tr>`).join("");
  $("#priceTable").innerHTML = `
    <div class="table-meta">${sourceBadge(data.source)} · ${data.records.length} markets</div>
    <div class="table-wrap"><table>
      <thead><tr><th>${t("market")}</th><th class="num">${t("modal")}</th><th class="num">${t("min")}</th><th class="num">${t("max")}</th><th>${t("date")}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

// ---------- Cold storage ----------
function viewStorage() {
  const sel = Store.get("agf_cs_district", "kolar");
  const booked = Store.get("agf_bookings", []);
  const d = districtById(sel);
  const list = COLD_STORAGES
    .map(cs => ({ ...cs, km: d ? distKm(d.lat, d.lng, cs.lat, cs.lng) : 0 }))
    .sort((a, b) => a.km - b.km);
  return `
  <section class="panel">
    <h1>❄️ ${t("storageTitle")}</h1>
    <p class="sub">${t("storageSub")}</p>
    <label class="inline-label">${t("district")}
      <select onchange="Store.set('agf_cs_district', this.value); renderAll()">${districtOptions(sel)}</select>
    </label>
    <div class="cs-grid">
      ${list.map(cs => {
        const util = Math.round((1 - cs.freeT / cs.capacityT) * 100);
        const isBooked = booked.includes(cs.id);
        return `
        <div class="cs-card">
          <div class="cs-head"><b>${esc(cs.name)}</b><span class="km">${cs.km} km</span></div>
          <div class="cs-crops">${cs.crops.map(c => CROPS[c].icon).join(" ")}</div>
          <div class="cs-meter"><div style="width:${util}%"></div></div>
          <div class="cs-meta">
            <span>${t("free")}: <b>${cs.freeT} t</b> / ${cs.capacityT} t</span>
            <span>${t("price")}: <b>₹${cs.pricePerQtlDay}</b>/qtl/day</span>
          </div>
          <button class="btn ${isBooked ? "btn-done" : "btn-primary"}" ${isBooked ? "disabled" : ""}
            onclick="bookStorage('${cs.id}')">${isBooked ? t("booked") : t("book")}</button>
        </div>`;
      }).join("")}
    </div>
  </section>`;
}

function bookStorage(id) {
  const b = Store.get("agf_bookings", []);
  if (!b.includes(id)) { b.push(id); Store.set("agf_bookings", b); bumpStats({ bookings: 1 }); }
  renderAll();
}

// ---------- Transport pooling ----------
function viewPool() {
  const myPools = pools();
  return `
  <section class="panel">
    <h1>🚚 ${t("poolTitle")}</h1>
    <p class="sub">${t("poolSub")}</p>
    <form class="grid-form" onsubmit="postPool(event)">
      <label>${t("poolYourName")}<input id="plName" required maxlength="40" placeholder="e.g., Aakansha"></label>
      <label>${t("crop")}<select id="plCrop">${cropOptions("tomato")}</select></label>
      <label>${t("poolQty")}<input id="plQty" type="number" min="1" max="200" value="10" required></label>
      <label>${t("poolFrom")}<select id="plFrom" required>${districtOptions("kolar")}</select></label>
      <label>${t("poolTo")}<select id="plTo" required>${districtOptions("bengaluru")}</select></label>
      <label>${t("poolDate")}<input id="plDate" type="date" min="${todayStr()}" value="${offsetDateStr(1)}" required></label>
      <button class="btn btn-primary btn-lg" type="submit">📦 ${t("poolPost")}</button>
    </form>
    <div id="poolResult"></div>
    <h3 class="pool-list-h">${t("poolMatches")}</h3>
    <div class="pool-list">
      ${myPools.map(p => {
        const from = districtById(p.from), to = districtById(p.to);
        return `
        <div class="pool-card ${p.mine ? "mine" : ""}">
          <div class="pool-route"><b>${from?.name || p.from}</b> → <b>${to?.name || p.to}</b></div>
          <div class="pool-meta">${CROPS[p.crop]?.icon || ""} ${p.qtyQtl} qtl · ${esc(p.farmer)} · 📅 ${p.date}${p.mine ? " · ⭐ you" : ""}</div>
        </div>`;
      }).join("")}
    </div>
  </section>`;
}

function postPool(e) {
  e.preventDefault();
  const req = {
    id: "u" + Date.now(),
    farmer: $("#plName").value.trim(),
    crop: $("#plCrop").value,
    qtyQtl: parseFloat($("#plQty").value),
    from: $("#plFrom").value,
    to: $("#plTo").value,
    date: $("#plDate").value,
    mine: true
  };
  const all = pools();
  const matches = all.filter(p => p.from === req.from && p.to === req.to && p.date === req.date && !p.mine);
  all.unshift(req);
  Store.set("agf_pools", all);
  bumpStats({ pooledQtl: req.qtyQtl });

  const from = districtById(req.from), to = districtById(req.to);
  const km = from && to ? distKm(from.lat, from.lng, to.lat, to.lng) : 100;
  const soloCost = Math.round(km * TRANSPORT_RATE_PER_T_KM * Math.max(3, req.qtyQtl / 10)); // min 3t truck
  const totalQtl = req.qtyQtl + matches.reduce((s, m) => s + m.qtyQtl, 0);
  const sharedCost = matches.length
    ? Math.round(km * TRANSPORT_RATE_PER_T_KM * (totalQtl / 10) * (req.qtyQtl / totalQtl))
    : soloCost;
  const saving = Math.max(0, soloCost - sharedCost);

  $("#poolResult").innerHTML = matches.length ? `
    <div class="pool-match-banner">
      ✅ ${matches.length} match${matches.length > 1 ? "es" : ""} found on ${from.name} → ${to.name} (${km} km)!<br>
      <b>${fmtINR(saving)}</b> ${t("poolSavings")} <small>(solo ≈${fmtINR(soloCost)} → shared ≈${fmtINR(sharedCost)})</small>
    </div>` : `
    <div class="pool-match-banner neutral">📮 ${t("poolNoMatch")}</div>`;
  // re-render the list below the banner
  const banner = $("#poolResult").innerHTML;
  renderAll();
  $("#poolResult").innerHTML = banner;
}

// ---------- Dashboard ----------
function viewDash() {
  const s = stats();
  const totalCap = COLD_STORAGES.reduce((a, c) => a + c.capacityT, 0);
  const totalFree = COLD_STORAGES.reduce((a, c) => a + c.freeT, 0);
  const util = Math.round((1 - totalFree / totalCap) * 100);
  const poolItems = pools();
  const districtCounts = {};
  poolItems.forEach(p => districtCounts[p.from] = (districtCounts[p.from] || 0) + p.qtyQtl);
  const bars = Object.entries(districtCounts).slice(0, 6).map(([d, v]) =>
    ({ label: (districtById(d)?.name || d).split(" ")[0], value: v }));

  // Seasonal stress signal: crops whose current month index is below 0.85 (glut risk)
  const month = new Date().getMonth();
  const glutRisk = Object.entries(SEASONAL_INDEX)
    .filter(([, idx]) => idx[month] <= 0.85)
    .map(([c]) => CROPS[c]);

  return `
  <section class="panel">
    <h1>🏛️ ${t("dashTitle")}</h1>
    <p class="sub">${t("dashSub")}</p>
    <div class="stat-row">
      <div class="stat"><b>${s.advisories}</b><span>${t("dashAdvisories")}</span></div>
      <div class="stat"><b>${fmtINR(s.lossAverted)}</b><span>${t("dashLossAverted")}</span></div>
      <div class="stat"><b>${s.pooledQtl}</b><span>${t("dashPooled")}</span></div>
      <div class="stat"><b>${util}%</b><span>${t("dashStorageUtil")}</span></div>
    </div>
    <div class="dash-cols">
      <div class="mini-card">
        <h4>🚚 Pooled loads by origin district (qtl)</h4>
        ${bars.length ? barChart(bars) : "<p>No pool activity yet.</p>"}
      </div>
      <div class="mini-card">
        <h4>⚠️ Seasonal glut-risk crops this month</h4>
        ${glutRisk.length
          ? glutRisk.map(c => `<div class="glut-row">${c.icon} <b>${c.agmark}</b> — price index low; route surplus to: ${c.processing[0]}</div>`).join("")
          : "<p>No major glut signals this month.</p>"}
        <h4 style="margin-top:14px">❄️ Cold-chain capacity (pilot network)</h4>
        <div class="glut-row">Total <b>${totalCap.toLocaleString("en-IN")} t</b> · Free <b>${totalFree.toLocaleString("en-IN")} t</b> · ${COLD_STORAGES.length} facilities</div>
      </div>
    </div>
  </section>`;
}

// ============================================================
// SHELL RENDER
// ============================================================

function renderAll() {
  const views = { home: viewHome, advisor: viewAdvisor, prices: viewPrices, storage: viewStorage, pool: viewPool, dash: viewDash };
  const navItems = [
    ["home", "🏠", t("navHome")], ["advisor", "🧠", t("navAdvisor")],
    ["prices", "📡", t("navPrices")], ["storage", "❄️", t("navStorage")],
    ["pool", "🚚", t("navPool")], ["dash", "🏛️", t("navDash")]
  ];
  $("#app").innerHTML = `
    <header class="topbar">
      <div class="brand" onclick="nav('home')">
        <span class="brand-logo">🌾</span>
        <span class="brand-name">AgriFlow <em>Sampurna</em></span>
      </div>
      <nav class="nav-desktop">
        ${navItems.map(([v, ic, label]) =>
          `<button class="nav-btn ${VIEW === v ? "on" : ""}" onclick="nav('${v}')">${ic} ${label}</button>`).join("")}
      </nav>
      <div class="lang-switch">
        ${["en", "kn", "hi"].map(l =>
          `<button class="${LANG === l ? "on" : ""}" onclick="setLang('${l}')">${{ en: "EN", kn: "ಕ", hi: "हि" }[l]}</button>`).join("")}
      </div>
    </header>
    ${!navigator.onLine ? `<div class="offline-bar">📴 ${t("offline")}</div>` : ""}
    <main>${(views[VIEW] || viewHome)()}</main>
    <nav class="nav-mobile">
      ${navItems.map(([v, ic, label]) =>
        `<button class="${VIEW === v ? "on" : ""}" onclick="nav('${v}')"><span>${ic}</span>${label}</button>`).join("")}
    </nav>
    <footer class="foot">${t("footNote")}</footer>`;

  if (VIEW === "prices") loadPrices(currentPriceCrop);
}

window.addEventListener("online", renderAll);
window.addEventListener("offline", renderAll);

// PWA service worker
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

renderAll();
