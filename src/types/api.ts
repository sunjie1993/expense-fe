// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string>;
}

// Auth types
export interface LoginResponse {
  token: string;
  expires_in: number;
  message: string;
}

// Expense types
export interface Expense {
  id: number;
  spent_by: "SJ" | "YS" | "Shared";
  category_id: number;
  category_name: string;
  parent_category_name: string;
  payment_method_id: number;
  payment_method: string;
  amount: number;
  currency: string;
  expense_date: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Category types
export interface Category {
  id: number;
  name: string;
  parent_category_id: number | null;
  icon: string | null;
  color: string | null;
  parent_name: string | null;
}

export interface MainCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  has_subcategories: number;
}

// Payment Method types
export interface PaymentMethod {
  id: number;
  name: string;
}

// Dashboard types
export interface CategoryBreakdown {
  main_category_id: number;
  main_category_name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: string;
}

export interface DashboardSummary {
  start_date: string;
  end_date: string;
  total_spent: number;
  category_breakdown: CategoryBreakdown[];
}
