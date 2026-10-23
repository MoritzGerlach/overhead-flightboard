
"use strict";

// ==========================================
// OVERHEAD — CONFIGURATION
// ==========================================

const CONFIG = {
  place: "VIENNA",
  latitude: 48.2082,
  longitude: 16.3738,
  radiusNauticalMiles: 15,

  // Display prüft alle 30 Sekunden,
  // ob GitHub Actions neue Daten gespeichert hat.
  refreshSeconds: 30,

  dataFile: "aircraft.json",
  logoFolder: "logos"
};

// ==========================================
// DISPLAY FIELDS
// ==========================================

const FIELDS = [
  { key: "airline", label: "AIRLINE", slots: 14 },
  { key: "flight", label: "FLIGHT", slots: 8 },
  { key: "route", label: "ROUTE", slots: 9 },
  { key: "aircraft", label: "AIRCRAFT", slots: 12 },
  { key: "level", label: "FLIGHT LEVEL", slots: 7 },
  { key: "speed", label: "GROUND SPEED", slots: 9 }
];

// ==========================================
// AIRLINE DIRECTORY
// ==========================================

const AIRLINES = {
  AUA: "AUSTRIAN",
  DLH: "LUFTHANSA",
  RYR: "RYANAIR",
  EZY: "EASYJET",
  EJU: "EASYJET",
  EZS: "EASYJET",
  SWR: "SWISS",
  BAW: "BRITISH AIR",
  THY: "TURKISH",
  KLM: "KLM",
  AFR: "AIR FRANCE",
  UAE: "EMIRATES",
  QTR: "QATAR",
  WZZ: "WIZZ AIR",
  WMT: "WIZZ AIR",
  EWG: "EUROWINGS",
  CFG: "CONDOR",
  BEL: "BRUSSELS",
  FIN: "FINNAIR",
  SAS: "SAS",
  LOT: "LOT POLISH",
  TAP: "TAP PORTUGAL",
  IBE: "IBERIA",
  ITY: "ITA AIRWAYS",
  DAL: "DELTA",
  UAL: "UNITED",
  AAL: "AMERICAN"
};

// ==========================================
// INITIALIZATION
// ==========================================

const byId = id => document.getElementById(id);

const grids = new Map();

let previous = {};
let running = false;
let lastLogoCode = null;
let currentLogoRequest = 0;

let logoImage;
let logoFallback;

// ==========================================
// BUILD SPLIT-FLAP BOARD
// ==========================================

function makeBoard() {
  const root = byId("rows");

  for (const field of FIELDS) {
    const row = document.createElement("div");
    row.className = "dataRow";

    const label = document.createElement("div");
    label.className = "name";
    label.textContent = field.label;

    const grid = document.createElement("div");
    grid.className = "cells";

    grid.style.setProperty("--slots", field.slots);

    const cells = [];

    for (let i = 0; i < field.slots; i++) {
      const cell = document.createElement("span");

      cell.className = "cell";
      cell.textContent = " ";

      grid.appendChild(cell);
      cells.push(cell);
    }

    grids.set(field.key, cells);

    if (field.key === "airline") {
      const wrapper = document.createElement("div");
      wrapper.className = "airlineDisplay";

      const frame = document.createElement("div");
      frame.className = "logoFrame";

      logoImage = document.createElement("img");

      logoFallback = document.createElement("span");
      logoFallback.className = "logoFallback";
      logoFallback.textContent = "---";

      frame.append(logoImage, logoFallback);
      wrapper.append(frame, grid);

      row.append(label, wrapper);
    } else {
      row.append(label, grid);
    }

    root.appendChild(row);
  }

  byId("location").textContent =
    `${CONFIG.place} · ` +
    `${CONFIG.latitude.toFixed(4)}° N / ` +
    `${CONFIG.longitude.toFixed(4)}° E`;
}

// ==========================================
// AIRLINE LOGOS
// ==========================================

function updateLogo(icao) {
  const code = String(icao || "")
    .trim()
    .toUpperCase();

  if (code === lastLogoCode) return;

  lastLogoCode = code;

  const requestId = ++currentLogoRequest;

  logoImage.onload = null;
  logoImage.onerror = null;
  logoImage.style.display = "none";
  logoImage.removeAttribute("src");

  logoFallback.style.display = "block";
  logoFallback.textContent =
    /^[A-Z]{3}$/.test(code) ? code : "---";

  if (!/^[A-Z]{3}$/.test(code)) return;

  // Local airline logo files:
  // logos/AUA.png, logos/DLH.png, etc.

  const file =
    `${CONFIG.logoFolder}/${code}.png`;

  const candidate = new Image();

  candidate.onload = () => {
    if (requestId !== currentLogoRequest) return;

    logoImage.src = file;
    logoImage.alt = `${code} Airline Logo`;
    logoImage.style.display = "block";
    logoFallback.style.display = "none";
  };

  candidate.onerror = () => {
    if (requestId !== currentLogoRequest) return;

    logoImage.style.display = "none";
    logoFallback.style.display = "block";
  };

  candidate.src = file;
}

// ==========================================
// SPLIT-FLAP ANIMATION
// ==========================================

