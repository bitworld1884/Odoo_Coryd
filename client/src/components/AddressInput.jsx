import { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import api from '../api.js';

/**
 * Address autocomplete backed by the server's Nominatim proxy.
 * onSelect({ address, lat, lng })
 *
 * Features:
 * - Debounced search (350ms)
 * - "📍 Use my location" button (reverse geocodes GPS coords)
 * - Keyboard navigation (↑↓ Enter Escape)
 * - Click-outside to close
 */
export default function AddressInput({ label, value, onSelect, placeholder, showMyLocation = true }) {
  const [q, setQ]           = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen]      = useState(false);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const timer  = useRef(null);
  const box    = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setQ(value || ''); }, [value]);

  /* Close on outside click */
  useEffect(() => {
    const onDoc = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  /* Search with debounce */
  const search = (text) => {
    clearTimeout(timer.current);
    setHighlighted(-1);
    if (!text || text.length < 3) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/geo/search', { params: { q: text } });
        const r = data.results || [];
        setResults(r);
        setOpen(r.length > 0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  };

  const pick = (r) => {
    setQ(r.label);
    setOpen(false);
    setResults([]);
    onSelect?.({ address: r.label, lat: r.lat, lng: r.lng });
  };

  /* Use browser GPS then reverse geocode */
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const { data } = await api.get('/geo/reverse', { params: { lat, lng } });
          const label = data.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQ(label);
          onSelect?.({ address: label, lat, lng });
        } catch {
          const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQ(label);
          onSelect?.({ address: label, lat, lng });
        } finally {
          setLocLoading(false);
          setOpen(false);
        }
      },
      () => setLocLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /* Keyboard nav */
  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      pick(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const allItems = showMyLocation
    ? [{ _myLoc: true }, ...results]
    : results;

  return (
    <div className="relative" ref={box}>
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-500">{label}</span>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={q}
          placeholder={placeholder || 'Search address…'}
          onChange={(e) => { setQ(e.target.value); search(e.target.value); }}
          onFocus={() => (results.length > 0 || showMyLocation) && setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="glass-input w-full rounded-xl px-3.5 py-2.5 pr-9 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-all duration-200"
        />

        {/* Spinner or clear button on right */}
        {loading || locLoading ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        ) : q ? (
          <button
            type="button"
            onClick={() => { setQ(''); setResults([]); setOpen(false); onSelect?.(null); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-brand"
            tabIndex={-1}
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="glass-panel absolute z-50 mt-2 max-h-72 w-full animate-riseIn overflow-auto rounded-2xl">

          {/* "Use my location" row */}
          {showMyLocation && (
            <li
              onClick={useMyLocation}
              className="flex cursor-pointer items-center gap-2.5 border-b border-white/60 px-3 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-brand/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/20">
                <MapPin className="h-4 w-4" />
              </span>
              {locLoading ? 'Detecting location…' : 'Use my current location'}
            </li>
          )}

          {/* Search results */}
          {results.length === 0 && !loading && (
            <li className="px-3 py-3.5 text-center text-xs text-ink-400">
              {q.length >= 3 ? 'No results found' : 'Type at least 3 characters'}
            </li>
          )}

          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => pick(r)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm transition-colors ${
                highlighted === i ? 'bg-brand/12 font-semibold text-brand-dark' : 'text-ink-700 hover:bg-white/60'
              }`}
            >
              <MapPin className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${highlighted === i ? 'text-brand' : 'text-ink-400'}`} />
              <span className="min-w-0 leading-snug">{r.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
