import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';

function checkAuth(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Basic ')) return false;
  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
  const [, password] = decoded.split(':');
  return password === process.env.ADMIN_PASSWORD;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const [ordersResult, eventsResult] = await Promise.all([
    supabase.from('orders').select('product_id, amount, status, created_at'),
    supabase.from('events').select('event_type'),
  ]);

  const allOrders = ordersResult.data ?? [];
  const allEvents = eventsResult.data ?? [];

  // Totals
  let totalRevenue = 0;
  let monthRevenue = 0;
  const statusCounts: Record<string, number> = {};
  const revenueByProduct: Record<string, { count: number; revenue: number }> = {};

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  for (const o of allOrders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    if (o.status === 'success') {
      totalRevenue += o.amount ?? 0;
      if (new Date(o.created_at) >= startOfMonth) {
        monthRevenue += o.amount ?? 0;
      }
      if (!revenueByProduct[o.product_id]) {
        revenueByProduct[o.product_id] = { count: 0, revenue: 0 };
      }
      revenueByProduct[o.product_id].count++;
      revenueByProduct[o.product_id].revenue += o.amount ?? 0;
    }
  }

  // Event counts
  const eventCounts: Record<string, number> = {};
  for (const e of allEvents) {
    eventCounts[e.event_type] = (eventCounts[e.event_type] ?? 0) + 1;
  }

  return res.status(200).json({
    totalRevenue,
    monthRevenue,
    statusCounts,
    revenueByProduct,
    eventCounts,
  });
}
