// ui.jsx — Glassmorphic component system for CoRYD (purple + grey)

import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/* ── Button ─────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = [
    'relative inline-flex items-center justify-center gap-2',
    'rounded-xl font-semibold',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'active:scale-[0.97]',
    'disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none',
  ].join(' ');

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  };

  const variants = {
    primary:
      'bg-gradient-to-br from-brand to-brand-dark text-white shadow-glow ' +
      'hover:from-brand-mid hover:to-brand hover:shadow-[0_10px_28px_-4px_rgba(124,58,237,0.55)] ' +
      'focus-visible:ring-brand border border-white/20',
    outline:
      'glass-input text-ink-700 hover:bg-white/85 hover:border-brand-light ' +
      'hover:text-brand-dark focus-visible:ring-brand',
    ghost:
      'text-ink-500 hover:bg-white/60 hover:text-brand-dark focus-visible:ring-brand-light ' +
      'backdrop-blur-sm',
    danger:
      'bg-gradient-to-br from-rose-500 to-rose-600 text-white border border-white/20 ' +
      'shadow-[0_6px_20px_-4px_rgba(225,29,72,0.45)] hover:from-rose-400 hover:to-rose-500 ' +
      'focus-visible:ring-rose-400',
    subtle:
      'bg-brand/12 text-brand-dark border border-brand/20 backdrop-blur-sm ' +
      'hover:bg-brand/20 hover:border-brand/35 focus-visible:ring-brand',
  };

  return (
    <button
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Card ───────────────────────────────────────────────────
   variant:
     'glass'  → tuned frosted glass (default, best for content)
     'hero'   → full-strength .glass-card (heavy milky inset)
     'violet' → purple tinted glass for accent panels
   ───────────────────────────────────────────────────────── */
export function Card({ children, className = '', hover = false, variant = 'glass', as: Tag = 'div', ...props }) {
  const variants = {
    glass:  'glass',
    hero:   'glass-card',
    violet: 'glass-violet text-white',
  };
  const cls = [
    variants[variant] ?? variants.glass,
    hover ? 'glass-hover cursor-pointer' : '',
    className,
  ].filter(Boolean).join(' ');

  // Hero/violet variants use ::before/::after overlays — wrap children so they stack above.
  const needsBody = variant === 'hero' || variant === 'violet';

  return (
    <Tag className={cls} {...props}>
      {needsBody ? <div className="glass-body h-full">{children}</div> : children}
    </Tag>
  );
}

