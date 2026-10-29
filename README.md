# OVERHEAD — Live Flightboard

A real-time aircraft tracking display inspired by vintage airport split-flap departure boards.

OVERHEAD detects aircraft flying near a selected location and displays their flight information on a minimalist, animated departure board.

The application is built entirely with HTML, CSS and JavaScript and can be hosted for free using GitHub Pages.

## Features

- **Live Aircraft Tracking** — Detects aircraft near a configurable location.
- **Vintage Split-Flap Display** — Animated characters inspired by classic airport departure boards.
- **Automatic Updates** — GitHub Actions refreshes aircraft data every 5 minutes; the display checks for a new snapshot every 30 seconds.
- **Responsive Design** — Optimized for desktop, laptop and smartphone screens.
- **Minimalist Interface** — No buttons, menus or user input.
- **Flight Information** — Displays airline, flight number, aircraft type, altitude and ground speed.
- **Flight Level** — Shows altitude in standard aviation format (e.g. FL350).
- **Airport Codes** — Supports three-letter IATA airport codes when route information is available.
- **No Aircraft Detection** — Displays a dedicated message when no aircraft are detected.
- **Offline Detection** — Displays an error message if the aircraft data source is unavailable.

## Display Information

The flightboard is designed to show the following information:

| Information | Example |
|-------------|---------|
| Airline | Lufthansa |
| Flight Number | LH1234 |
| Departure | FRA |
| Destination | VIE |
| Aircraft | Airbus A320neo |
| Flight Level | FL350 |
| Ground Speed | 845 km/h |

Departure and destination information may not always be available from the aircraft tracking API.

## Default Location

The application is initially configured to monitor aircraft near Vienna, Austria.

**Location:** Vienna, Austria

**Coordinates:**
- Latitude: `48.2082`
- Longitude: `16.3738`

**Tracking Radius:** 15 nautical miles (approximately 28 km)

**Refresh Interval:** 5 minutes

These settings can be modified directly in `app.js`.

### Example Configuration

```javascript
const CONFIG = {
  place: "VIENNA",
  latitude: 48.2082,
  longitude: 16.3738,
  radiusNauticalMiles: 15,
  refreshSeconds: 30,
  maxSnapshotAgeSeconds: 1200,
  dataFile: "flights.json",
  logoFolder: "logos"
};
```

To monitor aircraft above another location, simply replace the coordinates.

## Aircraft Data

GitHub Actions retrieves nearby aircraft from ADSB.fi every 5 minutes and writes a `flights.json` snapshot. The browser reads that published snapshot; it does not call the aircraft API directly.

Depending on data availability, the API may provide:

- Aircraft position
- Flight number or callsign
- Aircraft type
- Barometric altitude
- Ground speed
- Aircraft identification

Some information, particularly departure and destination airports, requires additional data sources.

The workflow also looks up the nearest aircraft's route through ADSBdb when route information is available. The display shows the route when both airport codes are valid IATA codes.

## Automatic Updates

GitHub Actions collects a new snapshot every 5 minutes. While open, the webpage checks for a newer snapshot every 30 seconds.

The display marks data as stale if its snapshot is over 20 minutes old. To preview the layout without live aircraft data, open the page with `?demo=1`, for example `https://moritzgerlach.github.io/overhead-flightboard/?demo=1`.

When new aircraft data becomes available, the display automatically updates.

Changed characters are animated to resemble the mechanical split-flap displays traditionally used in airports and railway stations.

No manual interaction is required.

## No Aircraft in Range

If no aircraft are detected within the configured tracking radius, the display switches to a dedicated standby screen.

Example:

```text
OVERHEAD — VIENNA

CLEAR SKY

NO AIRCRAFT IN RANGE
```

The application continues checking for aircraft automatically.

When a new aircraft enters the monitored area, the display switches back to the flight information.

## Data Offline

If the aircraft data source cannot be reached, the display shows a separate status.

```text
OVERHEAD — VIENNA

DATA OFFLINE

API UNAVAILABLE
```

This ensures that a technical problem is not confused with an empty airspace.

The application automatically attempts to retrieve fresh data during the next scheduled update.

## Responsive Design

OVERHEAD supports two primary display formats.

### Desktop & Laptop

A widescreen layout inspired by traditional airport departure boards.

Designed for:
- Desktop monitors
- Laptop screens
- External displays

### Smartphone

A compact layout adapted to smaller screens.

Designed for:
- iPhone
- Android smartphones
- Portrait displays

Both layouts feature:

- No horizontal scrolling
- No interactive controls
- No input fields
- Automatic resizing
- Minimalist typography

## Deployment with GitHub Pages

OVERHEAD can be hosted for free using GitHub Pages.

### GitHub Pages

This repository already deploys through `.github/workflows/update-flights.yml`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Each push to `main` and each scheduled workflow run publishes the display and its latest aircraft snapshot.

### Open the Website

Once GitHub Pages has published the project, the application should be available at:

https://moritzgerlach.github.io/overhead-flightboard/

The website will automatically load the flightboard and attempt to retrieve aircraft data.

## Technical Architecture

The browser displays static files hosted by GitHub Pages. GitHub Actions runs the scheduled data collection and publishes the resulting snapshot; no always-on server is required.

```text
AIRCRAFT
    |
    v
ADS-B DATA NETWORK
    |
    v
ADSB.fi API
    |
    v
GITHUB ACTIONS
    |
    v
ADSBdb ROUTE LOOKUP
    |
    v
flights.json SNAPSHOT
    |
    v
GITHUB PAGES
    |
    v
JAVASCRIPT DISPLAY
    |
    v
WEB BROWSER
```

GitHub Actions retrieves and packages aircraft data. In the browser, `app.js` reads the snapshot, selects the nearest aircraft in range, formats its information and updates the display.

The Raspberry Pi only needs to open the published page in a browser; data collection continues in GitHub Actions.

## Future Hardware Integration

The project is designed to support a future standalone aircraft display.

Possible display hardware:

- Raspberry Pi Zero 2 W
- Raspberry Pi 4 or 5
- E-Paper display
- Small LCD display
- Dedicated digital picture frame

A Raspberry Pi can open the published page in a fullscreen browser. Before the device arrives, the page can be checked on a desktop at the target screen size and left running to observe refresh and recovery behavior.

For E-Paper hardware, an additional rendering component may be required.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5 |
| Styling | CSS3 |
| Logic | JavaScript |
| Aircraft Data | ADSB.fi via GitHub Actions |
| Route Lookup | ADSBdb via GitHub Actions |
| Hosting | GitHub Pages |
| Configuration | JavaScript |
| Data Collection | GitHub Actions |

## Project Status

**Current Stage:** Preparing the display and data workflow before Raspberry Pi setup.

### Implemented

- Vintage split-flap interface
- Responsive layout
- Configurable monitoring location
- Automatic refresh
- Aircraft selection logic
- Empty-airspace display
- Offline display
- Scheduled snapshot publishing
- Local airline icons with text fallback

### Planned Improvements

- Additional airline icons, including Austrian Airlines
- Confirm route and offline behavior across real snapshots
- Raspberry Pi integration
- E-Paper display support

## License

No license has been specified yet.

Unless a license is added, the repository's source code is not automatically licensed for reuse by others.

---

OVERHEAD

*The sky above you. One flight at a time.*
