/*
 * OVERHEAD — Live Aircraft Flightboard
 *
 * Aircraft data: ADSB.fi
 * Flight routes: ADSBdb
 * Data updates: GitHub Actions
 * Display refresh: Every 30 seconds
 */


// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const CONFIG = {
  place: "VIENNA",
  latitude: 48.2082,
  longitude: 16.3738,
  radiusNauticalMiles: 15,
  refreshSeconds: 30,
  maxPositionAgeSeconds: 90,
  maxSnapshotAgeSeconds: 1200,
  demoMode: false
};

const DATA_URL = "./flights.json";


// --------------------------------------------------
// DISPLAY FIELDS
// --------------------------------------------------

const FIELDS = [
  { key: "airline", label: "AIRLINE", slots: 14 },
  { key: "flight", label: "FLIGHT", slots: 8 },
  { key: "route", label: "ROUTE", slots: 9 },
  { key: "aircraft", label: "AIRCRAFT", slots: 12 },
  { key: "level", label: "FLIGHT LEVEL", slots: 7 },
  { key: "speed", label: "GROUND SPEED", slots: 9 }
];

const DEMO = {
  airline: "AUSTRIAN",
  flight: "AUA123",
  route: "FRA-VIE",
  aircraft: "A320",
  level: "FL350",
  speed: "845 KM/H"
};


// --------------------------------------------------
// AIRLINE IDENTIFICATION
// --------------------------------------------------

const AIRLINES = {
  AUA: "AUSTRIAN",
  DLH: "LUFTHANSA",
  EWG: "EUROWINGS",
  EZY: "EASYJET",
  RYR: "RYANAIR",
  WZZ: "WIZZ AIR",
  WMT: "WIZZ AIR",
  SWR: "SWISS",
  BAW: "BRITISH AIR",
  THY: "TURKISH",
  KLM: "KLM",
  AFR: "AIR FRANCE",
  UAE: "EMIRATES",
  QTR: "QATAR",
  TOM: "TUI AIRWAYS",
  BEL: "BRUSSELS",
  LOT: "LOT POLISH",
  SAS: "SAS",
  FIN: "FINNAIR",
  TAP: "TAP PORTUGAL",
  EIN: "AER LINGUS",
  CFG: "CONDOR",
  ICE: "ICELANDAIR",
  DAL: "DELTA",
  UAL: "UNITED",
  AAL: "AMERICAN"
};


// --------------------------------------------------
// APPLICATION STATE
// --------------------------------------------------

const byId = id => document.getElementById(id);

const grids = new Map();

let lastValues = {};
let running = false;


// --------------------------------------------------
// INITIALIZE DISPLAY
// --------------------------------------------------

function makeBoard() {
  const root = byId("rows");
  root.replaceChildren();

  for (const field of FIELDS) {
    const row = document.createElement("div");
    row.className = "dataRow";

    const label = document.createElement("div");
    label.className = "name";
    label.textContent = field.label;

    const grid = document.createElement("div");
    grid.className = "cells";

    grid.style.setProperty("--slots", field.slots);
    grid.setAttribute("aria-label", field.label);

    const cells = [];

    for (let i = 0; i < field.slots; i++) {
      const cell = document.createElement("span");
      cell.className = "cell";
      cell.textContent = " ";

      grid.appendChild(cell);
      cells.push(cell);
    }

    grids.set(field.key, cells);

    row.append(label, grid);
    root.appendChild(row);
  }

  byId("location").textContent =
    `${CONFIG.place} · ` +
    `${CONFIG.latitude.toFixed(4)}° N / ` +
    `${CONFIG.longitude.toFixed(4)}° E`;
}


// --------------------------------------------------
// SPLIT-FLAP ANIMATION
// --------------------------------------------------

function render(values) {
  for (const field of FIELDS) {
    const text = String(values[field.key] ?? "---")
      .toUpperCase()
      .replace(/[^A-Z0-9 .+\-/]/g, " ")
      .slice(0, field.slots)
      .padEnd(field.slots, " ");

    const previous =
      lastValues[field.key] ?? " ".repeat(field.slots);

    grids.get(field.key).forEach((cell, i) => {
      if (text[i] === previous[i]) return;

      const delay = Math.min(i * 25, 260);

      setTimeout(() => {
        cell.textContent = text[i];

        cell.classList.remove("changed");
        void cell.offsetWidth;
        cell.classList.add("changed");
      }, delay);
    });

    lastValues[field.key] = text;
  }
}


// --------------------------------------------------
// DISTANCE CALCULATION
// --------------------------------------------------

function haversineKm(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const dlat = (lat2 - lat1) * rad;
  const dlon = (lon2 - lon1) * rad;

  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1 * rad) *
    Math.cos(lat2 * rad) *
    Math.sin(dlon / 2) ** 2;

  return 6371 * 2 * Math.asin(Math.sqrt(h));
}


// --------------------------------------------------
// SELECT NEAREST AIRCRAFT
// --------------------------------------------------

