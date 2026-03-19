import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Order {
  id?: string;
  order_id: string;
  email: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  liqpay_status?: string;
  created_at?: string;
}

export interface Event {
  event_type: string;
  metadata?: Record<string, unknown>;
  session_id?: string;
}
