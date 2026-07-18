import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Car, ClipboardList, RefreshCw, Armchair, MapPin, Clock, ArrowRight, Map as MapIcon, User } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Card, Badge, Button, Empty, Spinner, Alert, PageTitle,
  Pagination, usePagination, money,
} from '../components/ui.jsx';

const tabs = [
  { key: 'offered',   label: 'Offered Rides',  Icon: Car },
  { key: 'all',       label: 'All Trips',      Icon: ClipboardList },
  { key: 'driver',    label: 'As Driver',      Icon: MapIcon },
  { key: 'passenger', label: 'As Passenger',   Icon: User },
];

const PER_PAGE = 5;

export default function MyTrips() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') || 'offered';

  const [trips,  setTrips]  = useState(null);
  const [rides,  setRides]  = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelErr,  setCancelErr]  = useState('');

  /* Load trips (booked) */
  useEffect(() => {
    if (role === 'offered') { setTrips([]); return; }
    setTrips(null);
    api.get('/trips', { params: { role } })
      .then(({ data }) => setTrips(data.trips))
      .catch(() => setTrips([]));
  }, [role]);

  /* Load offered rides (driver's published rides) */
  useEffect(() => {
    api.get('/rides/mine')
      .then(({ data }) => setRides(data.rides))
      .catch(() => setRides([]));
  }, []);

  const cancelRide = async (rideId) => {
    setCancelling(rideId); setCancelErr('');
    try {
      await api.patch(`/rides/${rideId}/cancel`);
      setRides((prev) => prev.map((r) => r.ride_id === rideId ? { ...r, status: 'CANCELLED' } : r));
    } catch (e) {
      setCancelErr(e?.response?.data?.error || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  /* Independent pagers, both reset when the tab changes */
  const ridePager = usePagination(rides, PER_PAGE, role);
  const tripPager = usePagination(trips, PER_PAGE, role);

  const openCount = Array.isArray(rides) ? rides.filter((r) => r.status === 'OPEN').length : 0;

  return (
    <div className="space-y-5">
      <PageTitle icon={MapIcon} subtitle="Rides you've published and trips you've booked.">
        My Trips
      </PageTitle>

      {/* Tabs */}
      <div className="glass flex flex-wrap gap-1.5 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setParams(t.key === 'offered' ? {} : { role: t.key })}
            className={[
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold',
              'transition-all duration-200 active:scale-95 sm:flex-none',
              role === t.key
                ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-glow ring-1 ring-white/25'
                : 'text-ink-600 hover:bg-white/70 hover:text-brand-dark',
            ].join(' ')}
          >
            <t.Icon className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Offered Rides tab ── */}
      {role === 'offered' && (
        <div className="space-y-3">
          {rides === null ? <Spinner /> : rides.length === 0 ? (
            <Empty
              icon={Car}
              title="No rides offered yet"
              hint="Use 'Offer a Ride' to publish a ride for colleagues to book."
            >
              <Link to="/app/offer"><Button>Offer a ride</Button></Link>
            </Empty>
          ) : (
            <>
              {cancelErr && <Alert variant="error">{cancelErr}</Alert>}

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg bg-brand/10 px-2.5 py-1 font-bold text-brand-dark ring-1 ring-brand/20">
                  {openCount} open
                </span>
                <span className="rounded-lg bg-ink-100/70 px-2.5 py-1 font-bold text-ink-500 ring-1 ring-ink-200/70">
                  {rides.length} total
                </span>
              </div>

              <Pagination {...ridePager} label="rides" />

              {ridePager.items.map((r) => (
                <Card key={r.ride_id} className="p-4" hover>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge status={r.status} />
                        <span className="text-xs text-ink-400">
                          {new Date(r.departure_datetime).toLocaleString()}
                        </span>
                        {r.is_recurring && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-brand/12 px-2 py-0.5 text-[11px] font-bold text-brand-dark ring-1 ring-brand/20">
                            <RefreshCw className="h-3 w-3" /> Recurring
                          </span>
                        )}
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
                        <span className="inline-flex items-center gap-1"><Car className="h-3 w-3" /> {r.vehicle_model} ({r.registration_number})</span>
                        <span className="inline-flex items-center gap-1"><Armchair className="h-3 w-3" /> {r.available_seats}/{r.total_seats} seats left</span>
                        {r.distance_km && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.distance_km} km</span>}
                        {r.duration_minutes && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~{r.duration_minutes} min</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-lg font-extrabold text-brand-dark">{money(r.fare_per_seat)}</div>
                      <div className="text-xs text-ink-400">per seat</div>
                      {r.status === 'OPEN' && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="mt-1"
                          onClick={() => cancelRide(r.ride_id)}
                          disabled={cancelling === r.ride_id}
                        >
                          {cancelling === r.ride_id ? 'Cancelling…' : 'Cancel ride'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Show bookings count if ride is FULL */}
                  {r.status === 'FULL' && (
                    <p className="mt-3 rounded-xl bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200/70">
                      Ride is full — all seats booked
                    </p>
                  )}
                </Card>
              ))}

              <Pagination {...ridePager} label="rides" />
            </>
          )}
        </div>
      )}

      {/* ── Trips (booked) tabs ── */}
      {role !== 'offered' && (
        <div className="space-y-3">
          {trips === null ? <Spinner /> : trips.length === 0 ? (
            <Empty icon={ClipboardList} title="No trips yet" hint="Book a ride to see it here.">
              <Link to="/app/find"><Button>Find a ride</Button></Link>
            </Empty>
          ) : (
            <>
              <Pagination {...tripPager} label="trips" />

              {tripPager.items.map((t) => {
                const iAmDriver = t.driver_employee_id === user.employeeId;
                return (
                  <Link key={t.trip_id} to={`/app/trips/${t.trip_id}`} className="block">
                    <Card className="p-4" hover>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge status={t.status} />
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500">
                              {iAmDriver ? <><Car className="h-3 w-3 text-brand" /> You drive</> : `Driver: ${t.driver_name}`}
                            </span>
                          </div>

                          {/* Route: pickup → destination in one line */}
                          <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden text-sm text-ink-600">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                            <span className="min-w-0 flex-1 truncate">{t.pickup_address}</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
                            <span className="min-w-0 flex-1 truncate">{t.destination_address}</span>
                          </div>

                          <p className="mt-2 text-xs text-ink-400">
                            {new Date(t.departure_datetime).toLocaleString()} ·{' '}
                            {iAmDriver ? `Passenger: ${t.passenger_name}` : t.vehicle_model}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-brand-dark">{money(t.fare_amount)}</div>
                          <div className="text-xs text-ink-400">{t.distance_km} km</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}

              <Pagination {...tripPager} label="trips" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
