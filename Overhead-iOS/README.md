# OVERHEAD iPhone-App

Native SwiftUI version of the existing flight display. It requests the iPhone's current position, and only when **FLUGZEUG SUCHEN** is tapped it queries ADSB.fi for aircraft within 15 nautical miles. The nearest aircraft is enriched with a route lookup through ADSBdb when available. There is no timer or background polling.

## Start in Xcode

1. Open `Overhead-iOS.xcodeproj` in Xcode 16 or later.
2. Select an iPhone Simulator or a connected iPhone and press Run.
3. Accept the location permission dialog. For the simulator, set a custom location via **Features → Location**.
4. Tap **FLUGZEUG SUCHEN** to request a fresh result.

The project uses `NSLocationWhenInUseUsageDescription` and has a minimum deployment target of iOS 17. The app calls the existing public endpoints used by the web project; production distribution should add an application backend if API rate limits or provider policies require it.
