import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, CircleCheck, XCircle } from 'lucide-react';
import api from '../api.js';
import { Button } from './ui.jsx';

/**
 * RazorpayQR
 * Shows a full-screen modal with a UPI QR code that the passenger can
 * share with the driver (or scan themselves on another device).
 * Polls every 4 seconds; auto-closes and calls onSuccess when paid.
 *
 * Props:
 *  tripId      string
 *  amount      number|string  — display ₹ amount
 *  onSuccess   fn(payment)
 *  onClose     fn()
 */
export default function RazorpayQR({ tripId, amount, onSuccess, onClose }) {
  const [phase, setPhase]     = useState('loading');  // loading | ready | paid | error
  const [qrData, setQrData]   = useState(null);
  const [errMsg, setErrMsg]   = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const pollRef   = useRef(null);
  const timerRef  = useRef(null);

  /* ── Generate QR on mount ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post('/payments/razorpay/qr', { tripId });
        if (cancelled) return;
        setQrData(data);
        setPhase('ready');
        startPolling(data.qrId);
        startCountdown(data.expiresAt);
      } catch (e) {
        if (!cancelled) {
          setErrMsg(e?.response?.data?.error || 'Failed to generate QR code');
          setPhase('error');
        }
      }
    })();
    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [tripId]);

  /* ── Poll payment status every 4 s ── */
  function startPolling(qrId) {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(
          `/payments/razorpay/qr/${qrId}/status?tripId=${tripId}`
        );
        if (data.paid) {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setPhase('paid');
          setTimeout(() => onSuccess?.(data.payment), 1500);
        }
      } catch {}
    }, 4000);
  }

  /* ── Countdown timer ── */
  function startCountdown(expiresAt) {
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const secs = Math.max(0, Math.round((end - Date.now()) / 1000));
      setTimeLeft(secs);
      if (secs === 0) {
        clearInterval(timerRef.current);
        clearInterval(pollRef.current);
        setPhase('error');
        setErrMsg('QR code expired. Please generate a new one.');
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }

  const fmtTime = (secs) => {
    if (secs === null) return '';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ── UPI deep-link fallback (for mobile "open UPI app") ── */
  const upiLink = qrData
    ? `upi://pay?pa=&pn=CoRYD&am=${amount}&cu=INR&tn=CoRYD+Trip+Payment`
    : null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-deep/50 p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="glass-panel relative w-full max-w-sm animate-riseIn rounded-3xl p-6">

        {/* Close button */}
          <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-ink-400 transition hover:bg-white/70 hover:text-brand"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mb-1 flex justify-center text-brand"><Smartphone className="h-8 w-8" /></div>
          <h2 className="text-lg font-extrabold text-ink-900">Scan to Pay</h2>
          <p className="text-sm text-ink-500">
            Use any UPI app — GPay, PhonePe, Paytm, BHIM
          </p>
        </div>

        {/* ── Loading ── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <svg className="h-10 w-10 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-sm text-ink-500">Generating QR code…</p>
          </div>
        )}

        {/* ── Ready — show QR ── */}
        {phase === 'ready' && qrData && (
          <>
            {/* Amount badge */}
            <div className="mb-4 rounded-2xl bg-brand/10 px-4 py-3 text-center ring-1 ring-brand/20">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Amount to pay</p>
              <p className="text-3xl font-extrabold text-brand-dark">₹{Number(amount).toFixed(2)}</p>
            </div>

            {/* QR image from Razorpay (preferred) or fallback SVG */}
            <div className="flex justify-center mb-4">
              {qrData.imageUrl ? (
                <div className="rounded-2xl border-4 border-brand/15 bg-white/80 p-2 shadow-inner">
                  <img
                    src={qrData.imageUrl}
                    alt="Razorpay UPI QR Code"
                    className="h-52 w-52 rounded-xl object-contain"
                  />
                </div>
              ) : (
                /* Fallback: generate QR locally from UPI link */
                <div className="rounded-2xl border-4 border-brand/15 bg-white p-3 shadow-inner">
                  <QRCodeSVG
                    value={upiLink}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#5b21b6"
                    level="H"
                    includeMargin={false}
                  />
                </div>
              )}
            </div>

            {/* Countdown */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
              <span className="text-sm text-ink-500">
                Waiting for payment · expires in{' '}
                <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-rose-500' : 'text-ink-700'}`}>
                  {fmtTime(timeLeft)}
                </span>
              </span>
            </div>

            {/* Mobile UPI deep link */}
            <a
              href={upiLink}
              className="mb-2 block w-full rounded-xl border border-white/20 bg-gradient-to-br from-brand to-brand-dark py-3 text-center text-sm font-bold text-white shadow-glow transition hover:from-brand-mid hover:to-brand active:scale-95"
            >
              <Smartphone className="h-4 w-4" /> Open UPI App directly
            </a>
            <p className="text-center text-xs text-ink-400">
              QR refreshes automatically once paid
            </p>
          </>
        )}

        {/* ── Paid ── */}
        {phase === 'paid' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
              <CircleCheck className="h-12 w-12 text-emerald-500" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-extrabold text-emerald-700">Payment received!</p>
            <p className="text-sm text-ink-500">
              ₹{Number(amount).toFixed(2)} paid successfully via Razorpay
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <XCircle className="h-9 w-9 text-rose-500" strokeWidth={1.5} />
            </div>
            <p className="text-center text-sm text-rose-600 font-medium">{errMsg}</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
