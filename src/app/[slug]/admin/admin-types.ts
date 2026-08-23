export function formatEur(n: number | null | undefined): string {
  return `${(n ?? 0).toFixed(2)} €`;
}

export interface AdminProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  vegan: boolean;
  is_vegan: boolean;
  is_glutenfree: boolean;
  allergens: string[];
  category_type: string | null;
  category: string;
  is_available: boolean;
  happy_hour_price: number | null;
  start_time: string | null;
  end_time: string | null;
  name_en: string;
  description_en: string;
  related_product_ids: number[];
}

export interface AdminCategory {
  id: number;
  name: string;
  position: number | null;
  super_group_id: number | null;
  extras: string | null;
}

export interface LiveItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  category_type: string | null;
  note: string | null;
  item_status: string;
  combo_id: number | null;
  combo_name: string | null;
  combo_instance_id: string | null;
  extras?: string | null;
}

export interface LiveOrder {
  id: number;
  table: string;
  items: LiveItem[];
  total: number | null;
  total_with_tip: number | null;
  tip_amount: number | null;
  status: string | null;
  timestamp: string;
  daily_bon_number: number | null;
}

export interface LiveTable {
  number: string;
  zone: string;
  active: boolean;
  shape: string;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
}

export interface ServiceCall {
  id: number;
  table: string;
  type: string;
  timestamp: string;
}

export interface TabletStatus {
  orders: LiveOrder[];
  service_calls: ServiceCall[];
  tables: LiveTable[];
  server_time: string;
  price_mode: string;
  stats: {
    brutto: number;
    netto_7: number;
    netto_19: number;
    brutto_7: number;
    brutto_19: number;
    tip: number;
    orders_count: number;
    avg_basket: number;
  };
  recent_payments: { id: number; table: string; total: number; timestamp: string }[];
  recent_cancellations: { id: number; table: string; total: number; timestamp: string }[];
}