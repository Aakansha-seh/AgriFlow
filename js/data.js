/* ============================================================
   AgriFlow Sampurna — Knowledge Base & Reference Data
   Crop science tables, Karnataka geography, demo datasets.
   Demo datasets are clearly marked and are placeholders to be
   replaced by live registries during pilot deployment.
   ============================================================ */

// ---- The 7 Sampurna priority crops ----------------------------------------
// shelfAmbient: typical post-harvest life (days) at ~25°C ambient, good handling
// shelfCold:    typical life (days) under recommended cold storage
// tempSensitivity: shelf-life % lost per °C above 30°C daily max (heuristic)
// storable: whether medium-term storage is a realistic strategy
// processing: value-added products (circular-economy pathways)
const CROPS = {
  tomato: {
    id: "tomato", icon: "🍅", agmark: "Tomato",
    shelfAmbient: 6, shelfCold: 21, coldTempC: "10–13°C",
    tempSensitivity: 0.06, storable: false,
    baseline: 1800, // ₹/quintal typical modal price (fallback only)
    volatility: "high",
    processing: ["Tomato puree / paste", "Sun-dried tomato", "Ketchup units (FPO-scale)"]
  },
  onion: {
    id: "onion", icon: "🧅", agmark: "Onion",
    shelfAmbient: 45, shelfCold: 150, coldTempC: "0–2°C (or ventilated 25°C)",
    tempSensitivity: 0.02, storable: true,
    baseline: 1600, volatility: "very high",
    processing: ["Dehydrated onion flakes", "Onion powder", "Fried onion (birista)"]
  },
  banana: {
    id: "banana", icon: "🍌", agmark: "Banana",
    shelfAmbient: 5, shelfCold: 20, coldTempC: "13–14°C",
    tempSensitivity: 0.08, storable: false,
    baseline: 2200, volatility: "medium",
    processing: ["Banana chips", "Banana powder / flour", "Ripened retail packs"]
  },
  mango: {
    id: "mango", icon: "🥭", agmark: "Mango",
    shelfAmbient: 8, shelfCold: 21, coldTempC: "10–13°C",
    tempSensitivity: 0.07, storable: false,
    baseline: 4500, volatility: "high",
    processing: ["Mango pulp", "Aamchur (dried)", "Pickle units", "Juice / RTS"]
  },
  grapes: {
    id: "grapes", icon: "🍇", agmark: "Grapes",
    shelfAmbient: 5, shelfCold: 45, coldTempC: "-1–0°C",
    tempSensitivity: 0.08, storable: false,
    baseline: 5500, volatility: "medium",
    processing: ["Raisins (kishmish)", "Grape juice", "Winery linkage"]
  },
  pomegranate: {
    id: "pomegranate", icon: "🔴", agmark: "Pomegranate",
    shelfAmbient: 18, shelfCold: 60, coldTempC: "5–7°C",
    tempSensitivity: 0.04, storable: true,
    baseline: 8500, volatility: "medium",
    processing: ["Fresh arils (ready-to-eat)", "Pomegranate juice", "Anardana (dried seed)"]
  },
  pineapple: {
    id: "pineapple", icon: "🍍", agmark: "Pineapple",
    shelfAmbient: 8, shelfCold: 25, coldTempC: "7–13°C",
    tempSensitivity: 0.05, storable: false,
    baseline: 2400, volatility: "medium",
    processing: ["Pineapple juice / RTS", "Canned slices", "Candied pineapple"]
  }
};

// ---- Karnataka districts (major horticulture districts, with coordinates) --
const DISTRICTS = [
  { id: "bengaluru",      name: "Bengaluru (Rural+Urban)", lat: 12.97, lng: 77.59 },
  { id: "kolar",          name: "Kolar",           lat: 13.14, lng: 78.13 },
  { id: "chikkaballapura",name: "Chikkaballapura", lat: 13.43, lng: 77.73 },
  { id: "belagavi",       name: "Belagavi",        lat: 15.85, lng: 74.50 },
  { id: "vijayapura",     name: "Vijayapura",      lat: 16.83, lng: 75.71 },
  { id: "bagalkote",      name: "Bagalkote",       lat: 16.18, lng: 75.70 },
  { id: "dharwad",        name: "Dharwad (Hubballi)", lat: 15.36, lng: 75.12 },
  { id: "davanagere",     name: "Davanagere",      lat: 14.46, lng: 75.92 },
  { id: "chitradurga",    name: "Chitradurga",     lat: 14.23, lng: 76.40 },
  { id: "ballari",        name: "Ballari",         lat: 15.14, lng: 76.92 },
  { id: "koppal",         name: "Koppal",          lat: 15.35, lng: 76.15 },
  { id: "raichur",        name: "Raichur",         lat: 16.21, lng: 77.36 },
  { id: "kalaburagi",     name: "Kalaburagi",      lat: 17.33, lng: 76.83 },
  { id: "shivamogga",     name: "Shivamogga",      lat: 13.93, lng: 75.57 },
  { id: "tumakuru",       name: "Tumakuru",        lat: 13.34, lng: 77.10 },
  { id: "hassan",         name: "Hassan",          lat: 13.01, lng: 76.10 },
  { id: "mandya",         name: "Mandya",          lat: 12.52, lng: 76.90 },
  { id: "mysuru",         name: "Mysuru",          lat: 12.30, lng: 76.65 },
  { id: "ramanagara",     name: "Ramanagara",      lat: 12.72, lng: 77.28 },
  { id: "mangaluru",      name: "Dakshina Kannada",lat: 12.87, lng: 74.88 }
];

