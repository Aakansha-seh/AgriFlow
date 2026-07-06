/* ============================================================
   AgriFlow Sampurna — Live Data Connectors (all free / ₹0)
   1. data.gov.in Agmarknet daily mandi prices (public API)
   2. Open-Meteo 7-day weather forecast (no key required)
   Both fall back to bundled snapshots so the demo never breaks
   offline. Every result carries {source: 'live'|'cached'}.
   ============================================================ */

// Public demo key published by data.gov.in for testing (rate-limited).
// For the pilot, register a free key at https://data.gov.in
const DATA_GOV_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const AGMARK_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

const API = {
  /**
   * Fetch current mandi prices for a crop in Karnataka.
   * Returns { source, records: [{market, district, modal, min, max, date}] }
   */
  async mandiPrices(cropId) {
    const crop = CROPS[cropId];
    const url = `https://api.data.gov.in/resource/${AGMARK_RESOURCE}` +
      `?api-key=${DATA_GOV_KEY}&format=json&limit=40` +
      `&filters%5Bstate%5D=Karnataka` +
      `&filters%5Bcommodity%5D=${encodeURIComponent(crop.agmark)}`;
    try {
      const res = await fetchWithTimeout(url, 8000);
      const json = await res.json();
      const recs = (json.records || [])
        .map(r => ({
          market: r.market,
          district: (r.district || "").toLowerCase(),
          modal: num(r.modal_price),
          min: num(r.min_price),
          max: num(r.max_price),
          date: r.arrival_date
        }))
        .filter(r => r.modal > 0);
      if (recs.length) return { source: "live", records: recs };
      throw new Error("empty");
    } catch (e) {
      return {
        source: "cached",
        records: (FALLBACK_PRICES[cropId] || []).map(r => ({ ...r, date: todayStr() }))
      };
    }
  },

  /**
   * 7-day weather forecast for a district (Open-Meteo, free, CORS-enabled).
   * Returns { source, days: [{date, tMax, tMin, rainProb}] }
   */
  async weather(districtId) {
    const d = districtById(districtId) || DISTRICTS[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=7&timezone=Asia%2FKolkata`;
    try {
      const res = await fetchWithTimeout(url, 8000);
      const json = await res.json();
      const days = json.daily.time.map((t, i) => ({
        date: t,
        tMax: json.daily.temperature_2m_max[i],
        tMin: json.daily.temperature_2m_min[i],
        rainProb: json.daily.precipitation_probability_max[i]
      }));
      return { source: "live", days };
    } catch (e) {
      // Neutral fallback climate for the demo
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push({ date: offsetDateStr(i), tMax: 30, tMin: 20, rainProb: 20 });
      }
      return { source: "cached", days };
    }
  }
};

function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}
function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function offsetDateStr(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
