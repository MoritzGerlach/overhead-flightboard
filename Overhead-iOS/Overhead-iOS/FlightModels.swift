import CoreLocation

struct Flight: Decodable, Identifiable {
    let hex: String?
    let flight: String?
    let lat: Double?
    let lon: Double?
    let alt_baro: Altitude?
    let gs: Double?
    let t: String?
    let route: String?

    var id: String { hex ?? flight ?? UUID().uuidString }
    var callsign: String { (flight ?? "").trimmingCharacters(in: .whitespacesAndNewlines).uppercased() }
    var icao: String { String(callsign.prefix(3)) }
    var altitudeFeet: Double? { alt_baro?.value }
    var distance: CLLocationDistance = .greatestFiniteMagnitude
}

enum Altitude: Decodable {
    case number(Double), ground
    var value: Double? { if case let .number(value) = self { return value }; return nil }
    init(from decoder: Decoder) throws {
        if let value = try? decoder.singleValueContainer().decode(Double.self) { self = .number(value); return }
        self = .ground
    }
}

struct Snapshot: Decodable { let fetchedAt: Date?; let ac: [Flight] }
struct RouteResponse: Decodable {
    let response: RouteData?
    struct RouteData: Decodable {
        let flightroute: FlightRoute?
    }
    struct FlightRoute: Decodable {
        let origin: Airport?
        let destination: Airport?
    }
    struct Airport: Decodable { let iata_code: String? }
}