function render(values) {
  for (const field of FIELDS) {
    const value = String(values[field.key] ?? "---")
      .toUpperCase()
      .replace(/[^A-Z0-9 .+\-/]/g, " ")
      .slice(0, field.slots)
      .padEnd(field.slots, " ");

    const old =
      previous[field.key] ??
      " ".repeat(field.slots);

    grids.get(field.key).forEach((cell, i) => {
      if (value[i] === old[i]) return;

      setTimeout(() => {
        cell.textContent = value[i];

        cell.classList.remove("changed");
        void cell.offsetWidth;
        cell.classList.add("changed");
      }, Math.min(i * 25, 260));
    });

    previous[field.key] = value;
  }

  updateLogo(values.icao);
}

// ==========================================
// AIRCRAFT DISTANCE
// ==========================================

function haversineKm(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;

  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
    Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// ==========================================
// SELECT NEAREST AIRCRAFT
// ==========================================

function selectAircraft(items) {
  return items
    .filter(a =>
      Number.isFinite(a.lat) &&
      Number.isFinite(a.lon) &&
      a.alt_baro !== "ground" &&
      a.airground !== "GND" &&
      (a.seen_pos == null || a.seen_pos < 90)
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
    .filter(item =>
      item.distance <=
      CONFIG.radiusNauticalMiles * 1.852
    )
    .sort((a, b) => a.distance - b.distance)
    [0]?.aircraft;
}

// ==========================================
// FORMAT AIRCRAFT DATA
// ==========================================

function formatAircraft(a) {
  const callsign = String(
    a.flight || a.callsign || ""
  ).trim().toUpperCase();

  const match = callsign.match(/^[A-Z]{3}/);
  const icao = match ? match[0] : "";

  const altitude =
    typeof a.alt_baro === "number"
      ? a.alt_baro
      : typeof a.alt_geom === "number"
        ? a.alt_geom
        : null;

  return {
    icao,

    airline:
      AIRLINES[icao] || "UNKNOWN",

    flight:
      callsign || "---",

    // ADS-B alone does not provide
    // verified departure/destination.
    route:
      "---  ---",

    aircraft:
      String(a.t || "---").toUpperCase(),

    level:
      altitude == null
        ? "---"
        : "FL" + String(
            Math.round(altitude / 100)
          ).padStart(3, "0"),

    speed:
      typeof a.gs === "number"
        ? Math.round(a.gs * 1.852) + " KM/H"
        : "---"
  };
}

// ==========================================
// STATUS
// ==========================================

function setStatus(message, mode) {
  byId("status").textContent = message;
  byId("mode").textContent = mode;
}

// ==========================================
// READ DATA FROM GITHUB ACTIONS
// ==========================================

async function update() {
  if (running || document.hidden) return;

  running = true;

  try {
    const url =
      CONFIG.dataFile + "?t=" + Date.now();

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();

    // Supports ADS-B JSON with an "ac" array
    // or a plain aircraft array.

    const aircraftList = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.ac)
        ? payload.ac
        : Array.isArray(payload.aircraft)
          ? payload.aircraft
          : Array.isArray(payload.states)
            ? payload.states
            : null;

    if (!aircraftList) {
      // Support a preformatted aircraft object.
      const item = payload.airline
        ? payload
        : payload.aircraft &&
          !Array.isArray(payload.aircraft)
          ? payload.aircraft
          : null;

      if (!item || typeof item !== "object") {
        throw new Error("Unknown JSON format");
      }

      const values = {
        ...item,
        icao: item.icao ||
          String(item.callsign || item.flight || "")
            .trim().slice(0, 3).toUpperCase()
      };

      render(values);
      setStatus("DATA UPDATED", "LIVE");
      return;
    }

    // OpenSky state arrays need conversion.
    const normalized = aircraftList.map(a => {
      if (!Array.isArray(a)) return a;

      return {
        flight: a[1],
        lon: a[5],
        lat: a[6],
        alt_baro:
          a[13] != null
            ? a[13] * 3.28084
            : null,
        gs:
          a[9] != null
            ? a[9] / 0.514444
            : null
      };
    });

    const plane = selectAircraft(normalized);

    if (!plane) {
      render({
        icao: "",
        airline: "CLEAR SKY",
        flight: "---",
        route: "---  ---",
        aircraft: "---",
        level: "---",
        speed: "---"
      });

      setStatus(
        "NO AIRCRAFT IN RANGE",
        "LIVE"
      );

      return;
    }

    render(formatAircraft(plane));

    setStatus(
      "DATA UPDATED · " +
      new Date().toLocaleTimeString("de-AT", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      "LIVE"
    );

  } catch (error) {
    console.warn("OVERHEAD:", error);

    // Keep previous flight data visible,
    // but clearly mark the failure.
    setStatus(
      "DATA UNAVAILABLE",
      "OFFLINE"
    );
  } finally {
    running = false;
  }
}

// ==========================================
// CLOCK
// ==========================================

function updateClock() {
  byId("clock").textContent =
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    }) + " UTC";
}

// ==========================================
// START
// ==========================================

function start() {
  makeBoard();

  render({
    icao: "",
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
