import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../../data/products';
import type { AppConfig } from '../../context/ConfigContext';

const PRODUCT_MAP: Record<string, string> = Object.fromEntries(
  getAllProducts().map((p) => [p.id, p.title])
);

const ALL_PRODUCT_IDS = getAllProducts().map((p) => p.id);

const RESULT_TYPE_LABELS: Record<string, string> = {
  panic_cycle: 'Панічний цикл',
  body_hyperfocus: 'Тілесна гіперфіксація',
  fear_of_recurrence: 'Страх повторення',
  background_tension: 'Фонова напруга',
  combined_type: 'Змішана тривога',
};

interface Order {
  id: string;
  order_id: string;
  email: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  liqpay_status: string | null;
  created_at: string;
}

interface Stats {
  totalRevenue: number;
  monthRevenue: number;
  statusCounts: Record<string, number>;
  revenueByProduct: Record<string, { count: number; revenue: number }>;
  eventCounts: Record<string, number>;
}

function makeAuthHeader(password: string) {
  return 'Basic ' + btoa('admin:' + password);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const labels: Record<string, string> = {
    success: 'Оплачено',
    pending: 'Очікування',
    failed: 'Помилка',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: makeAuthHeader(password) },
      });
      if (res.ok) {
        sessionStorage.setItem('admin_pw', password);
        onLogin(password);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[#f5a623] text-sm font-semibold uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-2xl font-black text-white">тривога.net</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-white/50 text-sm block mb-2">Пароль</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center">Невірний пароль</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Перевірка...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab({ stats }: { stats: Stats }) {
  const topEvents = Object.entries(stats.eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const revenueRows = Object.entries(stats.revenueByProduct)
    .sort((a, b) => b[1].revenue - a[1].revenue);

  const successCount = stats.statusCounts.success ?? 0;
  const pendingCount = stats.statusCounts.pending ?? 0;
  const failedCount = stats.statusCounts.failed ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Загальна виручка" value={`${stats.totalRevenue.toLocaleString('uk-UA')} грн`} accent />
        <StatCard label="Цього місяця" value={`${stats.monthRevenue.toLocaleString('uk-UA')} грн`} />
        <StatCard label="Оплачено" value={String(successCount)} />
        <StatCard label="Очікування / Помилки" value={`${pendingCount} / ${failedCount}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Виручка по продуктах</h3>
          {revenueRows.length === 0 ? (
            <p className="text-white/30 text-sm">Немає даних</p>
          ) : (
            <div className="flex flex-col gap-3">
              {revenueRows.map(([productId, { count, revenue }]) => (
                <div key={productId} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {PRODUCT_MAP[productId] ?? productId}
                    </p>
                    <p className="text-white/40 text-xs">{count} покупок</p>
                  </div>
                  <span className="text-[#f5a623] font-bold text-sm shrink-0">
                    {revenue.toLocaleString('uk-UA')} грн
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Топ події</h3>
          {topEvents.length === 0 ? (
            <p className="text-white/30 text-sm">Немає даних</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topEvents.map(([eventType, count]) => (
                <div key={eventType} className="flex items-center justify-between gap-3">
                  <span className="text-white/70 text-sm font-mono truncate">{eventType}</span>
                  <span className="text-white/40 text-sm shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent ? 'text-[#f5a623]' : 'text-white'}`}>{value}</p>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────

function OrdersTab({ password }: { password: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [emailSearch, setEmailSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('success');
  const [productFilter, setProductFilter] = useState('');

  const [emailQuery, setEmailQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setEmailQuery(emailSearch);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [emailSearch]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set('status', statusFilter);
    if (emailQuery) params.set('email', emailQuery);
    if (productFilter) params.set('product_id', productFilter);

    try {
      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: makeAuthHeader(password) },
      });
      const data = await res.json() as { orders: Order[]; total: number };
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [password, page, statusFilter, emailQuery, productFilter]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Пошук по email..."
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors"
        >
          <option value="success">Оплачено</option>
          <option value="pending">Очікування</option>
          <option value="failed">Помилка</option>
          <option value="all">Всі</option>
        </select>
        <select
          value={productFilter}
          onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors"
        >
          <option value="">Всі продукти</option>
          {ALL_PRODUCT_IDS.map((id) => (
            <option key={id} value={id}>{PRODUCT_MAP[id] ?? id}</option>
          ))}
        </select>
        <span className="ml-auto text-white/30 text-sm self-center">
          {total} замовлень
        </span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-16">Замовлень не знайдено</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-medium px-5 py-3">Дата</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Email</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Продукт</th>
                  <th className="text-right text-white/40 font-medium px-5 py-3">Сума</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === orders.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-white/50 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-white max-w-[200px] truncate">
                      {order.email}
                    </td>
                    <td className="px-5 py-3.5 text-white/70 whitespace-nowrap">
                      {PRODUCT_MAP[order.product_id] ?? order.product_id}
                    </td>
                    <td className="px-5 py-3.5 text-[#f5a623] font-semibold text-right whitespace-nowrap">
                      {order.amount} грн
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            ← Назад
          </button>
          <span className="text-white/40 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Далі →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────

type ProductRow = AppConfig['products'][string] & { id: string; text_content: string | null };

function ProductsTab({ password, config }: { password: string; config: AppConfig | null }) {
  const allProducts = getAllProducts();

  const [rows, setRows] = useState<ProductRow[]>(() =>
    allProducts.map((p) => ({
      id: p.id,
      price: config?.products[p.id]?.price ?? (p.price ?? 0),
      is_enabled: config?.products[p.id]?.is_enabled ?? true,
      audio_url: config?.products[p.id]?.audio_url ?? null,
      video_url: config?.products[p.id]?.video_url ?? null,
      text_content: config?.products[p.id]?.text_content ?? null,
    }))
  );

  useEffect(() => {
    if (!config) return;
    setRows(
      allProducts.map((p) => ({
        id: p.id,
        price: config.products[p.id]?.price ?? (p.price ?? 0),
        is_enabled: config.products[p.id]?.is_enabled ?? true,
        audio_url: config.products[p.id]?.audio_url ?? null,
        video_url: config.products[p.id]?.video_url ?? null,
        text_content: config.products[p.id]?.text_content ?? null,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function updateRow(id: string, patch: Partial<ProductRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setSaving(id);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
        body: JSON.stringify({
          table: 'products',
          id,
          updates: {
            price: Number(row.price),
            is_enabled: row.is_enabled,
            audio_url: row.audio_url || null,
            video_url: row.video_url || null,
            text_content: row.text_content || null,
          },
        }),
      });
      if (res.ok) {
        setSaved(id);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  }

  const inputCls = 'bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors';

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        const productTitle = PRODUCT_MAP[row.id] ?? row.id;
        const isDisabled = !row.is_enabled;
        return (
          <div
            key={row.id}
            className={`bg-white/5 border rounded-2xl p-5 flex flex-col gap-4 ${isDisabled ? 'border-white/5 opacity-60' : 'border-white/10'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">{productTitle}</p>
                <p className="text-white/30 text-xs font-mono">{row.id}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-white/50 text-sm">Увімкнено</span>
                <input
                  type="checkbox"
                  checked={row.is_enabled}
                  onChange={(e) => updateRow(row.id, { is_enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#f5a623]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs block mb-1">Ціна (грн)</label>
                <input
                  type="number"
                  min={0}
                  value={row.price}
                  onChange={(e) => updateRow(row.id, { price: Number(e.target.value) })}
                  className={`${inputCls} w-full`}
                />
              </div>
              <div>
                <label className="text-white/40 text-xs block mb-1">Audio URL</label>
                <input
                  type="url"
                  value={row.audio_url ?? ''}
                  onChange={(e) => updateRow(row.id, { audio_url: e.target.value || null })}
                  placeholder="https://..."
                  className={`${inputCls} w-full`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-white/40 text-xs block mb-1">Video URL (YouTube)</label>
                <input
                  type="url"
                  value={row.video_url ?? ''}
                  onChange={(e) => updateRow(row.id, { video_url: e.target.value || null })}
                  placeholder="https://youtube.com/..."
                  className={`${inputCls} w-full`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-white/40 text-xs block mb-1">Текстовий контент</label>
                <textarea
                  value={row.text_content ?? ''}
                  onChange={(e) => updateRow(row.id, { text_content: e.target.value || null })}
                  placeholder="Текст, який побачить користувач після покупки..."
                  rows={5}
                  className={`${inputCls} w-full resize-none`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => void saveRow(row.id)}
                disabled={saving === row.id}
                className="px-5 py-2 rounded-xl bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
              >
                {saving === row.id ? 'Збереження...' : saved === row.id ? 'Збережено ✓' : 'Зберегти'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Landing Tab ───────────────────────────────────────────────────────────────

function LandingTab({ password, config }: { password: string; config: AppConfig | null }) {
  const [form, setForm] = useState({
    hero_title: config?.site.hero_title ?? 'Накриває?',
    hero_subtitle: config?.site.hero_subtitle ?? 'Зараз перевіримо, що це.',
    trust_text: config?.site.trust_text ?? '',
  });

  useEffect(() => {
    if (!config) return;
    setForm({
      hero_title: config.site.hero_title,
      hero_subtitle: config.site.hero_subtitle,
      trust_text: config.site.trust_text,
    });
  }, [config]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
        body: JSON.stringify({ table: 'site', id: 'site', updates: form }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 max-w-2xl">
      <h3 className="text-white font-semibold">Тексти лендингу</h3>

      <div>
        <label className="text-white/40 text-xs block mb-1">Заголовок Hero</label>
        <input
          type="text"
          value={form.hero_title}
          onChange={(e) => setForm((f) => ({ ...f, hero_title: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-white/40 text-xs block mb-1">Підзаголовок Hero</label>
        <input
          type="text"
          value={form.hero_subtitle}
          onChange={(e) => setForm((f) => ({ ...f, hero_subtitle: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-white/40 text-xs block mb-1">Текст Trust (відмова відповідальності)</label>
        <textarea
          value={form.trust_text}
          onChange={(e) => setForm((f) => ({ ...f, trust_text: e.target.value }))}
          rows={4}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
        >
          {saving ? 'Збереження...' : saved ? 'Збережено ✓' : 'Зберегти'}
        </button>
      </div>
    </div>
  );
}

// ── Results Tab ───────────────────────────────────────────────────────────────

const RESULT_TYPE_IDS = Object.keys(RESULT_TYPE_LABELS);

type ResultForm = AppConfig['results'][string];

const EMPTY_RESULT_FORM: ResultForm = {
  title: '',
  preview_phrase_1: '',
  preview_phrase_2: '',
  full_description: '',
  recommendation: '',
};

function ResultsTab({ password, config }: { password: string; config: AppConfig | null }) {
  const [typeId, setTypeId] = useState(RESULT_TYPE_IDS[0]);
  const [form, setForm] = useState<ResultForm>(EMPTY_RESULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!config) return;
    setForm(config.results[typeId] ?? EMPTY_RESULT_FORM);
  }, [config, typeId]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
        body: JSON.stringify({ table: 'results', id: typeId, updates: form }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors';

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <label className="text-white/40 text-xs block mb-1">Тип результату</label>
        <select
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors"
        >
          {RESULT_TYPE_IDS.map((id) => (
            <option key={id} value={id}>{RESULT_TYPE_LABELS[id]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <label className="text-white/40 text-xs block mb-1">Заголовок</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Фраза попереднього перегляду 1</label>
          <input
            type="text"
            value={form.preview_phrase_1}
            onChange={(e) => setForm((f) => ({ ...f, preview_phrase_1: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Фраза попереднього перегляду 2</label>
          <input
            type="text"
            value={form.preview_phrase_2}
            onChange={(e) => setForm((f) => ({ ...f, preview_phrase_2: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Повний опис</label>
          <textarea
            value={form.full_description}
            onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
            rows={4}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Рекомендація</label>
          <textarea
            value={form.recommendation}
            onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
          >
            {saving ? 'Збереження...' : saved ? 'Збережено ✓' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'stats' | 'orders' | 'products' | 'landing' | 'results';

export function AdminPage() {
  const [password, setPassword] = useState<string | null>(
    () => sessionStorage.getItem('admin_pw')
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [statsError, setStatsError] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    if (!password) return;

    fetch('/api/admin/stats', { headers: { Authorization: makeAuthHeader(password) } })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem('admin_pw');
          setPassword(null);
          return null;
        }
        return r.json() as Promise<Stats>;
      })
      .then((data) => { if (data) setStats(data); })
      .catch(() => setStatsError(true));

    fetch('/api/admin/config', { headers: { Authorization: makeAuthHeader(password) } })
      .then((r) => r.json())
      .then((data: AppConfig) => setConfig(data))
      .catch(() => { /* ignore */ });
  }, [password]);

  function handleLogin(pw: string) {
    setPassword(pw);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_pw');
    setPassword(null);
    setStats(null);
    setConfig(null);
  }

  if (!password) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const TABS: [Tab, string][] = [
    ['stats', 'Огляд'],
    ['orders', 'Замовлення'],
    ['products', 'Продукти'],
    ['landing', 'Лендинг'],
    ['results', 'Результати'],
  ];

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="border-b border-white/10 bg-[#0d0d1a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#f5a623] font-black text-lg">тривога.net</span>
            <span className="text-white/20 text-sm">/ адмін</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 flex-wrap">
              {TABS.map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Вийти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'stats' && (
          statsError ? (
            <p className="text-red-400 text-center py-16">Помилка завантаження статистики</p>
          ) : !stats ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <StatsTab stats={stats} />
          )
        )}
        {activeTab === 'orders' && <OrdersTab password={password} />}
        {activeTab === 'products' && <ProductsTab password={password} config={config} />}
        {activeTab === 'landing' && <LandingTab password={password} config={config} />}
        {activeTab === 'results' && <ResultsTab password={password} config={config} />}
      </div>
    </div>
  );
}
