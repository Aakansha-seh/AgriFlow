# Sampurna Grand Challenge 2026 — Application Pitch Pack
### AgriFlow Sampurna · Track 6: Digital Decision Systems
*Draft answers for the online application form (deadline: 10 July 2026). Edit the [bracketed] parts with your personal details.*

---

## 1. One-line summary

AgriFlow Sampurna is a zero-infrastructure-cost, offline-capable decision-intelligence platform that tells every Karnataka farmer — in Kannada, on any smartphone — whether to **sell, store, process or wait** after harvest, using live government mandi prices, weather forecasts and cold-chain availability.

## 2. The problem we solve (and why current solutions fail)

Post-harvest loss is a *decision failure* before it is an infrastructure failure. A tomato farmer in Kolar loses money not because no cold store exists, but because at the moment of harvest she cannot answer three questions: *What is today's real price? Will it rise within my produce's shelf life? Is there affordable storage nearby?*

Existing apps show raw prices (information) but leave the farmer to do the analysis (decision). Marketplaces add a transaction layer but no intelligence. AgriFlow closes exactly that gap: it **fuses price trend + shelf-life + weather + storage economics into one confidence-scored, explained recommendation** — the digital equivalent of an agronomist + commission agent + logistics manager standing beside every farmer.

## 3. Innovation

1. **Decision, not data.** One actionable answer (SELL NOW / WAIT / COLD STORE / PROCESS) with a confidence score and a plain-Kannada explanation of *why* — auditable by farmer, FPO and government alike.
2. **Radically frugal architecture.** The entire platform runs as a Progressive Web App on free public data (Government of India Agmarknet API, Open-Meteo). Operating cost: ₹0 per farmer per year. This is not a compromise — it is the innovation: solutions for smallholders fail when their unit economics don't survive beyond grant funding.
3. **Offline-first for rural reality.** Installs like an app, keeps working with zero network using last-synced data, clearly badged.
4. **Circular-economy routing built in.** When the engine detects glut pricing, it routes surplus toward the nearest processing unit (puree, dehydration, pulp, raisins, arils) instead of distress sale or dumping — directly linking Track 6 to Track 7 (circular economy).
5. **Cost-shared logistics.** Transport pooling matches neighbouring smallholders on the same route and date; a shared reefer truck cuts per-quintal logistics cost by up to 60%.

## 4. Scalability & replicability across priority crops

- Already covers **all seven priority crops** — onion, mango, banana, tomato, grapes, pomegranate, pineapple — through a crop-knowledge table (shelf life, temperature sensitivity, storability, processing pathways, seasonality priors). Adding a crop is adding one row, not one project.
- District-agnostic: works today for 20 Karnataka districts; extending to all of Karnataka (or any Agmarknet-covered state) is configuration, not code.
- The static-PWA architecture serves 10 or 10 million users at essentially the same cost, from a CDN.
- Roadmap to the full platform (computer-vision quality grading, IoT cold-chain telemetry, digital twin traceability, government analytics) is specified in our Master Design Document; the PWA is the wedge that builds the user base and data first.

## 5. Execution capacity & deployment plan (Karnataka)

- **Phase 0 (now):** Working product deployed at [YOUR-LIVE-URL]. Try it on any phone.
- **Phase 1 (months 1–3):** Pilot with 2–3 FPOs in Kolar (tomato) and Vijayapura (onion/grapes); onboard via WhatsApp link — no app store needed. Replace pilot cold-storage dataset with the Dept. of Horticulture registry.
- **Phase 2 (months 4–9):** 10,000 farmers across 6 districts; add SMS advisory fallback for feature phones; begin measuring loss-averted against district baselines.
- **Phase 3 (months 10+):** CV-based quality grading and FPO dashboards; state-wide rollout with the mentorship and government linkages this Challenge provides.

## 6. Impact model (conservative)

| Assumption | Value |
|---|---|
| Farmers reached in pilot year | 10,000 |
| Avg. marketed produce per farmer | 30 quintals/yr |
| Baseline post-harvest loss | 25% |
| Loss reduction from better timing/storage/processing decisions | 15% relative (loss 25% → 21.25%) |
| Avg. value | ₹2,000/quintal |
| **Value saved per year** | **≈ ₹2.25 crore** for pilot cohort |
| Cost to operate platform | ≈ ₹0 (static hosting free tier) |

Every rupee of Challenge support goes to field adoption (FPO onboarding, training, vernacular content), not cloud bills.

## 7. Business model (post-pilot)

Farmers: free, always. Revenue from: FPO/enterprise dashboards (SaaS), cold-storage slot marketplace commission, anonymised surplus-forecast data licensing to processors, and government advisory analytics — as specified in the Master Design Document's revenue model.

## 8. Team

[YOUR NAME] — [1–2 lines: background, why you]. Supported by the AgriFlow AI Master Design Document (60+ page enterprise architecture blueprint) demonstrating the full build-out path.

## 9. What we ask from Sampurna

FPO introductions in Kolar/Vijayapura, access to the Dept. of Horticulture cold-storage registry, mentorship on agronomy validation, and visibility — not cloud budget: the platform runs free by design.

---

## Demo script (2 minutes, for judges)

1. Open the live URL on a phone → switch UI to **ಕನ್ನಡ** (5 s).
2. Advisor: *Tomato, 15 quintals, harvested today, Kolar* → engine fetches **LIVE** Agmarknet prices + weather → shows recommendation with confidence ring, 7-day price chart, nearest cold store, revenue delta (30 s).
3. Tap **Mandi Prices** → live government data, LIVE badge (15 s).
4. **Transport pool**: post 10 qtl Kolar→Bengaluru → instant match with 2 neighbours, ₹976 saving shown (20 s).
5. **Dashboard**: district glut-risk signals + loss averted counter (15 s).
6. Turn on airplane mode → app still works, data badged CACHED (15 s). *"This is what ₹0 infrastructure looks like."*
