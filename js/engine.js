/* ============================================================
   AgriFlow Sampurna — Decision Intelligence Engine
   Transparent, explainable, fully client-side (₹0 to run).

   Inputs : crop, quantity, harvest date, district,
            live mandi prices, live weather forecast
   Outputs: action (SELL_NOW | STORE | PROCESS | WAIT),
            confidence 0–100, factor breakdown, alternatives,
            7-day price outlook, shelf-life estimate.

   Every recommendation is a pure function of visible factors —
   judges and farmers can audit exactly WHY it was suggested.
   ============================================================ */

const Engine = {

  /** Estimate remaining shelf life (days) from crop table + weather. */
  shelfLife(cropId, harvestDate, weatherDays) {
    const crop = CROPS[cropId];
    const parsed = new Date(harvestDate).getTime();
    const daysSince = isNaN(parsed) ? 0 : Math.max(0, Math.floor((Date.now() - parsed) / 86400000));
    let remaining = crop.shelfAmbient - daysSince;
    // Heat penalty: each forecast day above 30°C max shaves life
    const hotDays = weatherDays.filter(d => d.tMax > 30);
    const avgExcess = hotDays.length
      ? hotDays.reduce((s, d) => s + (d.tMax - 30), 0) / hotDays.length : 0;
    remaining = remaining * (1 - Math.min(0.5, crop.tempSensitivity * avgExcess));
    return Math.max(0, Math.round(remaining * 10) / 10);
  },

  /** Blend live modal price with seasonal prior into a 7-day outlook. */
  priceOutlook(cropId, records) {
    const crop = CROPS[cropId];
    const modal = records.length
      ? records.reduce((s, r) => s + r.modal, 0) / records.length
      : crop.baseline;
    const month = new Date().getMonth();
    const idx = SEASONAL_INDEX[cropId];
    const out = [];
    for (let day = 0; day <= 7; day++) {
      // Interpolate the seasonal index across the next week
      const frac = (new Date().getDate() + day) / 30;
      const m2 = (month + (frac >= 1 ? 1 : 0)) % 12;
      const w = frac >= 1 ? frac - 1 : frac;
      const seasonNow = idx[month], seasonNext = idx[(month + 1) % 12];
      const season = seasonNow + (seasonNext - seasonNow) * (w * 0.5 + day / 14);
      const seasonToday = seasonNow + (seasonNext - seasonNow) * (new Date().getDate() / 30 * 0.5);
      out.push(Math.round(modal * (season / seasonToday)));
    }
    return { today: Math.round(modal), series: out, trendPct: Math.round((out[7] - out[0]) / out[0] * 100) };
  },

  /** Nearest suitable cold storage with free capacity. */
  nearestStorage(cropId, districtId) {
    const d = districtById(districtId);
    if (!d) return null;
    const options = COLD_STORAGES
      .filter(cs => cs.crops.includes(cropId) && cs.freeT > 0)
      .map(cs => ({ ...cs, km: distKm(d.lat, d.lng, cs.lat, cs.lng) }))
      .sort((a, b) => a.km - b.km);
    return options[0] || null;
  },

  /** Nearest processing unit accepting this crop. */
  nearestProcessor(cropId, districtId, qtyQtl) {
    const d = districtById(districtId);
    if (!d) return null;
    const options = PROCESSORS
      .filter(p => p.crops.includes(cropId))
      .map(p => {
        const pd = districtById(p.district);
        return { ...p, km: distKm(d.lat, d.lng, pd.lat, pd.lng), meetsMin: qtyQtl >= p.minQtl };
      })
      .sort((a, b) => a.km - b.km);
    return options[0] || null;
  },

  /**
   * The core recommendation.
   * Scores four actions from visible factors, picks the best,
   * and returns everything needed to explain the decision.
   */
  recommend({ cropId, qtyQtl, harvestDate, districtId, priceData, weatherData }) {
    const crop = CROPS[cropId];
    const shelf = this.shelfLife(cropId, harvestDate, weatherData.days);
    const outlook = this.priceOutlook(cropId, priceData.records);
    const storage = this.nearestStorage(cropId, districtId);
    const processor = this.nearestProcessor(cropId, districtId, qtyQtl);
    const rain3d = Math.max(...weatherData.days.slice(0, 3).map(d => d.rainProb));
    const heat = Math.max(...weatherData.days.slice(0, 3).map(d => d.tMax));

    // Peak-day gain within remaining shelf life (can we survive to the peak?)
    const horizon = Math.min(7, Math.floor(shelf));
    let bestDay = 0, bestPrice = outlook.series[0];
    for (let i = 1; i <= horizon; i++) {
      if (outlook.series[i] > bestPrice) { bestPrice = outlook.series[i]; bestDay = i; }
    }
    const waitGainPct = (bestPrice - outlook.series[0]) / outlook.series[0] * 100;

    // Storage economics: cost to store until a +10% seasonal window
    let storeVerdict = null;
    if (storage) {
      const storeDays = crop.storable ? 30 : 10;
      const storeCostPerQtl = storage.pricePerQtlDay * storeDays +
        (storage.km * TRANSPORT_RATE_PER_T_KM / 10); // transport ₹/qtl
      const expectedGainPerQtl = outlook.today * (crop.storable ? 0.15 : 0.06);
      storeVerdict = { storeDays, storeCostPerQtl: Math.round(storeCostPerQtl),
        expectedGainPerQtl: Math.round(expectedGainPerQtl),
        profitable: expectedGainPerQtl > storeCostPerQtl * 1.2 };
    }

    // ---- Score the four actions (0–100) ----
    const scores = { SELL_NOW: 50, WAIT: 30, STORE: 20, PROCESS: 10 };

    // Price trajectory
    if (waitGainPct >= 4 && bestDay >= 1) { scores.WAIT += 25 + Math.min(15, waitGainPct * 2); scores.SELL_NOW -= 10; }
    if (waitGainPct <= 0) { scores.SELL_NOW += 20; scores.WAIT -= 15; }

    // Shelf-life pressure
    if (shelf <= 2) { scores.SELL_NOW += 30; scores.WAIT -= 25; scores.STORE -= 10; scores.PROCESS += 15; }
    else if (shelf <= 4) { scores.SELL_NOW += 12; scores.WAIT -= 5; }
    else if (shelf > 10) { scores.WAIT += 5; scores.STORE += 10; }

    // Weather pressure (rain disrupts open mandi sales & transport)
    if (rain3d >= 70) { scores.SELL_NOW += 8; scores.STORE += 8; scores.WAIT -= 8; }
    if (heat >= 35) { scores.SELL_NOW += 10; scores.WAIT -= 8; scores.STORE += 6; }

    // Storage availability & economics
    if (storage && storeVerdict) {
      if (storeVerdict.profitable) scores.STORE += 30;
      else scores.STORE += 5;
      if (crop.storable) scores.STORE += 15;
    } else {
      scores.STORE = 0;
    }

    // Processing route (glut conditions: price below 75% of baseline)
    if (processor) {
      if (outlook.today < crop.baseline * 0.75) scores.PROCESS += 35;
      if (processor.meetsMin) scores.PROCESS += 10;
      if (shelf <= 2) scores.PROCESS += 10;
    } else {
      scores.PROCESS = 0;
    }

    // ---- Pick winner & confidence ----
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [action, top] = ranked[0];
    const second = ranked[1][1];
    // Confidence: separation between top-2 actions + data quality bonus
    let confidence = 55 + Math.min(30, (top - second) * 1.2);
    if (priceData.source === "live") confidence += 7;
    if (weatherData.source === "live") confidence += 3;
    confidence = Math.min(96, Math.round(confidence));

    return {
      action, confidence,
      scores, ranked,
      shelf, outlook, storage, processor, storeVerdict,
      bestDay, bestPrice: Math.round(bestPrice),
      waitGainPct: Math.round(waitGainPct * 10) / 10,
      rain3d, heat,
      revenueNow: Math.round(outlook.today * qtyQtl),
      revenueBest: Math.round(bestPrice * qtyQtl),
      dataSources: { price: priceData.source, weather: weatherData.source }
    };
  },

  /** Human-readable explanation, assembled from the decisive factors. */
  explain(rec, cropId, lang) {
    const crop = CROPS[cropId];
    const L = (en, kn, hi) => lang === "kn" ? kn : lang === "hi" ? hi : en;
    const parts = [];

    if (rec.action === "WAIT") {
      parts.push(L(
        `Prices for ${crop.agmark.toLowerCase()} are trending up: selling on day ${rec.bestDay} could fetch ₹${rec.bestPrice}/qtl vs ₹${rec.outlook.today}/qtl today (+${rec.waitGainPct}%).`,
        `${crop.agmark} ಬೆಲೆ ಏರುತ್ತಿದೆ: ${rec.bestDay} ದಿನದ ನಂತರ ಮಾರಿದರೆ ₹${rec.bestPrice}/ಕ್ವಿಂ ಸಿಗಬಹುದು (ಇಂದು ₹${rec.outlook.today}, +${rec.waitGainPct}%).`,
        `${crop.agmark} के भाव बढ़ रहे हैं: ${rec.bestDay} दिन बाद बेचने पर ₹${rec.bestPrice}/क्विंटल मिल सकता है (आज ₹${rec.outlook.today}, +${rec.waitGainPct}%).`));
      parts.push(L(
        `Your produce has ~${rec.shelf} days of shelf life — enough to reach that window safely.`,
        `ನಿಮ್ಮ ಬೆಳೆಗೆ ~${rec.shelf} ದಿನ ಬಾಳಿಕೆ ಇದೆ — ಆ ಸಮಯದವರೆಗೆ ಸುರಕ್ಷಿತ.`,
        `आपकी उपज की शेल्फ लाइफ ~${rec.shelf} दिन है — उस समय तक सुरक्षित रहेगी।`));
    }
    if (rec.action === "SELL_NOW") {
      if (rec.shelf <= 3) parts.push(L(
        `Only ~${rec.shelf} days of shelf life remain — waiting risks spoilage losses larger than any price gain.`,
        `ಕೇವಲ ~${rec.shelf} ದಿನ ಬಾಳಿಕೆ ಉಳಿದಿದೆ — ಕಾಯುವುದರಿಂದ ಹಾಳಾಗುವ ನಷ್ಟ ಹೆಚ್ಚು.`,
        `केवल ~${rec.shelf} दिन शेल्फ लाइफ बची है — रुकने पर खराबी का नुकसान अधिक होगा।`));
      if (rec.waitGainPct <= 0) parts.push(L(
        `The 7-day outlook shows no meaningful price rise (${rec.waitGainPct}%), so today's ₹${rec.outlook.today}/qtl is your best realistic price.`,
        `ಮುಂದಿನ 7 ದಿನಗಳಲ್ಲಿ ಬೆಲೆ ಏರಿಕೆ ನಿರೀಕ್ಷೆ ಇಲ್ಲ (${rec.waitGainPct}%) — ಇಂದಿನ ₹${rec.outlook.today}/ಕ್ವಿಂ ಉತ್ತಮ.`,
        `अगले 7 दिनों में भाव बढ़ने की संभावना नहीं (${rec.waitGainPct}%) — आज का ₹${rec.outlook.today}/क्विंटल सर्वोत्तम है।`));
      if (rec.heat >= 35) parts.push(L(
        `Forecast heat (${rec.heat}°C) will accelerate quality loss in the field.`,
        `ಮುನ್ಸೂಚನೆ ತಾಪ (${rec.heat}°C) ಗುಣಮಟ್ಟ ಕುಸಿತ ವೇಗಗೊಳಿಸುತ್ತದೆ.`,
        `पूर्वानुमानित गर्मी (${rec.heat}°C) गुणवत्ता गिरावट तेज़ करेगी।`));
    }
    if (rec.action === "STORE" && rec.storage) {
      parts.push(L(
        `${rec.storage.name} (${rec.storage.km} km) has ${rec.storage.freeT} t free at ₹${rec.storage.pricePerQtlDay}/qtl/day. Storing ~${rec.storeVerdict.storeDays} days costs ≈₹${rec.storeVerdict.storeCostPerQtl}/qtl vs an expected seasonal gain of ≈₹${rec.storeVerdict.expectedGainPerQtl}/qtl.`,
        `${rec.storage.name} (${rec.storage.km} ಕಿ.ಮೀ) ನಲ್ಲಿ ${rec.storage.freeT} ಟನ್ ಖಾಲಿ ಇದೆ (₹${rec.storage.pricePerQtlDay}/ಕ್ವಿಂ/ದಿನ). ~${rec.storeVerdict.storeDays} ದಿನ ಸಂಗ್ರಹ ವೆಚ್ಚ ≈₹${rec.storeVerdict.storeCostPerQtl}/ಕ್ವಿಂ, ನಿರೀಕ್ಷಿತ ಲಾಭ ≈₹${rec.storeVerdict.expectedGainPerQtl}/ಕ್ವಿಂ.`,
        `${rec.storage.name} (${rec.storage.km} किमी) में ${rec.storage.freeT} टन जगह खाली है (₹${rec.storage.pricePerQtlDay}/क्विं/दिन)। ~${rec.storeVerdict.storeDays} दिन भंडारण लागत ≈₹${rec.storeVerdict.storeCostPerQtl}/क्विं, अपेक्षित लाभ ≈₹${rec.storeVerdict.expectedGainPerQtl}/क्विं।`));
    }
    if (rec.action === "PROCESS" && rec.processor) {
      parts.push(L(
        `Current price (₹${rec.outlook.today}/qtl) is well below the typical level for ${crop.agmark.toLowerCase()} — a glut signal. ${rec.processor.name} (${rec.processor.km} km) buys for ${rec.processor.products}, converting potential waste into value.`,
        `ಪ್ರಸ್ತುತ ಬೆಲೆ (₹${rec.outlook.today}/ಕ್ವಿಂ) ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಕಡಿಮೆ — ಹೆಚ್ಚು ಪೂರೈಕೆಯ ಸೂಚನೆ. ${rec.processor.name} (${rec.processor.km} ಕಿ.ಮೀ) ${rec.processor.products} ಗಾಗಿ ಖರೀದಿಸುತ್ತದೆ.`,
        `वर्तमान भाव (₹${rec.outlook.today}/क्विं) सामान्य से काफी कम है — अधिक आपूर्ति का संकेत। ${rec.processor.name} (${rec.processor.km} किमी) ${rec.processor.products} के लिए खरीदता है।`));
    }
    if (rec.rain3d >= 70) parts.push(L(
      `High rain probability (${rec.rain3d}%) in the next 3 days may disrupt open-market transport — plan covered logistics.`,
      `ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆ ಸಂಭವನೀಯತೆ ಹೆಚ್ಚು (${rec.rain3d}%) — ಮುಚ್ಚಿದ ಸಾರಿಗೆ ಯೋಜಿಸಿ.`,
      `अगले 3 दिनों में बारिश की संभावना अधिक (${rec.rain3d}%) — ढके हुए परिवहन की योजना बनाएं।`));

    return parts.join(" ");
  }
};
