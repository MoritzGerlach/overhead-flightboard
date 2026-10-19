# OVERHEAD — Live Flightboard

A real-time aircraft tracking display inspired by vintage airport split-flap departure boards.

OVERHEAD detects aircraft flying near a selected location and displays their flight information on a minimalist, animated departure board.

The application is built entirely with HTML, CSS and JavaScript and can be hosted for free using GitHub Pages.

## Features

- **Live Aircraft Tracking** — Detects aircraft near a configurable location.
- **Vintage Split-Flap Display** — Animated characters inspired by classic airport departure boards.
- **Automatic Updates** — Refreshes aircraft data every 5 minutes.
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
  refreshMinutes: 5,
  demoMode: false
};
```

To monitor aircraft above another location, simply replace the coordinates.

## Aircraft Data

The application is designed to retrieve live aircraft position data from the Airplanes.live API.

Depending on data availability, the API may provide:

- Aircraft position
- Flight number or callsign
- Aircraft type
- Barometric altitude
- Ground speed
- Aircraft identification

Some information, particularly departure and destination airports, requires additional data sources.

**Important:** Direct API requests from GitHub Pages depend on the API provider's CORS policy, availability and usage limits.

If browser requests are blocked, a lightweight API proxy may be required.

## Automatic Updates

The application checks for nearby aircraft every 5 minutes while the webpage is open.

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

### 1. Create a Repository

Create a new GitHub repository named:

`overhead-flightboard`

### 2. Upload the Files

Upload the following files into the repository's root directory:

```text
overhead-flightboard/
│
├── index.html
├── app.js
└── README.md
```

### 3. Enable GitHub Pages

Navigate to:

`Settings → Pages`

Under **Build and deployment**, select:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

Click **Save**.

### 4. Open the Website

Once GitHub Pages has published the project, the application should be available at:

https://moritzgerlach.github.io/overhead-flightboard/

The website will automatically load the flightboard and attempt to retrieve aircraft data.

## Technical Architecture

OVERHEAD is designed to operate without a dedicated backend server.

```text
AIRCRAFT
    |
    v
ADS-B DATA NETWORK
    |
    v
AIRPLANES.LIVE API
    |
    v
JAVASCRIPT (app.js)
    |
    v
LOCATION FILTER
    |
    v
FLIGHT DATA PROCESSING
    |
    v
SPLIT-FLAP DISPLAY
    |
    v
HTML / CSS
    |
    v
WEB BROWSER
```

The JavaScript application handles:

1. Aircraft data retrieval.
2. Geographic filtering.
3. Aircraft selection.
4. Data processing.
5. Display updates.
6. Split-flap animations.

All processing takes place in the user's browser.

GitHub Pages hosts the static website but does not execute server-side JavaScript or Python.

## Future Hardware Integration

The project is designed to support a future standalone aircraft display.

Potential hardware:

- Raspberry Pi Zero 2 W
- Raspberry Pi 4 or 5
- E-Paper display
- Small LCD display
- Dedicated digital picture frame

A Raspberry Pi could run the application locally and display it in fullscreen mode.

For E-Paper hardware, an additional rendering component may be required.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5 |
| Styling | CSS3 |
| Logic | JavaScript |
| Aircraft Data | Airplanes.live API |
| Hosting | GitHub Pages |
| Configuration | JavaScript |
| Backend | Not required for initial version |

## Project Status

**Current Stage:** Initial development and live API testing.

### Implemented

- Vintage split-flap interface
- Responsive layout
- Configurable monitoring location
- Automatic refresh
- Aircraft selection logic
- Empty-airspace display
- Offline display

### Planned Improvements

- Reliable departure and destination airport identification
- Expanded airline identification
- Aircraft model database
- Airline logo integration
- Improved aircraft selection logic
- Additional data sources
- Raspberry Pi integration
- E-Paper display support

## License

No license has been specified yet.

Unless a license is added, the repository's source code is not automatically licensed for reuse by others.

---

OVERHEAD

*The sky above you. One flight at a time.*