// ---- Cold storage directory -------------------------------------------------
// DEMO DATASET: representative facilities for pilot demonstration.
// In deployment this is replaced by the Dept. of Horticulture / NHB
// registered cold storage registry for Karnataka.
const COLD_STORAGES = [
  { id: "cs1", name: "Kolar Agri Cold Chain Hub",        district: "kolar",          lat: 13.10, lng: 78.10, capacityT: 5000, freeT: 1400, pricePerQtlDay: 3.5, crops: ["tomato","mango","pomegranate","grapes"], phone: "+91-90000-00001" },
  { id: "cs2", name: "Chikkaballapura Horti Storage",    district: "chikkaballapura",lat: 13.44, lng: 77.72, capacityT: 3000, freeT: 650,  pricePerQtlDay: 3.0, crops: ["tomato","grapes","banana"], phone: "+91-90000-00002" },
  { id: "cs3", name: "Belagavi FPO Cold Store",          district: "belagavi",       lat: 15.83, lng: 74.52, capacityT: 4000, freeT: 2100, pricePerQtlDay: 2.8, crops: ["onion","grapes","pomegranate"], phone: "+91-90000-00003" },
  { id: "cs4", name: "Vijayapura Onion Ventilated Store",district: "vijayapura",     lat: 16.80, lng: 75.70, capacityT: 8000, freeT: 3200, pricePerQtlDay: 1.6, crops: ["onion"], phone: "+91-90000-00004" },
  { id: "cs5", name: "Bagalkote Pomegranate Chamber",    district: "bagalkote",      lat: 16.19, lng: 75.68, capacityT: 2500, freeT: 400,  pricePerQtlDay: 4.0, crops: ["pomegranate","grapes"], phone: "+91-90000-00005" },
  { id: "cs6", name: "Ramanagara Mango Pack House",      district: "ramanagara",     lat: 12.73, lng: 77.30, capacityT: 1500, freeT: 700,  pricePerQtlDay: 3.8, crops: ["mango","banana"], phone: "+91-90000-00006" },
  { id: "cs7", name: "Shivamogga Pineapple & Banana CS", district: "shivamogga",     lat: 13.95, lng: 75.55, capacityT: 2000, freeT: 900,  pricePerQtlDay: 3.2, crops: ["pineapple","banana"], phone: "+91-90000-00007" },
  { id: "cs8", name: "Mysuru Multi-Commodity Cold Hub",  district: "mysuru",         lat: 12.32, lng: 76.63, capacityT: 6000, freeT: 2500, pricePerQtlDay: 3.4, crops: ["tomato","banana","mango","pineapple"], phone: "+91-90000-00008" },
  { id: "cs9", name: "Kalaburagi Agri Storage Park",     district: "kalaburagi",     lat: 17.30, lng: 76.85, capacityT: 3500, freeT: 1800, pricePerQtlDay: 2.5, crops: ["onion","pomegranate"], phone: "+91-90000-00009" },
  { id: "cs10", name: "Hassan Horticulture Cold Store",  district: "hassan",         lat: 13.00, lng: 76.09, capacityT: 1800, freeT: 260,  pricePerQtlDay: 3.6, crops: ["tomato","banana","mango"], phone: "+91-90000-00010" }
];

// ---- Processing units (circular-economy linkages) ---------------------------
// DEMO DATASET — replaced by KAPPEC / MoFPI registered unit directory in pilot.
const PROCESSORS = [
  { id: "p1", name: "Kolar Tomato Processing FPO",   district: "kolar",     crops: ["tomato"], products: "Puree, paste", minQtl: 20 },
  { id: "p2", name: "Chitradurga Onion Dehydration", district: "chitradurga", crops: ["onion"], products: "Flakes, powder", minQtl: 50 },
  { id: "p3", name: "Ramanagara Mango Pulp Unit",    district: "ramanagara", crops: ["mango"], products: "Pulp, RTS juice", minQtl: 30 },
  { id: "p4", name: "Vijayapura Raisin Cluster",     district: "vijayapura", crops: ["grapes"], products: "Raisins", minQtl: 25 },
  { id: "p5", name: "Shivamogga Fruit Juice Park",   district: "shivamogga", crops: ["pineapple","banana","mango"], products: "Juice, canned", minQtl: 40 },
  { id: "p6", name: "Bagalkote Anar Aril Unit",      district: "bagalkote", crops: ["pomegranate"], products: "Arils, juice", minQtl: 15 }
];

