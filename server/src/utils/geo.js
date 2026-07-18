import config from '../config.js';

// All free, no API key:
//  - Photon (Komoot)  for geocoding / autocomplete + reverse  (permissive, no UA policy)
//  - OSRM public demo for driving routes + distance/duration
// Node 18+ provides global fetch.

const headers = { 'User-Agent': config.geo.userAgent, 'Accept': 'application/json' };

/** Build a readable address label from Photon feature properties. */
function photonLabel(p = {}) {
  const line = p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street;
  const parts = [p.name, line, p.district, p.city || p.town || p.village, p.county, p.state, p.country];
  return [...new Set(parts.filter(Boolean))].join(', ');
}

/**
 * Forward geocode a free-text address -> list of {label, lat, lng}.
 * Returns [] on any upstream failure (keeps autocomplete quiet + non-fatal).
 */
export async function geocode(q, limit = 6) {
  if (!q || q.trim().length < 2) return [];
  try {
    const url = `${config.geo.photonUrl}/api/?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || [])
      .filter((f) => f.geometry?.coordinates?.length === 2)
      .map((f) => ({
        label: photonLabel(f.properties) || f.properties?.name || 'Unknown place',
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        type: f.properties?.osm_value,
      }));
  } catch {
    return [];
  }
}

/** Reverse geocode coords -> address string (or null). */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `${config.geo.photonUrl}/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    return f ? photonLabel(f.properties) : null;
  } catch {
    return null;
  }
}

/**
 * Get a driving route between two points.
 * Returns { distanceKm, durationMinutes, geometry (GeoJSON) }.
 * Throws on failure so callers can fall back to haversine.
 */
export async function getRoute(pickup, destination) {
  const coords = `${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}`;
  const url = `${config.geo.osrmUrl}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`route failed: ${res.status}`);
  const data = await res.json();
  if (!data.routes || !data.routes.length) throw new Error('no route found');
  const route = data.routes[0];
  return {
    distanceKm: +(route.distance / 1000).toFixed(2),
    durationMinutes: Math.round(route.duration / 60),
    geometry: route.geometry, // GeoJSON LineString {type, coordinates:[[lng,lat],...]}
  };
}

/** Haversine distance in km (fallback when OSRM unavailable). */
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return +(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))).toFixed(2);
}

/**
 * Sample N evenly-spaced pickup nodes from an OSRM GeoJSON LineString.
 * @param {object} geometry  - GeoJSON LineString {type, coordinates:[[lng,lat],...]}
 * @param {number} distanceKm - total route distance (used to pick node count)
 * @returns {Array<{lat,lng,nodeIndex}>}
 */
export function sampleRouteNodes(geometry, distanceKm) {
  const coords = geometry?.coordinates;
  if (!coords || coords.length < 2) return [];

  // Choose count: 3 for short routes, up to 6 for long ones (every ~10km).
  const count = Math.min(6, Math.max(3, Math.round(distanceKm / 10) + 2));

  const points = [];
  for (let i = 0; i < count; i++) {
    // Evenly space indices across the coordinate array (skip pure start/end which are driver's own points).
    const fraction = (i + 1) / (count + 1);  // e.g. for count=3: 0.25, 0.5, 0.75
    const idx = Math.round(fraction * (coords.length - 1));
    const [lng, lat] = coords[Math.min(idx, coords.length - 1)];
    points.push({ lat: +lat.toFixed(6), lng: +lng.toFixed(6), nodeIndex: i });
  }
  return points;
}
