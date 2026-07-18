import { useEffect, useState } from 'react';
import { MapPin, Bookmark, Trash2, Plus } from 'lucide-react';
import api, { apiError } from '../api.js';
import AddressInput from '../components/AddressInput.jsx';
import {
  Button, Card, Input, Empty, Alert, Spinner, PageTitle,
  Pagination, usePagination,
} from '../components/ui.jsx';

const PER_PAGE = 6;

export default function SavedPlaces() {
  const [places, setPlaces] = useState(null);
  const [label, setLabel] = useState('');
  const [picked, setPicked] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/saved-places').then(({ data }) => setPlaces(data.places)).catch(() => setPlaces([]));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault(); setError('');
    if (!label || !picked) return setError('Enter a label and pick an address');
    setBusy(true);
    try {
      await api.post('/saved-places', { label, addressText: picked.address, latitude: picked.lat, longitude: picked.lng });
      setLabel(''); setPicked(null); load();
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  const remove = async (id) => { await api.delete(`/saved-places/${id}`); load(); };

  const pager = usePagination(places, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageTitle
        icon={Bookmark}
        subtitle="Save frequent addresses for one-tap pickup and drop-off."
        actions={
          pager.total > 0 && (
            <span className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand-dark ring-1 ring-brand/20">
              {pager.total} saved
            </span>
          )
        }
      >
        Saved Places
      </PageTitle>

      <Card className="p-5">
        <div className="flex items-center gap-2 border-b border-white/60 pb-3">
          <Plus className="h-4 w-4 text-brand" />
          <h2 className="font-bold text-ink-800">Add a place</h2>
        </div>
        <form onSubmit={add} className="mt-4 space-y-4">
          <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home, Office…" />
          <AddressInput label="Address" value={picked?.address} onSelect={setPicked} placeholder="Search address…" />
          {error && <Alert variant="error">{error}</Alert>}
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : <><Plus className="h-4 w-4" /> Save place</>}</Button>
        </form>
      </Card>

      {places === null ? (
        <Spinner label="Loading saved places…" />
      ) : pager.total === 0 ? (
        <Empty icon={Bookmark} title="No saved places yet" hint="Add your home or office above to speed up booking." />
      ) : (
        <div className="space-y-3">
          <Pagination {...pager} label="places" />

          <div className="grid gap-3 sm:grid-cols-2">
            {pager.items.map((p) => (
              <Card key={p.place_id} className="flex items-center justify-between gap-3 p-4" hover>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                    <MapPin className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink-800">{p.label}</div>
                    <div className="truncate text-sm text-ink-500">{p.address_text}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(p.place_id)} title="Remove place">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          <Pagination {...pager} label="places" />
        </div>
      )}
    </div>
  );
}
