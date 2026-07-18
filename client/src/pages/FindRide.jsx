import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Search, ClipboardList, MapPin, ArrowRight, Armchair, CalendarClock } from 'lucide-react';
import api, { apiError } from '../api.js';
import AddressInput from '../components/AddressInput.jsx';
import MapView from '../components/MapView.jsx';
import {
  Button, Card, Input, Badge, Empty, Alert, PageTitle,
  Pagination, usePagination, money,
} from '../components/ui.jsx';

const PER_PAGE = 5;

export default function FindRide() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [dest, setDest] = useState(null);
  const [mode, setMode] = useState('now');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [route, setRoute] = useState(null);
  const [rides, setRides] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [searchId, setSearchId] = useState(0);   // bumps on each new search → resets pagination

  /* Paginate the result set */
  const pager = usePagination(rides, PER_PAGE, searchId);

  /* Watch user's live GPS position */
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  /* ── Geocode a plain-text address if user typed without picking ── */
  async function resolvePoint(current, text) {
    if (current) return current;           // already has coords from dropdown
    if (!text || text.length < 3) return null;
    try {
      const { data } = await api.get('/geo/search', { params: { q: text } });
      const first = data.results?.[0];
      if (!first) return null;
      return { address: first.label, lat: first.lat, lng: first.lng };
    } catch { return null; }
  }

  /* ── Confirm route (fetch polyline from OSRM) ── */
  const [pickupText, setPickupText] = useState('');
  const [destText, setDestText] = useState('');

  const confirmRoute = async () => {
    const p = await resolvePoint(pickup, pickupText);
    const d = await resolvePoint(dest, destText);
    if (!p || !d) return setError('Select both pickup and destination');
    if (!pickup) setPickup(p);
    if (!dest) setDest(d);
    setError(''); setBusy(true);
    try {
      const { data } = await api.post('/geo/route', { pickup: p, destination: d });
      setRoute(data);
    } catch (e) { setError(apiError(e)); }
    finally { setBusy(false); }
  };

  /* ── Search available rides ── */
  const search = async () => {
    const p = await resolvePoint(pickup, pickupText);
    const d = await resolvePoint(dest, destText);
    if (!p || !d) return setError('Enter a valid pickup and destination first');
    if (mode === 'schedule' && !date) return setError('Choose a travel date for scheduled rides');
    if (!pickup) setPickup(p);
    if (!dest) setDest(d);
    setError(''); setBusy(true); setRides(null);
    try {
      const { data } = await api.get('/rides', {
        params: {
          date: mode === 'schedule' ? date : undefined,
          seats,
          pickupLat: p.lat, pickupLng: p.lng,
          destLat: d.lat, destLng: d.lng,
          radiusKm: 15,
        },
      });
      setRides(data.rides);
      setSearchId((n) => n + 1);
    } catch (e) { setError(apiError(e)); }
    finally { setBusy(false); }
  };

  const browseAll = async () => {
    setError(''); setBusy(true); setRides(null);
    try {
      const { data } = await api.get('/rides', { params: { seats } });
      setRides(data.rides);
      setSearchId((n) => n + 1);
    } catch (e) { setError(apiError(e)); }
    finally { setBusy(false); }
  };

  /* ── Book a ride ── */
  const book = async (rideId) => {
    setError(''); setBookingId(rideId);
    try {
      const { data } = await api.post('/bookings', { rideId, seats });
      navigate(`/app/trips/${data.trip.trip_id}`);
    } catch (e) { setError(apiError(e)); setBookingId(null); }
  };

  /* Allow buttons as long as either text or coords exist */
  const canSearch = (pickup || pickupText.length >= 3) && (dest || destText.length >= 3);

  return (
    <div className="space-y-5">
      <PageTitle icon={Search} subtitle="Search rides published by colleagues on your route.">
        Find a Ride
      </PageTitle>

      <Card className="space-y-4 p-5">
        <AddressInput
          label="Pickup location"
          value={pickup?.address}
          placeholder="Where from?"
          onSelect={(p) => {
            setPickup(p);
            setPickupText(p?.address || '');
            setRoute(null);
          }}
        />
        <AddressInput
          label="Destination"
          value={dest?.address}
          placeholder="Where to?"
          onSelect={(d) => {
            setDest(d);
            setDestText(d?.address || '');
            setRoute(null);
          }}
        />

        <div className="flex flex-wrap gap-2">
          {[
            { value: 'now', label: 'Pickup now' },
            { value: 'schedule', label: 'Schedule' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-95',
                mode === option.value
                  ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-glow ring-1 ring-white/25'
                  : 'glass-input text-ink-600 hover:text-brand-dark',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Travel date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={mode === 'now'}
            className={mode === 'now' ? 'opacity-50' : ''}
          />
          <Input
            label="Seats"
            type="number"
            min="1"
            max="8"
            value={seats}
            onChange={(e) => setSeats(+e.target.value)}
          />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={confirmRoute} disabled={busy || !canSearch}>
            <Map className="h-4 w-4" /> Confirm route
          </Button>
          <Button onClick={search} disabled={busy || !canSearch} id="search-rides-btn">
            {busy ? 'Searching…' : <><Search className="h-4 w-4" /> Search</>}
          </Button>
          <Button variant="ghost" onClick={browseAll} disabled={busy}>
            <ClipboardList className="h-4 w-4" /> Browse all rides
          </Button>
        </div>
      </Card>

      {/* Live location + route preview map */}
      {(route || myLocation) && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <span className="font-bold text-ink-700">
              {route ? 'Route preview' : 'Your location'}
            </span>
            {route && (
              <span className="rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                {route.distanceKm} km · ~{route.durationMinutes} min
                {route.fallback ? ' (estimated)' : ''}
              </span>
            )}
            {!route && myLocation && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
                Live location
              </span>
            )}
          </div>
          <MapView
            pickup={pickup}
            destination={dest}
            routeGeometry={route?.geometry}
            myLocation={myLocation}
            height={320}
            follow={false}
          />
        </Card>
      )}

      {/* Search results */}
      {rides && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-500">
              {pager.total} available ride{pager.total === 1 ? '' : 's'}
            </h2>
          </div>

          {pager.total === 0 ? (
            <Empty
              icon={Search}
              title="No matching rides"
              hint="Try widening your date or search area, or browse all rides."
            />
          ) : (
            <>
              {/* Top pager */}
              <Pagination {...pager} label="rides" />

              {pager.items.map((r) => (
                <Card key={r.ride_id} className="p-4" hover>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-ink-800">{r.driver_name}</span>
                        <Badge status={r.status} />
                      </div>

                      {/* Route: pickup → destination in one line */}
                      <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden text-sm text-ink-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                        <span className="min-w-0 flex-1 truncate">{r.pickup_address}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
                        <span className="min-w-0 flex-1 truncate">{r.destination_address}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" /> {new Date(r.departure_datetime).toLocaleString()}
                        </span>
                        <span>{r.vehicle_model} ({r.registration_number})</span>
                        <span className="inline-flex items-center gap-1">
                          <Armchair className="h-3 w-3" /> {r.available_seats} seat(s) left
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-brand-dark">{money(r.fare_per_seat)}</div>
                      <div className="text-xs text-ink-400">per seat</div>
                      <Button
                        className="mt-2"
                        size="sm"
                        onClick={() => book(r.ride_id)}
                        disabled={bookingId === r.ride_id}
                      >
                        {bookingId === r.ride_id ? 'Booking…' : 'Book'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Bottom pager */}
              <Pagination {...pager} label="rides" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
