# Dashboard API Integration Guide

context: okay now lets do the dashboard backend , i need the Card to display total expenses for the month, with same card showing whether how many percentage increase compare to last month, a second card showing top main cat and how much it spend for this month, also same card showing percentage increase compare to last month. a third card showing who spend the most(exclude shared, just compare between SJ and YS) and also shows percentage increase compare to last month). below the card i want to have a graph of overall spending in a chart of each month break down, each month is a single column chart internally breakd down into color of spend Main Category. lastly i need a ranking board showing the ranking of the expense spend on Main catgory, with most spended at the top and rank down. also i will have a simple switch at dashboard to switch between monthly and yearly, so if monthly, the cards and ranking and chart will break down in monthly, when swithc to yearly, the chart show breakdown in 12 month, and the 3 cards will show total in that year and the compare with change from last month to last year. same for spending it will chnagr ot ranking of yearly. lets do the backend chnages in here. front end i will implement myself. i have updated my latest dashboard query as i breakdown origin query to dashboard and expense soeach file is not lengthy, and also the latest handler after fixing some bug.

Show less
11:05 AM



## Overview

This guide provides comprehensive documentation for integrating with the Expense Tracker Dashboard API. The dashboard provides expense analytics, spending trends, and category breakdowns.

## Base URL

```
Production: https://expense-backend.sunjie1993sg.workers.dev
Development: http://localhost:8787
```

## Authentication

All dashboard endpoints require authentication via Bearer token.

