# Frontend Integration Guide

**Base URL**: `https://sjys-expense.pages.dev` (production) | `http://localhost:3000` (local)
**Content-Type**: `application/json` for all requests with a body

---

## Response Shape

All endpoints return the same structure:

```json
{ "success": true, "data": { ... } }
{ "success": true, "data": { ... }, "message": "..." }
{ "success": false, "error": "..." }
{ "success": false, "error": "...", "details": { ... } }
```

---

## Authentication

### Login
`POST /api/auth/login`
Public. Rate-limited to **5 attempts per 15 minutes** per IP.

**Request**
```json
{ "passcode": "your-passcode" }
```

**Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_expires_in": 604800,
    "message": "Login successful"
  }
}
```

- `accessToken` expires in **15 minutes**
- `refreshToken` expires in **7 days**

---

### Refresh Token
`POST /api/auth/refresh`
Public. Use when the access token expires.

**Request header**
```
Authorization: Bearer <refreshToken>
```

**Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

---

### Logout
`POST /api/auth/logout`
Protected.

**Response**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

## Authenticated Requests

Include the access token in every protected request:
```
Authorization: Bearer <accessToken>
```

On **401**, attempt a token refresh. If refresh also fails, redirect to login.

---

## Categories

All category endpoints are **public** (no auth required).

### Get Main Categories
`GET /api/categories/main`

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Food", "icon": "🍔", "color": "#FF6B6B", "has_subcategories": true }
  ]
}
```

### Get Subcategories
`GET /api/categories/sub/:parentId`

```json
{
  "success": true,
  "data": [
    { "id": 5, "name": "Groceries", "parent_id": 1 }
  ]
}
```

### Get All Categories (flat list)
`GET /api/categories/all`

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Food", "parent_category_id": null, "icon": "🍔", "color": "#FF6B6B", "parent_name": null },
    { "id": 5, "name": "Groceries", "parent_category_id": 1, "icon": null, "color": null, "parent_name": "Food" }
  ]
}
```

### Get Category by ID
`GET /api/categories/:id`

Same shape as a single item from the all-categories list.

---

## Payment Methods

**Public** (no auth required).

`GET /api/payment-methods`

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Cash" },
    { "id": 2, "name": "Credit Card" }
  ]
}
```

---

## Expenses

All expense endpoints require **authentication**.

### Create Expense
`POST /api/expenses`

**Request**
```json
{
  "spent_by": "SJ",
  "category_id": 5,
  "payment_method_id": 2,
  "amount": 12.50,
  "expense_date": "2026-03-30",
  "currency": "SGD",
  "description": "Lunch at hawker centre"
}
```

| Field | Required | Notes |
|---|---|---|
| `spent_by` | Yes | `"SJ"`, `"YS"`, or `"Shared"` |
| `category_id` | Yes | Positive integer |
| `payment_method_id` | Yes | Positive integer |
| `amount` | Yes | Min `0.01` |
| `expense_date` | Yes | `YYYY-MM-DD`, range 2000–current+10 |
| `currency` | No | Defaults to `"SGD"` |
| `description` | No | Max 500 characters |

**Response** — `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 42,
    "spent_by": "SJ",
    "category_id": 5,
    "category_name": "Groceries",
    "parent_category_name": "Food",
    "main_cat_icon": "🍔",
    "main_cat_color": "#FF6B6B",
    "payment_method_id": 2,
    "payment_method": "Credit Card",
    "amount": 12.50,
    "currency": "SGD",
    "expense_date": "2026-03-30",
    "description": "Lunch at hawker centre",
    "created_at": "2026-03-30T10:00:00",
    "updated_at": "2026-03-30T10:00:00"
  },
  "message": "Expense created successfully"
}
```

---

### List Expenses
`GET /api/expenses`

**Query params**

| Param | Type | Default | Notes |
|---|---|---|---|
| `limit` | number | `50` | Max `100` |
| `offset` | number | `0` | |
| `spent_by` | string | — | `"SJ"`, `"YS"`, `"Shared"` |
| `category_id` | number | — | |
| `start_date` | string | — | `YYYY-MM-DD` |
| `end_date` | string | — | `YYYY-MM-DD` |

