import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, PlusCircle, History } from 'lucide-react';
import api, { apiError } from '../api.js';
import { Logo } from '../components/Brand.jsx';
import {
  Button, Card, Input, Empty, Alert, Spinner, PageTitle,
  Pagination, usePagination, money,
} from '../components/ui.jsx';

const PER_PAGE = 6;

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/wallet')
      .then(({ data }) => setWallet(data))
      .catch(() => setWallet({ balance: 0, transactions: [] }));

  useEffect(() => {
    load();
  }, []);

  const recharge = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) return setError('Please enter a valid amount');
    setBusy(true);
    try {
      await api.post('/wallet/recharge', { amount: +amount });
      setAmount('');
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const pager = usePagination(wallet?.transactions, PER_PAGE);

  if (!wallet) return <Spinner label="Loading wallet…" />;

  return (
    <div className="space-y-6">
      <PageTitle icon={WalletIcon} subtitle="Manage your balance and view transaction history.">
        Wallet
      </PageTitle>

      {/* Two-column layout grid on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Left Column: Balance & Recharge (takes 5/12) */}
        <div className="space-y-6 lg:col-span-5">

          {/* Card 1: Available Balance */}
          <Card variant="violet" className="relative overflow-hidden rounded-[20px] p-6">
            {/* Background design accents */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl" />
            <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10 blur-lg" />

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
                  <WalletIcon className="h-4 w-4" />
                  <span>Available Balance</span>
                </div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight">{money(wallet.balance)}</div>
              </div>
              <Logo size="md" className="bg-white/25 ring-white/30" />
            </div>

            <div className="mt-5 text-xs text-white/60">Verified &amp; secured by organization portal</div>
          </Card>

          {/* Card 2: Recharge form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 border-b border-white/60 pb-3">
              <PlusCircle className="h-4 w-4 text-brand" />
              <h2 className="font-bold text-ink-800">Recharge (Test Mode)</h2>
            </div>

            <form onSubmit={recharge} className="mt-4 space-y-4">
              <Input
                label="Amount (₹)"
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to add"
              />

              <div className="flex flex-wrap gap-2">
                {[100, 200, 500, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={[
                      'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95',
                      String(v) === amount
                        ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-glow ring-1 ring-white/25'
                        : 'glass-input text-ink-600 hover:text-brand-dark',
                    ].join(' ')}
                  >
                    +{v}
                  </button>
                ))}
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <Button type="submit" disabled={busy} size="lg" className="w-full">
                {busy ? 'Processing…' : 'Add money'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Transactions (takes 7/12) */}
        <div className="lg:col-span-7">

          {/* Card 3: Recent Transactions */}
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-brand" />
                <h2 className="font-bold text-ink-800">Transaction History</h2>
              </div>
              {pager.total > 0 && (
                <span className="rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand/20">
                  {pager.total}
                </span>
              )}
            </div>

            <div className="mt-4 flex-1">
              {pager.total === 0 ? (
                <Empty icon={History} title="No transactions yet" hint="Your financial logs will appear here." />
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-white/60">
                    {pager.items.map((t) => {
                      const isDebit = t.transaction_type === 'RIDE_PAYMENT';
                      return (
                        <div key={t.transaction_id} className="flex items-center justify-between py-3.5 first:pt-0">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${
                                isDebit
                                  ? 'bg-rose-50/80 text-rose-600 ring-rose-200/70'
                                  : 'bg-brand/10 text-brand ring-brand/20'
                              }`}
                            >
                              {isDebit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold capitalize text-ink-800">
                                {t.transaction_type.toLowerCase().replace(/_/g, ' ')}
                              </div>
                              <div className="text-[11px] text-ink-400">
                                {new Date(t.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className={`text-sm font-extrabold ${isDebit ? 'text-rose-600' : 'text-brand-dark'}`}>
                            {isDebit ? '-' : '+'}{money(t.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Pagination {...pager} label="transactions" compact />
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