/* ── Section heading ────────────────────────────────────── */
export function PageTitle({ children, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-brand">
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{children}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Input ──────────────────────────────────────────────── */
export function Input({ label, className = '', error, hint, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-500">
          {label}
        </span>
      )}
      <input
        className={[
          'w-full rounded-xl px-3.5 py-2.5 text-sm text-ink-800',
          'placeholder:text-ink-400 outline-none transition-all duration-200',
          error ? 'border border-rose-300 bg-rose-50/70 focus:ring-2 focus:ring-rose-200' : 'glass-input',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </label>
  );
}

/* ── Select ─────────────────────────────────────────────── */
export function Select({ label, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-500">
          {label}
        </span>
      )}
      <select
        className={[
          'glass-input w-full cursor-pointer rounded-xl px-3.5 py-2.5',
          'text-sm text-ink-800 outline-none transition-all duration-200',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

/* ── Badge ──────────────────────────────────────────────── */
const badgeMap = {
  OPEN:            'bg-violet-100/80 text-violet-700 ring-violet-300/60',
  FULL:            'bg-amber-100/80  text-amber-700  ring-amber-300/60',
  BOOKED:          'bg-indigo-100/80 text-indigo-700 ring-indigo-300/60',
  STARTED:         'bg-fuchsia-100/80 text-fuchsia-700 ring-fuchsia-300/60',
  IN_PROGRESS:     'bg-purple-100/80 text-purple-700 ring-purple-300/60',
  COMPLETED:       'bg-emerald-100/80 text-emerald-700 ring-emerald-300/60',
  CANCELLED:       'bg-rose-100/80   text-rose-700   ring-rose-300/60',
  PENDING:         'bg-amber-100/80  text-amber-700  ring-amber-300/60',
  PAYMENT_PENDING: 'bg-orange-100/80 text-orange-700 ring-orange-300/60',
  ACTIVE:          'bg-violet-100/80 text-violet-700 ring-violet-300/60',
  INACTIVE:        'bg-ink-100/80    text-ink-500    ring-ink-300/60',
  SUSPENDED:       'bg-rose-100/80   text-rose-700   ring-rose-300/60',
};

export function Badge({ status, children, className = '' }) {
  const cls = badgeMap[status] ?? 'bg-ink-100/80 text-ink-600 ring-ink-300/60';
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 backdrop-blur-sm ${cls} ${className}`}
    >
      {children ?? status}
    </span>
  );
}

/* ── Spinner ────────────────────────────────────────────── */
export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-12 text-ink-400 ${className}`}>
      <span className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[3px] border-brand/15" />
        <svg className="h-10 w-10 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────── */
export function Empty({ title, hint, icon: Icon, children }) {
  return (
    <div className="glass flex flex-col items-center px-6 py-14 text-center">
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/15">
          <Icon className="h-7 w-7 text-brand" strokeWidth={1.5} />
        </div>
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/15">
          <span className="h-2.5 w-2.5 rounded-full bg-brand/50" />
        </div>
      )}
      <p className="text-sm font-bold text-ink-700">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-ink-400">{hint}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/* ── Alert ──────────────────────────────────────────────── */
const alertStyles = {
  error:   { wrap: 'bg-rose-50/80    border-rose-200/80    text-rose-700',    icon: 'text-rose-500',    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  warning: { wrap: 'bg-amber-50/80   border-amber-200/80   text-amber-700',   icon: 'text-amber-500',   d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  info:    { wrap: 'bg-violet-50/80  border-violet-200/80  text-violet-700',  icon: 'text-violet-500',  d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z' },
  success: { wrap: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-700', icon: 'text-emerald-500', d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export function Alert({ variant = 'error', children }) {
  const s = alertStyles[variant] ?? alertStyles.error;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm ${s.wrap}`}>
      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={s.d} />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGINATION
   ══════════════════════════════════════════════════════════ */

/**
 * usePagination — slices any array into pages.
 *
 *   const p = usePagination(rides, 6);
 *   p.items          → rows for the current page
 *   <Pagination {...p} />
 *
 * Automatically clamps the page when the underlying list shrinks
 * (e.g. after a delete) and resets when `resetKey` changes.
 */
export function usePagination(list, perPage = 6, resetKey) {
  const [page, setPage] = useState(1);
  const safeList = Array.isArray(list) ? list : [];
  const total = safeList.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Reset to page 1 when the data set identity changes (tab switch, new search…)
  useEffect(() => { setPage(1); }, [resetKey, perPage]);

  // Clamp if the list shrank beneath the current page
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const items = useMemo(
    () => safeList.slice(start, start + perPage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list, start, perPage]
  );

  return {
    items,
    page: currentPage,
    setPage,
    totalPages,
    total,
    perPage,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + perPage, total),
    isPaginated: total > perPage,
  };
}

/** Build a compact page list: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const out = [1];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  if (left > 2) out.push('…');
  for (let i = left; i <= right; i++) out.push(i);
  if (right < totalPages - 1) out.push('…');
  out.push(totalPages);

  return out;
}

/**
 * Pagination — glass pager bar.
 * Spread a usePagination() result straight into it.
 */
export function Pagination({
  page,
  setPage,
  totalPages,
  total,
  from,
  to,
  isPaginated,
  label = 'items',
  className = '',
  compact = false,
  always = false,
}) {
  if (!always && !isPaginated) return null;

  const go = (n) => setPage(Math.min(Math.max(1, n), totalPages));
  const pages = pageWindow(page, totalPages);

  const navBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-all duration-150 ' +
    'hover:bg-brand/12 hover:text-brand-dark active:scale-90 ' +
    'disabled:opacity-35 disabled:pointer-events-none';

  return (
    <nav
      aria-label="Pagination"
      className={`glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 ${className}`}
    >
      <p className="text-xs font-medium text-ink-500">
        Showing <span className="font-bold text-brand-dark">{from}–{to}</span> of{' '}
        <span className="font-bold text-ink-700">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1">
        {!compact && (
          <button className={navBtn} onClick={() => go(1)} disabled={page === 1} aria-label="First page" title="First page">
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
        <button className={navBtn} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" title="Previous">
          <ChevronLeft className="h-4 w-4" />
        </button>

        {compact ? (
          <span className="px-2.5 text-xs font-bold text-ink-600">
            {page} <span className="font-medium text-ink-400">/ {totalPages}</span>
          </span>
        ) : (
          <div className="mx-1 flex items-center gap-1">
            {pages.map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-xs text-ink-400 select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => go(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={[
                    'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-bold',
                    'transition-all duration-150 active:scale-90',
                    p === page
                      ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-glow border border-white/25'
                      : 'text-ink-500 hover:bg-brand/12 hover:text-brand-dark',
                  ].join(' ')}
                >
                  {p}
                </button>
              )
            )}
          </div>
        )}

        <button className={navBtn} onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Next page" title="Next">
          <ChevronRight className="h-4 w-4" />
        </button>
        {!compact && (
          <button className={navBtn} onClick={() => go(totalPages)} disabled={page === totalPages} aria-label="Last page" title="Last page">
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  );
}

/* ── money formatter ────────────────────────────────────── */
export function money(n) {
  const v = Number(n || 0);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
