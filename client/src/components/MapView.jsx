import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';

/* ── Icons ─────────────────────────────────────────────── */
const pinIcon = (color) =>
  L.divIcon({
    className: 'custom-pin',
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.45)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });

const pickupIcon = pinIcon('#0d9488');
const destIcon   = pinIcon('#e11d48');

const carIcon = L.divIcon({
  className: 'car-pin',
  html: `
    <div style="position:relative;width:36px;height:36px">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(13,148,136,.2);animation:carPing 1.6s ease-out infinite"></div>
      <div style="position:absolute;inset:6px;border-radius:50%;background:rgba(13,148,136,.35);animation:carPing 1.6s ease-out infinite .4s"></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px">🚗</div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const myLocIcon = L.divIcon({
  className: 'my-loc-pin',
  html: `
    <div style="position:relative;width:24px;height:24px">
      <div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(59,130,246,.25);animation:carPing 2s ease-out infinite"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ── CSS animation injected once ───────────────────────── */
if (!document.getElementById('map-keyframes')) {
  const style = document.createElement('style');
  style.id = 'map-keyframes';
  style.textContent = `
    @keyframes carPing {
      0%   { transform: scale(1);   opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .leaflet-container { font-family: inherit; }
  `;
  document.head.appendChild(style);
}

/* ── Internal helpers ───────────────────────────────────── */
function Recenter({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.panTo([point.lat, point.lng], { animate: true, duration: 0.8 });
  }, [point, map]);
  return null;
}

function FitBounds({ points }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    const valid = points.filter(Boolean).map((p) => [p.lat, p.lng]);
    if (valid.length >= 2 && !fitted.current) {
      map.fitBounds(valid, { padding: [50, 50], animate: true });
      fitted.current = true;
    } else if (valid.length === 1 && !fitted.current) {
      map.setView(valid[0], 14, { animate: true });
      fitted.current = true;
    }
  }, [points, map]);
  return null;
}

/* Smoothly animate car marker to new position */
function AnimatedCarMarker({ position }) {
  const markerRef = useRef(null);
  const prev = useRef(position);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !position) return;
    const from = prev.current || position;
    const to   = position;
    prev.current = position;

    const steps = 20;
    let step = 0;
    const dlat = (to.lat - from.lat) / steps;
    const dlng = (to.lng - from.lng) / steps;

    const tick = setInterval(() => {
      step++;
      marker.setLatLng([from.lat + dlat * step, from.lng + dlng * step]);
      if (step >= steps) clearInterval(tick);
    }, 50);
    return () => clearInterval(tick);
  }, [position]);

  if (!position) return null;
  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={carIcon}
    >
      <Popup>🚗 Driver live location</Popup>
    </Marker>
  );
}

/* ── Main component ─────────────────────────────────────── */
/**
 * @param {object} pickup        { lat, lng, address? }
 * @param {object} destination   { lat, lng, address? }
 * @param {*}      routeGeometry GeoJSON LineString | encoded string | null
 * @param {object} vehicle       { lat, lng } — live car position (driver)
 * @param {object} myLocation    { lat, lng } — logged-in user's live GPS
 * @param {number} height        px height of the map
 * @param {boolean} follow       pan map to vehicle when it moves
 * @param {boolean} liveTrip     if true, use animated dashed polyline style
 */
export default function MapView({
  pickup,
  destination,
  routeGeometry,
  vehicle,
  myLocation,
  height = 360,
  follow = true,
  liveTrip = false,
}) {
  const center = pickup || destination || myLocation || { lat: 12.9716, lng: 77.5946 };

  const routeLine = useMemo(() => {
    if (!routeGeometry) return null;
    let geo = routeGeometry;
    if (typeof geo === 'string') {
      try { geo = JSON.parse(geo); } catch { return null; }
    }
    if (!geo?.coordinates) return null;
    return geo.coordinates.map(([lng, lat]) => [lat, lng]); // GeoJSON → Leaflet
  }, [routeGeometry]);

  /* Split route into "travelled" (before car) and "ahead" segments */
  const { travelled, ahead } = useMemo(() => {
    if (!routeLine || !vehicle || !liveTrip) return { travelled: null, ahead: routeLine };
    // Find closest point on route to vehicle
    let minDist = Infinity;
    let splitIdx = 0;
    routeLine.forEach(([rlat, rlng], i) => {
      const d = Math.hypot(rlat - vehicle.lat, rlng - vehicle.lng);
      if (d < minDist) { minDist = d; splitIdx = i; }
    });
    return {
      travelled: routeLine.slice(0, splitIdx + 1),
      ahead:     routeLine.slice(splitIdx),
    };
  }, [routeLine, vehicle, liveTrip]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ height, width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Pickup & destination markers */}
      {pickup && (
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>📍 {pickup.address || 'Pickup'}</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
          <Popup>🏁 {destination.address || 'Destination'}</Popup>
        </Marker>
      )}

      {/* Route polyline — split view for live trips */}
      {liveTrip ? (
        <>
          {travelled && travelled.length >= 2 && (
            <Polyline
              positions={travelled}
              pathOptions={{ color: '#94a3b8', weight: 5, opacity: 0.5, dashArray: '6 4' }}
            />
          )}
          {ahead && ahead.length >= 2 && (
            <Polyline
              positions={ahead}
              pathOptions={{ color: '#0d9488', weight: 5, opacity: 0.85 }}
            />
          )}
        </>
      ) : (
        routeLine && routeLine.length >= 2 && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#0d9488', weight: 5, opacity: 0.78, lineJoin: 'round', lineCap: 'round' }}
          />
        )
      )}

      {/* Animated car (driver live position) */}
      {vehicle && <AnimatedCarMarker position={vehicle} />}

      {/* User's own live location — pulsing blue dot */}
      {myLocation && (
        <Marker position={[myLocation.lat, myLocation.lng]} icon={myLocIcon}>
          <Popup>📍 Your location</Popup>
        </Marker>
      )}

      {/* Map auto-behaviors */}
      {follow && vehicle && <Recenter point={vehicle} />}
      {!vehicle && <FitBounds points={[pickup, destination, myLocation].filter(Boolean)} />}
    </MapContainer>
  );
}
