import CoreLocation
import Foundation

@MainActor
final class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var location: CLLocation?
    @Published private(set) var authorization: CLAuthorizationStatus = .notDetermined
    private let manager = CLLocationManager()

    override init() {
        super.init(); manager.delegate = self; authorization = manager.authorizationStatus
    }
    func requestPermission() { manager.requestWhenInUseAuthorization() }
    func start() { manager.startUpdatingLocation() }
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorization = manager.authorizationStatus
        if authorization == .authorizedWhenInUse || authorization == .authorizedAlways { start() }
    }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        location = locations.last
    }
}
