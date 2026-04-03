import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, fetchAnalyticsSummary, fetchProducts, updateProduct, deleteProduct } from '../../lib/api';
import type { UpdateProductRequest } from '../../types/api';
import type { OrderStatus, EventSummary, ApiProduct } from '../../types/api';

const RESULT_TYPE_LABELS: Record<string, string> = {
  panic_cycle: 'Панічний цикл',
  body_hyperfocus: 'Тілесна гіперфіксація',
  fear_of_recurrence: 'Страх повторення',
  background_tension: 'Фонова напруга',
  combined_type: 'Змішана тривога',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    REFUNDED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  const labels: Record<string, string> = {
    PAID: 'Оплачено',
    PENDING: 'Очікування',
    FAILED: 'Помилка',
    REFUNDED: 'Повернення',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await fetchAnalyticsSummary(adminKey, 1);
      sessionStorage.setItem('admin_key', adminKey);
      onLogin(adminKey);
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
            <label className="text-white/50 text-sm block mb-2">Admin Key</label>
            <input
              type="password"
              autoFocus
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center">Невірний ключ</p>
          )}
          <button
            type="submit"
            disabled={loading || !adminKey}
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

function StatsTab({ events, orders }: { events: EventSummary[]; orders: OrderStatus[] }) {
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
  const paidCount = paidOrders.length;
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const failedCount = orders.filter((o) => o.status === 'FAILED').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Загальна виручка" value={`${totalRevenue.toLocaleString('uk-UA')} грн`} accent />
        <StatCard label="Оплачено" value={String(paidCount)} />
        <StatCard label="Очікування" value={String(pendingCount)} />
        <StatCard label="Помилки" value={String(failedCount)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Топ події</h3>
        {events.length === 0 ? (
          <p className="text-white/30 text-sm">Немає даних</p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.slice(0, 15).map((ev) => (
              <div key={ev.event} className="flex items-center justify-between gap-3">
                <span className="text-white/70 text-sm font-mono truncate">{ev.event}</span>
                <span className="text-white/40 text-sm shrink-0">{ev.count}</span>
              </div>
            ))}
          </div>
        )}
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

function OrdersTab({ orders, products }: { orders: OrderStatus[]; products: ApiProduct[] }) {
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.title]));

  return (
    <div className="flex flex-col gap-4">
      <span className="text-white/30 text-sm">{orders.length} замовлень</span>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {orders.length === 0 ? (
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
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-white max-w-[200px] truncate">
                      {order.customerEmail}
                    </td>
                    <td className="px-5 py-3.5 text-white/70 whitespace-nowrap">
                      {productMap[order.productId] ?? order.productId}
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
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────

const EMPTY_EDIT: UpdateProductRequest = { title: '', description: '', price: '', videoUrl: '', isActive: true, order: 1 };

function ProductsTab({ adminKey, products, onRefresh }: { adminKey: string; products: ApiProduct[]; onRefresh: () => void }) {
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateProductRequest>(EMPTY_EDIT);

  function startEdit(product: ApiProduct) {
    setEditingId(product.id);
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      videoUrl: product.videoUrl ?? '',
      isActive: product.isActive,
      order: product.order,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(EMPTY_EDIT);
  }

  async function saveEdit(productId: string) {
    setSaving(productId);
    try {
      await updateProduct(productId, adminKey, editForm);
      setEditingId(null);
      onRefresh();
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm('Видалити продукт?')) return;
    setSaving(productId);
    try {
      await deleteProduct(productId, adminKey);
      onRefresh();
    } finally {
      setSaving(null);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#f5a623]/50 transition-colors';

  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={`bg-white/5 border rounded-2xl p-5 flex flex-col gap-4 ${!product.isActive ? 'border-white/5 opacity-60' : 'border-white/10'}`}
        >
          {editingId === product.id ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 text-xs">Назва</label>
                  <input
                    className={inputCls}
                    value={editForm.title ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 text-xs">Ціна (грн)</label>
                  <input
                    className={inputCls}
                    value={editForm.price ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-white/40 text-xs">Опис</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={editForm.description ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 text-xs">Video URL</label>
                  <input
                    className={inputCls}
                    value={editForm.videoUrl ?? ''}
                    placeholder="https://..."
                    onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 text-xs">Порядок</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={editForm.order ?? 1}
                    onChange={(e) => setEditForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-[#f5a623]"
                  />
                  <span className="text-white/60 text-sm">Активний</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void saveEdit(product.id)}
                  disabled={saving === product.id}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#f5a623] text-black hover:bg-[#f5a623]/90 disabled:opacity-40 transition-colors"
                >
                  {saving === product.id ? 'Зберігаємо...' : 'Зберегти'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white/60 hover:bg-white/15 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">{product.title}</p>
                <p className="text-white/40 text-sm">{product.price} грн · порядок {product.order}</p>
                <p className="text-white/30 text-xs font-mono mt-1">{product.id}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(product)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/60 hover:bg-white/15 transition-colors"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => void handleDelete(product.id)}
                  disabled={saving === product.id}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
                >
                  {saving === product.id ? '...' : 'Видалити'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Results Tab (static reference) ───────────────────────────────────────────

function ResultsTab() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <p className="text-white/50 text-sm">Типи результатів (визначаються клієнтським кодом):</p>
      {Object.entries(RESULT_TYPE_LABELS).map(([id, label]) => (
        <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-medium">{label}</span>
          <span className="text-white/30 text-xs font-mono">{id}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'stats' | 'orders' | 'products' | 'results';

export function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(
    () => sessionStorage.getItem('admin_key'),
  );
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadData = useCallback(async (key: string) => {
    setLoading(true);
    setError(false);
    try {
      const [ordersData, eventsData, productsData] = await Promise.all([
        fetchOrders(key),
        fetchAnalyticsSummary(key, 30),
        fetchProducts(),
      ]);
      setOrders(ordersData);
      setEvents(eventsData);
      setProducts(productsData);
    } catch {
      setError(true);
      sessionStorage.removeItem('admin_key');
      setAdminKey(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) void loadData(adminKey);
  }, [adminKey, loadData]);

  function handleLogin(key: string) {
    setAdminKey(key);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_key');
    setAdminKey(null);
    setOrders([]);
    setEvents([]);
    setProducts([]);
  }

  if (!adminKey) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const TABS: [Tab, string][] = [
    ['stats', 'Огляд'],
    ['orders', 'Замовлення'],
    ['products', 'Продукти'],
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
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-16">Помилка завантаження</p>
        ) : (
          <>
            {activeTab === 'stats' && <StatsTab events={events} orders={orders} />}
            {activeTab === 'orders' && <OrdersTab orders={orders} products={products} />}
            {activeTab === 'products' && <ProductsTab adminKey={adminKey} products={products} onRefresh={() => void loadData(adminKey)} />}
            {activeTab === 'results' && <ResultsTab />}
          </>
        )}
      </div>
    </div>
  );
}
