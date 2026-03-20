import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllProducts } from '../../data/products';

const PRODUCT_MAP: Record<string, string> = Object.fromEntries(
  getAllProducts().map((p) => [p.id, p.title])
);

const ALL_PRODUCT_IDS = getAllProducts().map((p) => p.id);

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
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Загальна виручка" value={`${stats.totalRevenue.toLocaleString('uk-UA')} грн`} accent />
        <StatCard label="Цього місяця" value={`${stats.monthRevenue.toLocaleString('uk-UA')} грн`} />
        <StatCard label="Оплачено" value={String(successCount)} />
        <StatCard label="Очікування / Помилки" value={`${pendingCount} / ${failedCount}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by product */}
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

        {/* Top events */}
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

  // Debounced email search
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
      {/* Filters */}
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

      {/* Table */}
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

      {/* Pagination */}
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

// ── Course Tab ────────────────────────────────────────────────────────────────

interface CourseBlock {
  id: string;
  product_id: string;
  order_index: number;
  title: string;
  description: string | null;
  video_url: string | null;
  text_content: string | null;
}

const EMPTY_FORM = { title: '', description: '', video_url: '', text_content: '' };

function CourseTab({ password }: { password: string }) {
  const [productId, setProductId] = useState('course');
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/course?product_id=${encodeURIComponent(productId)}`, {
        headers: { Authorization: makeAuthHeader(password) },
      });
      const data = await res.json() as { blocks: CourseBlock[] };
      setBlocks(data.blocks ?? []);
    } finally {
      setLoading(false);
    }
  }, [password, productId]);

  useEffect(() => { void fetchBlocks(); }, [fetchBlocks]);

  function startEdit(block: CourseBlock) {
    setEditingId(block.id);
    setForm({
      title: block.title,
      description: block.description ?? '',
      video_url: block.video_url ?? '',
      text_content: block.text_content ?? '',
    });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  function startAdd() {
    setEditingId('new');
    setForm(EMPTY_FORM);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId === 'new') {
        await fetch('/api/admin/course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
          body: JSON.stringify({ product_id: productId, ...form }),
        });
      } else {
        await fetch(`/api/admin/course?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
          body: JSON.stringify(form),
        });
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      await fetchBlocks();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Видалити цей блок?')) return;
    await fetch(`/api/admin/course?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: makeAuthHeader(password) },
    });
    await fetchBlocks();
  }

  async function handleMove(block: CourseBlock, direction: 'up' | 'down') {
    const index = blocks.findIndex((b) => b.id === block.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= blocks.length) return;
    const swap = blocks[swapIndex];
    await Promise.all([
      fetch(`/api/admin/course?id=${block.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
        body: JSON.stringify({ order_index: swap.order_index }),
      }),
      fetch(`/api/admin/course?id=${swap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: makeAuthHeader(password) },
        body: JSON.stringify({ order_index: block.order_index }),
      }),
    ]);
    await fetchBlocks();
  }

  const inputCls = 'w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors';

  return (
    <div className="flex flex-col gap-5">
      {/* Product selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={productId}
          onChange={(e) => { setProductId(e.target.value); setEditingId(null); }}
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f5a623]/50 transition-colors"
        >
          {getAllProducts().map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <span className="text-white/30 text-sm">{blocks.length} блоків</span>
        <button
          onClick={startAdd}
          className="ml-auto bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Додати блок
        </button>
      </div>

      {/* Block list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : blocks.length === 0 && editingId !== 'new' ? (
        <p className="text-white/30 text-sm text-center py-10">Блоків ще немає. Натисніть "+ Додати блок"</p>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block, index) => (
            <div key={block.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Block header */}
              <div className="flex items-start gap-3 p-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#f5a623]/15 text-[#f5a623] text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium leading-snug">{block.title}</p>
                  {block.video_url && (
                    <p className="text-white/30 text-xs mt-0.5 truncate">📹 {block.video_url}</p>
                  )}
                  {block.text_content && (
                    <p className="text-white/30 text-xs mt-0.5 truncate">📝 {block.text_content.slice(0, 60)}…</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(block, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 disabled:opacity-20 transition-colors"
                    title="Вгору"
                  >↑</button>
                  <button
                    onClick={() => handleMove(block, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 disabled:opacity-20 transition-colors"
                    title="Вниз"
                  >↓</button>
                  <button
                    onClick={() => editingId === block.id ? cancelEdit() : startEdit(block)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                  >
                    {editingId === block.id ? 'Скасувати' : 'Редагувати'}
                  </button>
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                  >
                    Видалити
                  </button>
                </div>
              </div>

              {/* Inline edit form */}
              {editingId === block.id && (
                <div ref={formRef} className="border-t border-white/10 p-4 flex flex-col gap-3 bg-white/3">
                  <BlockForm form={form} setForm={setForm} inputCls={inputCls} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/70 text-sm transition-colors">
                      Скасувати
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !form.title.trim()}
                      className="px-4 py-2 rounded-xl bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
                    >
                      {saving ? 'Збереження...' : 'Зберегти'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add new block form */}
          {editingId === 'new' && (
            <div ref={formRef} className="bg-white/5 border border-[#f5a623]/20 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[#f5a623] text-sm font-semibold">Новий блок</p>
              <BlockForm form={form} setForm={setForm} inputCls={inputCls} />
              <div className="flex gap-2 justify-end">
                <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/70 text-sm transition-colors">
                  Скасувати
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="px-4 py-2 rounded-xl bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
                >
                  {saving ? 'Збереження...' : 'Додати'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockForm({
  form,
  setForm,
  inputCls,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  inputCls: string;
}) {
  return (
    <>
      <div>
        <label className="text-white/40 text-xs block mb-1">Заголовок блоку *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Наприклад: Чому тривога відчувається як небезпека"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-white/40 text-xs block mb-1">Опис (необов'язково)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Короткий опис блоку..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>
      <div>
        <label className="text-white/40 text-xs block mb-1">YouTube URL (необов'язково)</label>
        <input
          type="url"
          value={form.video_url}
          onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-white/40 text-xs block mb-1">Текстовий контент (необов'язково)</label>
        <textarea
          value={form.text_content}
          onChange={(e) => setForm((f) => ({ ...f, text_content: e.target.value }))}
          placeholder="Текст, який побачить користувач після відео..."
          rows={4}
          className={`${inputCls} resize-none`}
        />
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const [password, setPassword] = useState<string | null>(
    () => sessionStorage.getItem('admin_pw')
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'course'>('stats');
  const [statsError, setStatsError] = useState(false);

  // Validate stored password and load stats
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
  }, [password]);

  function handleLogin(pw: string) {
    setPassword(pw);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_pw');
    setPassword(null);
    setStats(null);
  }

  if (!password) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-[#0d0d1a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#f5a623] font-black text-lg">тривога.net</span>
            <span className="text-white/20 text-sm">/ адмін</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <nav className="flex gap-1">
              {([['stats', 'Огляд'], ['orders', 'Замовлення'], ['course', 'Курс']] as const).map(([tab, label]) => (
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

      {/* Content */}
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
        {activeTab === 'orders' && (
          <OrdersTab password={password} />
        )}
        {activeTab === 'course' && (
          <CourseTab password={password} />
        )}
      </div>
    </div>
  );
}