```http
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Dashboard Overview (Recommended)

**Endpoint:** `GET /api/dashboard/overview`

**Description:** Main dashboard endpoint that returns all analytics data in a single request - expense cards, spending charts, and category rankings.

#### Query Parameters

| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| `period` | string | No (default: `monthly`) | `monthly`, `yearly` | Time period view |
| `date` | string | Yes | `YYYY-MM` or `YYYY` | Target date for the period |

#### Request Examples

**Monthly View:**
```http
GET /api/dashboard/overview?period=monthly&date=2025-01
Authorization: Bearer <token>
```

**Yearly View:**
```http
GET /api/dashboard/overview?period=yearly&date=2025
Authorization: Bearer <token>
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "date": "2025-01",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "cards": {
      "total_expenses": {
        "current": 1250.50,
        "previous": 980.25,
        "change_percentage": 27.6
      },
      "top_category": {
        "category_id": 1,
        "category_name": "Food & Dining",
        "icon": "🍔",
        "color": "#FF6B6B",
        "total": 450.75,
        "previous_total": 320.50,
        "change_percentage": 40.6
      },
      "top_spender": {
        "spent_by": "SJ",
        "total": 680.30,
        "previous_total": 520.15,
        "change_percentage": 30.8
      }
    },
    "spending_chart": [
      {
        "period": "2024-08",
        "total": 980.25,
        "categories": [
          {
            "category_id": 1,
            "category_name": "Food & Dining",
            "color": "#FF6B6B",
            "amount": 320.50
          },
          {
            "category_id": 2,
            "category_name": "Transportation",
            "color": "#4ECDC4",
            "amount": 180.75
          }
        ]
      },
      {
        "period": "2024-09",
        "total": 1100.00,
        "categories": [...]
      }
    ],
    "category_ranking": [
      {
        "rank": 1,
        "main_category_id": 1,
        "main_category_name": "Food & Dining",
        "icon": "🍔",
        "color": "#FF6B6B",
        "total": 450.75,
        "transaction_count": 23,
        "percentage": 36.0
      },
      {
        "rank": 2,
        "main_category_id": 2,
        "main_category_name": "Transportation",
        "icon": "🚗",
        "color": "#4ECDC4",
        "total": 280.50,
        "transaction_count": 15,
        "percentage": 22.4
      }
    ]
  }
}
```

#### Response Fields Explained

##### Cards

**total_expenses:**
- `current`: Total expenses for the selected period
- `previous`: Total expenses for the previous period (previous month or year)
- `change_percentage`: Percentage change from previous period (positive = increase, negative = decrease)

**top_category:**
- `category_id`: ID of the category with highest spending
- `category_name`: Display name of the category
- `icon`: Emoji icon for the category
- `color`: Hex color code for UI theming
- `total`: Total spent in this category for current period
- `previous_total`: Total spent in this category for previous period
- `change_percentage`: Percentage change from previous period
- **Note:** Will be `null` if no expenses exist

**top_spender:**
- `spent_by`: User identifier (SJ or YS)
- `total`: Total spent by this user for current period
- `previous_total`: Total spent by this user for previous period
- `change_percentage`: Percentage change from previous period
- **Note:** Will be `null` if no expenses exist

##### Spending Chart

Array of period objects showing spending trends:
- `period`: Time period label (`YYYY-MM` for monthly, `YYYY` for yearly)
- `total`: Total expenses for this period
- `categories`: Array of category breakdowns for this period
    - `category_id`: Category identifier
    - `category_name`: Category display name
    - `color`: Hex color for charts
    - `amount`: Amount spent in this category

**Monthly view:** Returns last 6 months including current month
**Yearly view:** Returns last 3 years including current year

##### Category Ranking

Array of categories sorted by total spending (highest to lowest):
- `rank`: Position in ranking (1 = highest spending)
- `main_category_id`: Category identifier
- `main_category_name`: Category display name
- `icon`: Emoji icon for display
- `color`: Hex color code
- `total`: Total spent in this category
- `transaction_count`: Number of transactions in this category
- `percentage`: Percentage of total spending (0-100)

---

### 2. Legacy Summary Endpoint

**Endpoint:** `GET /api/dashboard/summary`

**Description:** Legacy endpoint for custom date range summaries. Use for backwards compatibility or custom date ranges.

#### Query Parameters

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `start_date` | string | Yes | `YYYY-MM-DD` | Start date (inclusive) |
| `end_date` | string | Yes | `YYYY-MM-DD` | End date (inclusive) |

#### Request Example

```http
GET /api/dashboard/summary?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <token>
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "total_spent": 1250.50,
    "category_breakdown": [
      {
        "rank": 1,
        "main_category_id": 1,
        "main_category_name": "Food & Dining",
        "icon": "🍔",
        "color": "#FF6B6B",
        "total": 450.75,
        "transaction_count": 23,
        "percentage": 36.0
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request

**Missing required parameter:**
```json
{
  "success": false,
  "error": "date parameter is required"
}
```

**Invalid period:**
```json
{
  "success": false,
  "error": "period must be either \"monthly\" or \"yearly\""
}
```

**Invalid date format:**
```json
{
  "success": false,
  "error": "date must be in YYYY-MM format for monthly period"
}
```

### 401 Unauthorized

**Missing or invalid token:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Frontend Integration Examples

### React with Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'https://expense-backend.sunjie1993sg.workers.dev';

// Get dashboard overview for current month
async function fetchDashboardOverview(period = 'monthly', date) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/overview`, {
      params: { period, date },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Dashboard fetch error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage example
const dashboard = await fetchDashboardOverview('monthly', '2025-01');
console.log('Total expenses:', dashboard.cards.total_expenses.current);
console.log('Top category:', dashboard.cards.top_category?.category_name);
```

### React with Fetch

```javascript
async function fetchDashboardOverview(period, date) {
  const token = localStorage.getItem('authToken');
  const url = new URL('/api/dashboard/overview', 'https://expense-backend.sunjie1993sg.workers.dev');
  url.searchParams.append('period', period);
  url.searchParams.append('date', date);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useDashboard(period = 'monthly', date) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardOverview(period, date);
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [period, date]);

  return { dashboard, loading, error };
}

// Usage in component
function DashboardPage() {
  const { dashboard, loading, error } = useDashboard('monthly', '2025-01');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Total Expenses: ${dashboard.cards.total_expenses.current}</h1>
      <p>Change: {dashboard.cards.total_expenses.change_percentage}%</p>
    </div>
  );
}
```

---

## UI Component Examples

### Expense Card Component

```jsx
function ExpenseCard({ data }) {
  const { current, previous, change_percentage } = data;
  const isIncrease = change_percentage > 0;

  return (
    <div className="card">
      <h3>Total Expenses</h3>
      <div className="amount">${current.toFixed(2)}</div>
      <div className={`change ${isIncrease ? 'increase' : 'decrease'}`}>
        {isIncrease ? '↑' : '↓'} {Math.abs(change_percentage)}%
      </div>
      <div className="previous">Previous: ${previous.toFixed(2)}</div>
    </div>
  );
}

// Usage
<ExpenseCard data={dashboard.cards.total_expenses} />
```

### Category Ranking List

```jsx
function CategoryRanking({ categories }) {
  return (
    <div className="ranking-list">
      <h3>Spending by Category</h3>
      {categories.map((category) => (
        <div key={category.main_category_id} className="ranking-item">
          <span className="rank">#{category.rank}</span>
          <span className="icon">{category.icon}</span>
          <span className="name">{category.main_category_name}</span>
          <span className="amount">${category.total.toFixed(2)}</span>
          <span className="percentage">{category.percentage}%</span>
          <div
            className="bar"
            style={{
              width: `${category.percentage}%`,
              backgroundColor: category.color
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Usage
<CategoryRanking categories={dashboard.category_ranking} />
```

### Spending Chart (with Chart.js)

```jsx
import { Line } from 'react-chartjs-2';

function SpendingChart({ chartData }) {
  // Extract unique categories and their colors
  const categoryMap = new Map();
  chartData.forEach(period => {
    period.categories.forEach(cat => {
      if (!categoryMap.has(cat.category_id)) {
        categoryMap.set(cat.category_id, {
          name: cat.category_name,
          color: cat.color
        });
      }
    });
  });

  // Prepare datasets
  const datasets = Array.from(categoryMap.entries()).map(([id, info]) => ({
    label: info.name,
    data: chartData.map(period => {
      const cat = period.categories.find(c => c.category_id === id);
      return cat ? cat.amount : 0;
    }),
    borderColor: info.color,
    backgroundColor: info.color + '20',
    tension: 0.4
  }));

  const data = {
    labels: chartData.map(d => d.period),
    datasets
  };

  return <Line data={data} options={{ responsive: true }} />;
}

// Usage
<SpendingChart chartData={dashboard.spending_chart} />
```

---

## Date Helper Functions

```javascript
// Get current month in YYYY-MM format
export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Get current year in YYYY format
export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

// Format date for monthly view
export function getMonthDate(monthsAgo = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Format date for yearly view
export function getYearDate(yearsAgo = 0) {
  const year = new Date().getFullYear() - yearsAgo;
  return year.toString();
}

// Usage examples
const currentMonth = getCurrentMonth(); // "2025-01"
const lastMonth = getMonthDate(1);      // "2024-12"
const currentYear = getCurrentYear();   // "2025"
const lastYear = getYearDate(1);        // "2024"
```

---

## Best Practices

### 1. Cache Dashboard Data
Dashboard data doesn't change frequently. Consider caching for 5-10 minutes:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const dashboardCache = new Map();

async function fetchDashboardWithCache(period, date) {
  const cacheKey = `${period}-${date}`;
  const cached = dashboardCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchDashboardOverview(period, date);
  dashboardCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  return data;
}
```

### 2. Handle Null Values
Cards may return `null` if no data exists:

```javascript
function TopCategoryCard({ topCategory }) {
  if (!topCategory) {
    return <div>No spending data available</div>;
  }

  return (
    <div style={{ backgroundColor: topCategory.color }}>
      <span>{topCategory.icon}</span>
      <h3>{topCategory.category_name}</h3>
      <p>${topCategory.total.toFixed(2)}</p>
    </div>
  );
}
```

### 3. Format Currency
Always format currency values:

```javascript
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD'
  }).format(amount);
}