**Response**
```json
{
  "success": true,
  "data": {
    "expenses": [ { ...same shape as create response... } ],
    "pagination": {
      "total": 120,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

### Get Expense by ID
`GET /api/expenses/:id`

Returns a single expense object (same shape as create response).

---

### Update Expense
`PUT /api/expenses/:id`

Partial update — send only the fields you want to change. Same field rules as create.

**Response** — updated expense object.

---

### Delete Expense
`DELETE /api/expenses/:id`

```json
{ "success": true, "data": null, "message": "Expense deleted successfully" }
```

---

## Dashboard

All dashboard endpoints require **authentication**.

### Overview
`GET /api/dashboard/overview`

**Query params**

| Param | Required | Values | Example |
|---|---|---|---|
| `period` | No | `"monthly"` (default), `"yearly"` | `period=monthly` |
| `date` | Yes | `YYYY-MM` for monthly, `YYYY` for yearly | `date=2026-03` |

**Response**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "date": "2026-03",
    "date_range": { "start": "2026-03-01", "end": "2026-03-31" },
    "cards": {
      "total_expenses": { "current": 1500.00, "previous": 1200.00, "change_percentage": 25.0 },
      "top_category": {
        "category_id": 1, "category_name": "Food", "icon": "🍔", "color": "#FF6B6B",
        "total": 600.00, "previous_total": 500.00, "change_percentage": 20.0
      },
      "top_spender": {
        "spent_by": "SJ", "total": 900.00, "previous_total": 700.00, "change_percentage": 28.6
      }
    },
    "spending_chart": [
      {
        "period": "2026-01",
        "total": 1100.00,
        "categories": [
          { "category_id": 1, "category_name": "Food", "color": "#FF6B6B", "amount": 400.00 }
        ]
      }
    ],
    "category_ranking": [
      {
        "rank": 1, "main_category_id": 1, "main_category_name": "Food",
        "icon": "🍔", "color": "#FF6B6B", "total": 600.00,
        "transaction_count": 15, "percentage": 40.0
      }
    ]
  }
}
```

- `spending_chart`: last **6 months** for monthly period, last **3 years** for yearly
- `change_percentage`: compared to the previous month/year

---

### Spender Breakdown
`GET /api/dashboard/spender-breakdown`

Same `period` + `date` params as overview.

**Response**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "date": "2026-03",
    "date_range": { "start": "2026-03-01", "end": "2026-03-31" },
    "total": 1500.00,
    "spenders": [
      {
        "spent_by": "SJ", "total": 900.00, "transaction_count": 20,
        "percentage": 60.0, "previous_total": 700.00, "change_percentage": 28.6
      },
      {
        "spent_by": "YS", "total": 400.00, "transaction_count": 10,
        "percentage": 26.7, "previous_total": 350.00, "change_percentage": 14.3
      },
      {
        "spent_by": "Shared", "total": 200.00, "transaction_count": 3,
        "percentage": 13.3, "previous_total": 150.00, "change_percentage": 33.3
      }
    ]
  }
}
```

---

### Category Drill-Down
`GET /api/dashboard/category-drill/:categoryId`

Same `period` + `date` params as overview.

**Response** — if category has subcategories, breaks down by subcategory; otherwise by spender:

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "date": "2026-03",
    "date_range": { "start": "2026-03-01", "end": "2026-03-31" },
    "main_category": { "id": 1, "name": "Food", "icon": "🍔", "color": "#FF6B6B", "total": 600.00 },
    "breakdown_type": "subcategories",
    "breakdown": [
      { "id": 5, "name": "Groceries", "icon": null, "color": null, "total": 350.00, "transaction_count": 8, "percentage": 58.3 }
    ]
  }
}
```

`breakdown_type` is either `"subcategories"` or `"spenders"`.

---

### Daily Trend
`GET /api/dashboard/daily-trend`

**Query params**

| Param | Required | Format | Example |
|---|---|---|---|
| `year_month` | Yes | `YYYY-MM` | `year_month=2026-03` |

**Response**
```json
{
  "success": true,
  "data": {
    "year_month": "2026-03",
    "date_range": { "start": "2026-03-01", "end": "2026-03-31" },
    "total": 1500.00,
    "avg_per_day": 75.00,
    "peak_day": { "date": "2026-03-15", "total": 250.00, "transaction_count": 5 },
    "days": [
      { "date": "2026-03-01", "total": 0, "transaction_count": 0 },
      { "date": "2026-03-02", "total": 45.50, "transaction_count": 2 }
    ]
  }
}
```

`days` always contains every day of the month (zero-spend days included).
`avg_per_day` is averaged over days with spending only (not the full month).
`peak_day` is `null` if no spending in the month.

---

## Error Reference

| Status | Meaning |
|---|---|
| `400` | Validation failed — check `error` / `details` |
| `401` | Missing or expired token — refresh or re-login |
| `403` | CSRF / origin not allowed |
| `404` | Resource not found |
| `413` | Request body exceeds 100KB |
| `429` | Too many login attempts — check `retry_after_seconds` |
| `500` | Server error |

**Validation error example**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "amount": "amount must be at least 0.01",
    "spent_by": "spent_by must be one of: SJ, YS, Shared"
  }
}
```

**Rate limit error example**
```json
{
  "success": false,
  "error": "Too many login attempts",
  "retry_after_seconds": 540
}
```
