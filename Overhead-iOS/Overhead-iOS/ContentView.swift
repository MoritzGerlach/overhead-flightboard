import CoreLocation
import SwiftUI

struct ContentView: View {
    @StateObject private var locationManager = LocationManager()
    @State private var flight: Flight?
    @State private var isLoading = false
    @State private var message = "BEREIT"
    @State private var errorMessage: String?
    private let service = FlightService()

    var body: some View {
        ZStack { Color(red: 0.06, green: 0.075, blue: 0.07).ignoresSafeArea()
            ScrollView { VStack(alignment: .leading, spacing: 22) {
                header; locationRow; board; action
            }.padding(20) }
        }.task { locationManager.requestPermission() }
        .alert("Flugzeuge konnten nicht geladen werden", isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })) { Button("OK", role: .cancel) {} } message: { Text(errorMessage ?? "Unbekannter Fehler") }
    }

    private var header: some View { HStack { VStack(alignment: .leading, spacing: 6) { Text("OVERHEAD").font(.caption).tracking(4).foregroundStyle(Color(red: 0.71, green: 0.66, blue: 0.53)); Text("NEAREST AIRCRAFT").font(.system(size: 26, weight: .semibold, design: .rounded)).foregroundStyle(.white) }; Spacer(); Text(message).font(.caption2).tracking(1).foregroundStyle(.secondary) } }
    private var locationRow: some View { Group { if let location = locationManager.location { Text("POSITION  \(location.coordinate.latitude, specifier: "%.4f")° N / \(location.coordinate.longitude, specifier: "%.4f")° E").font(.caption2).tracking(1).foregroundStyle(.secondary) } else { Text("POSITION  WIRD ERMITTELT …").font(.caption2).tracking(1).foregroundStyle(.secondary) } } }
    private var board: some View { VStack(spacing: 9) { row("AIRLINE", airlineName, logo: airlineLogo); row("FLIGHT", flight?.callsign ?? "---"); row("ROUTE", flight?.route ?? "---  ---"); row("AIRCRAFT", flight?.t?.uppercased() ?? "---"); row("FLIGHT LEVEL", level); row("GROUND SPEED", speed) }.padding(16).background(Color(red: 0.105, green: 0.12, blue: 0.115)).overlay(Rectangle().stroke(Color.gray.opacity(0.25))) }
    private var airlineName: String { Self.airlines[flight?.icao ?? ""] ?? (flight == nil ? "CONNECTING" : "UNKNOWN") }
    private var airlineLogo: String? { Self.logos[flight?.icao ?? ""] }
    private var level: String { flight?.altitudeFeet.map { "FL\(Int(($0 / 100).rounded()))" } ?? "---" }
    private var speed: String { flight?.gs.map { "\(Int(($0 * 1.852).rounded())) KM/H" } ?? "---" }
    private func row(_ label: String, _ value: String, logo: String? = nil) -> some View { VStack(alignment: .leading, spacing: 5) { Text(label).font(.caption2).tracking(2).foregroundStyle(.secondary); HStack { if let logo { Text(logo).font(.caption).bold().foregroundStyle(Color(red: 0.71, green: 0.66, blue: 0.53)).frame(width: 58) }; Text(value).font(.system(size: 20, weight: .bold, design: .monospaced)).foregroundStyle(.white).lineLimit(1).minimumScaleFactor(0.65) }.frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 11).padding(.horizontal, 10).background(Color(red: 0.16, green: 0.18, blue: 0.17)) } }
    private var action: some View { Button { search() } label: { HStack { Spacer(); if isLoading { ProgressView().tint(.white) }; Text("FLUGZEUG SUCHEN").font(.headline).tracking(1); Spacer() }.padding(.vertical, 16) }.buttonStyle(.borderedProminent).tint(Color(red: 0.52, green: 0.39, blue: 0.20)).disabled(isLoading || locationManager.location == nil) }
    private func search() { guard let location = locationManager.location else { errorMessage = "Bitte erlaube den Standortzugriff in den iPhone-Einstellungen."; return }; isLoading = true; message = "SUCHT …"; Task { do { flight = try await service.nearest(from: location); message = flight == nil ? "CLEAR SKY" : "LIVE" } catch { errorMessage = error.localizedDescription; message = "OFFLINE" }; isLoading = false } }
    static let airlines = ["AUA":"AUSTRIAN", "DLH":"LUFTHANSA", "RYR":"RYANAIR", "EZY":"EASYJET", "EJU":"EASYJET", "BAW":"BRITISH AIR", "THY":"TURKISH", "KLM":"KLM", "AFR":"AIR FRANCE", "UAE":"EMIRATES", "QTR":"QATAR", "WZZ":"WIZZ AIR", "LOT":"LOT POLISH", "IBE":"IBERIA", "DAL":"DELTA", "UAL":"UNITED", "AAL":"AMERICAN"]
    static let logos = ["DLH":"LUFTHANSA", "RYR":"RYANAIR", "EZY":"EASYJET", "EJU":"EASYJET", "BAW":"BRITISH AIR", "THY":"TURKISH", "KLM":"KLM", "AFR":"AIR FRANCE", "UAE":"EMIRATES", "QTR":"QATAR", "WZZ":"WIZZ AIR", "LOT":"LOT POLISH", "IBE":"IBERIA", "DAL":"DELTA", "UAL":"UNITED", "AAL":"AMERICAN"]
}