// Usage
<div>{formatCurrency(dashboard.cards.total_expenses.current)}</div>
```

### 4. Period Navigation
Implement period navigation for better UX:

```javascript
function DashboardNav({ period, date, onDateChange }) {
  const goToPrevious = () => {
    if (period === 'monthly') {
      const [year, month] = date.split('-');
      const d = new Date(year, month - 1, 1);
      d.setMonth(d.getMonth() - 1);
      onDateChange(getMonthDate(0, d));
    } else {
      const year = parseInt(date) - 1;
      onDateChange(year.toString());
    }
  };

  const goToNext = () => {
    if (period === 'monthly') {
      const [year, month] = date.split('-');
      const d = new Date(year, month - 1, 1);
      d.setMonth(d.getMonth() + 1);
      onDateChange(getMonthDate(0, d));
    } else {
      const year = parseInt(date) + 1;
      onDateChange(year.toString());
    }
  };

  return (
    <div>
      <button onClick={goToPrevious}>← Previous</button>
      <span>{date}</span>
      <button onClick={goToNext}>Next →</button>
    </div>
  );
}
```

---

## TypeScript Types

```typescript
interface DashboardOverview {
  period: 'monthly' | 'yearly';
  date: string;
  date_range: {
    start: string;
    end: string;
  };
  cards: {
    total_expenses: ExpenseCard;
    top_category: CategoryCard | null;
    top_spender: SpenderCard | null;
  };
  spending_chart: ChartPeriod[];
  category_ranking: CategoryRanking[];
}

interface ExpenseCard {
  current: number;
  previous: number;
  change_percentage: number;
}

interface CategoryCard {
  category_id: number;
  category_name: string;
  icon: string;
  color: string;
  total: number;
  previous_total: number;
  change_percentage: number;
}

interface SpenderCard {
  spent_by: string;
  total: number;
  previous_total: number;
  change_percentage: number;
}

interface ChartPeriod {
  period: string;
  total: number;
  categories: ChartCategory[];
}

interface ChartCategory {
  category_id: number;
  category_name: string;
  color: string;
  amount: number;
}

interface CategoryRanking {
  rank: number;
  main_category_id: number;
  main_category_name: string;
  icon: string;
  color: string;
  total: number;
  transaction_count: number;
  percentage: number;
}
```

---

## Support

For questions or issues:
- Check error responses for validation issues
- Ensure authentication token is valid
- Verify date format matches the period type
- Contact backend team for API issues

---

**Last Updated:** January 21, 2026
**API Version:** 1.0.1.1