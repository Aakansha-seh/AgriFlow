# 🌾 AgriFlow Sampurna

**Post-Harvest Decision Intelligence for Karnataka's Farmers**
Built for the **Sampurna Grand Challenge 2026** · Track 6: Digital Decision Systems

> Every harvest deserves a smart decision. AgriFlow tells every farmer — in Kannada, Hindi or English, on any phone — whether to **SELL, STORE, PROCESS or WAIT**, backed by live mandi prices, weather forecasts and cold-storage availability.

---

## The problem

India loses an estimated **₹92,000 crore of food every year**; 25–40% of fruits and vegetables never reach a consumer. The root cause is not a missing cold store or a missing truck — it is a **missing decision**. A farmer who knew that tomato prices rise 12% in two days, that her batch has 5 days of shelf life, and that a cold store 8 km away has free capacity, would never dump produce at a loss.

## The solution

AgriFlow is a **decision intelligence layer**, not another marketplace. One screen, one recommendation:

| Module | What it does |
|---|---|
| 🧠 **AI Harvest Advisor** | Fuses live prices + weather + shelf-life + storage economics into a single confidence-scored action (Sell / Store / Process / Wait) with a plain-language explanation |
| 📡 **Live Mandi Prices** | Real-time Karnataka prices for all 7 priority crops, straight from the Government of India Agmarknet open-data API |
| ❄️ **Cold Storage Finder** | Distance-ranked facilities with live free capacity and per-day cost |
| 🚚 **Transport Pooling** | Matches neighbouring farmers on the same route to share one refrigerated truck (up to ~60% logistics saving) |
| 🏛️ **District Dashboard** | Surplus/glut signals, loss averted and infrastructure utilisation for government & FPOs |

**Covers all 7 Sampurna priority crops:** onion · mango · banana · tomato · grapes · pomegranate · pineapple.

## Why this can win with ₹0 funding

- **₹0 infrastructure** — pure static Progressive Web App. No servers, no database bills. Hosts free forever on GitHub Pages / Vercel / Netlify.
- **₹0 data cost** — Government of India **data.gov.in Agmarknet API** (mandi prices) and **Open-Meteo** (weather) are free public APIs.
- **Works offline** — service worker caches the app and last-fetched data; keeps functioning in 2G / zero-network villages. Installs to the home screen like a native app.
- **Explainable AI** — the decision engine is transparent and auditable: every recommendation shows exactly which factors (price trend, shelf life, heat, rain, storage economics) produced it. No black box, no GPU bill.
- **Vernacular-first** — full UI in ಕನ್ನಡ, हिंदी and English.

## Run locally

No build step. Any static server works:

```bash
npx serve .        # then open http://localhost:3000
# or
python -m http.server 8000
```

## Deploy free (pick one, ~5 minutes)

**GitHub Pages**
```bash
git init && git add -A && git commit -m "AgriFlow Sampurna"
gh repo create agriflow-sampurna --public --source . --push
gh api repos/{owner}/agriflow-sampurna/pages -X POST -f "source[branch]=main" -f "source[path]=/"
# Live at https://<you>.github.io/agriflow-sampurna/
```

**Vercel** — `npx vercel --prod` · **Netlify** — drag the folder onto https://app.netlify.com/drop

## Architecture (deliberately simple)

```
Browser (PWA, offline-first service worker)
 ├── js/engine.js   – transparent decision engine (score → rank → explain)
 ├── js/api.js      – data.gov.in Agmarknet + Open-Meteo, cached fallback
 ├── js/data.js     – crop science tables, districts, pilot cold-chain registry
 ├── js/i18n.js     – EN / KN / HI strings
 └── js/app.js      – views: advisor, prices, storage, pooling, dashboard
```

The full enterprise architecture (microservices, Kafka, CV grading, IoT cold-chain telemetry) is specified in the companion **AgriFlow AI Master Design Document** — this PWA is Phase 1, proving the decision layer with zero capital before scaling.

## Data sources & honesty notes

- Mandi prices: live from `api.data.gov.in` (Agmarknet). When offline/unreachable, the UI clearly badges data as **CACHED SAMPLE**.
- Weather: live from Open-Meteo.
- Cold storage / processor directories are **pilot demo datasets**, marked as such in the UI — the deployment path integrates the Dept. of Horticulture & KAPPEC registries.
- Crop shelf-life tables follow standard post-harvest handling ranges; the engine treats them as priors, not measurements.

---

*Built with ₹0 · runs on free public data · Sampurna Grand Challenge 2026*
