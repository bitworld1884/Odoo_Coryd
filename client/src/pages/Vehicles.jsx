import { useEffect, useState } from 'react';
import { Car, Plus, Trash2, Armchair, Fuel } from 'lucide-react';
import api, { apiError } from '../api.js';
import {
  Button, Card, Input, Select, Empty, Badge, Alert, Spinner, PageTitle,
  Pagination, usePagination,
} from '../components/ui.jsx';

const empty = { vehicleModel: '', registrationNumber: '', seatingCapacity: 4, fuelType: 'PETROL' };
const PER_PAGE = 6;

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/vehicles').then(({ data }) => setVehicles(data.vehicles)).catch(() => setVehicles([]));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await api.post('/vehicles', { ...form, seatingCapacity: +form.seatingCapacity });
      setForm(empty); load();
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm('Remove this vehicle?')) return;
    await api.delete(`/vehicles/${id}`); load();
  };

  const pager = usePagination(vehicles, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageTitle
        icon={Car}
        subtitle="Register the vehicles you drive so you can publish rides."
        actions={
          pager.total > 0 && (
            <span className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand-dark ring-1 ring-brand/20">
              {pager.total} registered
            </span>
          )
        }
      >
        My Vehicles
      </PageTitle>

      <Card className="p-5">
        <div className="flex items-center gap-2 border-b border-white/60 pb-3">
          <Plus className="h-4 w-4 text-brand" />
          <h2 className="font-bold text-ink-800">Add a vehicle</h2>
        </div>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Model" required value={form.vehicleModel} onChange={set('vehicleModel')} placeholder="e.g. Maruti Swift" />
          <Input label="Registration number" required value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="KA01AB1234" />
          <Input label="Seating capacity" type="number" min="1" max="8" value={form.seatingCapacity} onChange={set('seatingCapacity')} />
          <Select label="Fuel type" value={form.fuelType} onChange={set('fuelType')}>
            {['PETROL', 'DIESEL', 'CNG', 'EV', 'HYBRID'].map((f) => <option key={f}>{f}</option>)}
          </Select>
          {error && <div className="sm:col-span-2"><Alert variant="error">{error}</Alert></div>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>{busy ? 'Adding…' : <><Plus className="h-4 w-4" /> Add vehicle</>}</Button>
          </div>
        </form>
      </Card>

      {vehicles === null ? (
        <Spinner label="Loading vehicles…" />
      ) : pager.total === 0 ? (
        <Empty icon={Car} title="No vehicles yet" hint="Add one above to start offering rides." />
      ) : (
        <div className="space-y-3">
          <Pagination {...pager} label="vehicles" />

          <div className="grid gap-3 sm:grid-cols-2">
            {pager.items.map((v) => (
              <Card key={v.vehicle_id} className="flex items-center justify-between gap-3 p-4" hover>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                    <Car className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-bold text-ink-800">{v.vehicle_model}</span>
                      {v.is_verified ? <Badge status="COMPLETED">Verified</Badge> : <Badge status="PENDING">Unverified</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-ink-500">
                      <span className="font-mono font-semibold text-ink-600">{v.registration_number}</span>
                      <span className="inline-flex items-center gap-1"><Armchair className="h-3 w-3" /> {v.seating_capacity}</span>
                      <span className="inline-flex items-center gap-1"><Fuel className="h-3 w-3" /> {v.fuel_type}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(v.vehicle_id)} title="Remove vehicle">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          <Pagination {...pager} label="vehicles" />
        </div>
      )}
    </div>
  );
}