function suitableAircraft(items) {
  return items
    .filter(a =>
      Number.isFinite(a.lat) &&
      Number.isFinite(a.lon) &&
      a.airground !== "GND" &&
      a.alt_baro !== "ground" &&
      (a.seen_pos == null ||
       a.seen_pos < CONFIG.maxPositionAgeSeconds)
    )
    .map(a => ({
      aircraft: a,
      distance: haversineKm(
        CONFIG.latitude,
        CONFIG.longitude,
        a.lat,
        a.lon
      )
    }))
    .filter(a =>
      a.distance <= CONFIG.radiusNauticalMiles * 1.852
    )
    .sort((a, b) =>
      a.distance - b.distance
    )[0]?.aircraft;
}


// --------------------------------------------------
// FORMAT AIRCRAFT INFORMATION
// --------------------------------------------------

function formatAircraft(a) {
  const callsign = String(a.flight ?? "")
    .trim()
    .toUpperCase();

  const prefix =
    (callsign.match(/^[A-Z]{3}/) || [])[0];

  const altitude =
    typeof a.alt_baro === "number"
      ? a.alt_baro
      : (
          typeof a.alt_geom === "number"
            ? a.alt_geom
            : null
        );

  return {
    airline:
      AIRLINES[prefix] ?? "UNKNOWN",

    flight:
      callsign || "---",

    // Route from ADSBdb, if available.
    route:
      typeof a.route === "string" &&
      /^[A-Z]{3}-[A-Z]{3}$/.test(a.route)
        ? a.route
        : "---  ---",

    aircraft:
      String(a.t ?? "---").toUpperCase(),

    level:
      altitude == null
        ? "---"
        : `FL${String(
            Math.round(altitude / 100)
          ).padStart(3, "0")}`,

    speed:
      typeof a.gs === "number"
        ? `${Math.round(a.gs * 1.852)} KM/H`
        : "---"
  };
}


// --------------------------------------------------
// STATUS
// --------------------------------------------------

function status(message, mode) {
  byId("status").textContent = message;
  byId("mode").textContent = mode;
}

function formatUTC(date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC"
  });
}


// --------------------------------------------------
// EMPTY AIRSPACE
// --------------------------------------------------

function showClearSky(time) {
  render({
    airline: "CLEAR SKY",
    flight: "---",
    route: "---  ---",
    aircraft: "---",
    level: "---",
    speed: "---"
  });

  status(
    `NO AIRCRAFT · UPDATED ${time} UTC`,
    "SNAPSHOT"
  );
}


// --------------------------------------------------
// OFFLINE
// --------------------------------------------------

function showOffline() {
  render({
    airline: "DATA OFFLINE",
    flight: "---",
    route: "---  ---",
    aircraft: "---",
    level: "---",
    speed: "---"
  });

  status("DATA UNAVAILABLE · RETRYING", "OFFLINE");
}


// --------------------------------------------------
// LOAD DATA FROM GITHUB PAGES
// --------------------------------------------------

async function update() {
  if (running || document.hidden) return;

  running = true;

  try {
    if (CONFIG.demoMode) {
      render(DEMO);
      status("EXAMPLE DATA", "DEMO");
      return;
    }

    status("UPDATING...", "CONNECTING");

    const response = await fetch(
      `${DATA_URL}?t=${Date.now()}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      throw new Error(`DATA ERROR: ${response.status}`);
    }

    const payload = await response.json();

    if (!Array.isArray(payload.ac)) {
      throw new Error("INVALID DATA FORMAT");
    }

    const fetchedAt = new Date(payload.fetchedAt);

    const snapshotAge =
      (Date.now() - fetchedAt.getTime()) / 1000;

    if (
      !Number.isFinite(snapshotAge) ||
      snapshotAge < -60 ||
      snapshotAge > CONFIG.maxSnapshotAgeSeconds
    ) {
      throw new Error("STALE OR INVALID SNAPSHOT");
    }

    const plane = suitableAircraft(payload.ac);

    if (plane) {
      render(formatAircraft(plane));

      status(
        `SNAPSHOT · UPDATED ${formatUTC(fetchedAt)} UTC`,
        "SNAPSHOT"
      );

    } else {
      showClearSky(formatUTC(fetchedAt));
    }

  } catch (error) {
    console.warn("OVERHEAD:", error);
    showOffline();

  } finally {
    running = false;
  }
}


// --------------------------------------------------
// UTC CLOCK
// --------------------------------------------------

function updateClock() {
  byId("clock").textContent =
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    }) + " UTC";
}


// --------------------------------------------------
// START APPLICATION
// --------------------------------------------------

function start() {
  makeBoard();

  render({
    airline: "CONNECTING",
    flight: "---",
    route: "---  ---",
    aircraft: "---",
    level: "---",
    speed: "---"
  });

  updateClock();
  setInterval(updateClock, 30000);

  update();

  setInterval(
    update,
    CONFIG.refreshSeconds * 1000
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) update();
    }
  );
}

start();