// ---- Seasonal price index ---------------------------------------------------
// Month-wise multiplier vs annual average modal price (heuristic priors built
// from Agmarknet seasonality patterns; the engine blends these with live data).
const SEASONAL_INDEX = {
  tomato:      [0.85,0.80,0.85,0.95,1.05,1.20,1.35,1.25,1.10,0.95,0.85,0.80],
  onion:       [0.90,0.80,0.75,0.80,0.85,0.95,1.05,1.20,1.35,1.40,1.15,0.95],
  banana:      [0.95,1.00,1.05,1.10,1.05,1.00,0.95,1.00,1.05,1.00,0.95,0.90],
  mango:       [1.30,1.20,1.00,0.85,0.75,0.80,0.95,1.10,1.20,1.25,1.30,1.35],
  grapes:      [0.85,0.80,0.85,1.00,1.10,1.15,1.20,1.20,1.15,1.10,1.00,0.90],
  pomegranate: [1.05,1.10,1.10,1.05,0.95,0.90,0.90,0.95,1.00,1.00,1.00,1.05],
  pineapple:   [1.00,1.05,1.10,1.10,1.05,0.95,0.90,0.90,0.95,1.00,1.00,1.00]
};

// ---- Fallback mandi snapshot ------------------------------------------------
// Used when the live data.gov.in Agmarknet API is unreachable (offline demo).
// Values are representative modal prices (₹/quintal); the UI labels this
// snapshot as "cached sample data" whenever it is displayed.
const FALLBACK_PRICES = {
  tomato: [
    { market: "Kolar APMC", district: "kolar", modal: 1650, min: 1200, max: 2100 },
    { market: "Bengaluru (Binny Mill)", district: "bengaluru", modal: 1900, min: 1500, max: 2400 },
    { market: "Mysuru APMC", district: "mysuru", modal: 1750, min: 1300, max: 2200 },
    { market: "Belagavi APMC", district: "belagavi", modal: 1600, min: 1150, max: 2000 }
  ],
  onion: [
    { market: "Vijayapura APMC", district: "vijayapura", modal: 1450, min: 900, max: 1900 },
    { market: "Bengaluru (Yeshwanthpur)", district: "bengaluru", modal: 1700, min: 1200, max: 2200 },
    { market: "Hubballi APMC", district: "dharwad", modal: 1500, min: 1000, max: 1950 }
  ],
  banana: [
    { market: "Mysuru APMC", district: "mysuru", modal: 2100, min: 1500, max: 2800 },
    { market: "Shivamogga APMC", district: "shivamogga", modal: 2000, min: 1400, max: 2600 },
    { market: "Bengaluru APMC", district: "bengaluru", modal: 2350, min: 1700, max: 3000 }
  ],
  mango: [
    { market: "Ramanagara APMC", district: "ramanagara", modal: 4200, min: 2800, max: 6500 },
    { market: "Kolar (Srinivaspur)", district: "kolar", modal: 3900, min: 2500, max: 6000 },
    { market: "Bengaluru APMC", district: "bengaluru", modal: 4800, min: 3200, max: 7200 }
  ],
  grapes: [
    { market: "Vijayapura APMC", district: "vijayapura", modal: 5200, min: 3500, max: 7500 },
    { market: "Belagavi APMC", district: "belagavi", modal: 5600, min: 3800, max: 8000 },
    { market: "Bengaluru APMC", district: "bengaluru", modal: 6100, min: 4200, max: 8500 }
  ],
  pomegranate: [
    { market: "Bagalkote APMC", district: "bagalkote", modal: 8200, min: 5500, max: 12000 },
    { market: "Koppal APMC", district: "koppal", modal: 7800, min: 5000, max: 11000 },
    { market: "Bengaluru APMC", district: "bengaluru", modal: 9000, min: 6200, max: 13000 }
  ],
  pineapple: [
    { market: "Shivamogga APMC", district: "shivamogga", modal: 2300, min: 1600, max: 3100 },
    { market: "Mangaluru APMC", district: "mangaluru", modal: 2500, min: 1800, max: 3300 },
    { market: "Bengaluru APMC", district: "bengaluru", modal: 2650, min: 1900, max: 3500 }
  ]
};

// ---- Seeded transport pool requests (demo) ----------------------------------
const SEED_POOLS = [
  { id: "seed1", farmer: "Manjunath R.", crop: "tomato", qtyQtl: 18, from: "kolar", to: "bengaluru", date: null /* filled at runtime: tomorrow */, seats: "shared" },
  { id: "seed2", farmer: "Lakshmamma D.", crop: "tomato", qtyQtl: 12, from: "kolar", to: "bengaluru", date: null, seats: "shared" },
  { id: "seed3", farmer: "Basavaraj P.", crop: "onion", qtyQtl: 40, from: "vijayapura", to: "dharwad", date: null, seats: "shared" }
];

// Transport cost heuristic: ₹ per tonne-km for a shared refrigerated mini truck
const TRANSPORT_RATE_PER_T_KM = 8;

// Haversine distance in km
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function districtById(id) { return DISTRICTS.find(d => d.id === id); }
