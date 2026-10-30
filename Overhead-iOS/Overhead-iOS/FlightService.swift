import CoreLocation
import Foundation

struct FlightService {
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601; return decoder
    }()

    func nearest(from location: CLLocation) async throws -> Flight? {
        let url = URL(string: "https://opendata.adsb.fi/api/v3/lat/\(location.coordinate.latitude)/lon/\(location.coordinate.longitude)/dist/15")!
        var request = URLRequest(url: url); request.timeoutInterval = 20
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else { throw URLError(.badServerResponse) }
        let payload = try decoder.decode(Snapshot.self, from: data)
        let candidates = payload.ac.compactMap { aircraft -> Flight? in
            guard let lat = aircraft.lat, let lon = aircraft.lon, aircraft.altitudeFeet != nil else { return nil }
            var item = aircraft; item.distance = location.distance(from: CLLocation(latitude: lat, longitude: lon)); return item
        }.filter { $0.distance <= 15 * 1852 }.sorted { $0.distance < $1.distance }
        guard var nearest = candidates.first else { return nil }
        nearest = await addingRoute(to: nearest)
        return nearest
    }

    private func addingRoute(to flight: Flight) async -> Flight {
        guard !flight.callsign.isEmpty else { return flight }
        guard let url = URL(string: "https://api.adsbdb.com/v0/callsign/\(flight.callsign.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? flight.callsign)") else { return flight }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let result = try decoder.decode(RouteResponse.self, from: data)
            let origin = result.response?.flightroute?.origin?.iata_code
            let destination = result.response?.flightroute?.destination?.iata_code
            guard let origin, let destination else { return flight }
            var updated = flight; updated = Flight(hex: flight.hex, flight: flight.flight, lat: flight.lat, lon: flight.lon, alt_baro: flight.alt_baro, gs: flight.gs, t: flight.t, route: "\(origin.uppercased())-\(destination.uppercased())"); updated.distance = flight.distance; return updated
        } catch { return flight }
    }
}
