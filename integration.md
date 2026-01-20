# Expense Tracker API Integration Guide

## Base URL

```
Development: http://localhost:8787
Production: https://expense-backend.<your-subdomain>.workers.dev
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header.

```
Authorization: Bearer <token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "passcode": "your-passcode"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 604800,
    "message": "Login successful"
  }
}
```

**Token Expiry:** 7 days (604800 seconds)

**Rate Limit:** 5 attempts per 15 minutes per IP

---

## Response Format

All endpoints return consistent JSON:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

---

## Public Endpoints

### GET /
Health check endpoint.

```json
{
  "message": "Expense Tracker API",
  "version": "1.0.12",
  "status": "running"
}
```

---

### Categories

#### GET /api/categories/main
Get all main (parent) categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "icon": "utensils",
      "color": "#FF6B6B",
      "has_subcategories": 1
    }
  ]
}
```

#### GET /api/categories/sub/:parentId
Get subcategories for a parent category.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Groceries",
      "parent_id": 1
    }
  ]
}
```

#### GET /api/categories/all
Get all categories with hierarchy info.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "parent_category_id": null,
      "icon": "utensils",
      "color": "#FF6B6B",
      "parent_name": null
    },
    {
      "id": 5,
      "name": "Groceries",
      "parent_category_id": 1,
      "icon": null,
      "color": null,
      "parent_name": "Food & Dining"
    }
  ]
}
```

#### GET /api/categories/:id
Get single category by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Food & Dining",
    "parent_category_id": null,
    "icon": "utensils",
    "color": "#FF6B6B",
    "parent_name": null
  }
}
```

---

### Payment Methods

#### GET /api/payment-methods
Get all active payment methods.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Cash" },
    { "id": 2, "name": "Credit Card" },
    { "id": 3, "name": "Debit Card" }
  ]
}
```

---

## Protected Endpoints

> Requires `Authorization: Bearer <token>` header

### Expenses

#### POST /api/expenses
Create a new expense.

**Request:**
```json
{
  "spent_by": "SJ",
  "category_id": 5,
  "payment_method_id": 2,
  "amount": 45.50,
  "expense_date": "2026-01-20",
  "description": "Weekly groceries"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| spent_by | string | Yes | One of: `SJ`, `YS`, `Shared` |
| category_id | integer | Yes | Must be valid category ID |
| payment_method_id | integer | Yes | Must be valid payment method ID |
| amount | number | Yes | Min: 0.01 |
| expense_date | string | Yes | Format: `YYYY-MM-DD` |
| description | string | No | Max 500 characters |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "spent_by": "SJ",
    "category_id": 5,
    "category_name": "Groceries",
    "parent_category_name": "Food & Dining",
    "payment_method_id": 2,
    "payment_method": "Credit Card",
    "amount": 45.50,
    "currency": "SGD",
    "expense_date": "2026-01-20",
    "description": "Weekly groceries",
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": null
  },
  "message": "Expense created successfully"
}
```

---

#### GET /api/expenses
List expenses with optional filters and pagination.

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| spent_by | string | - | Filter by spender |
| category_id | integer | - | Filter by category |
| start_date | string | - | Filter from date (YYYY-MM-DD) |
| end_date | string | - | Filter to date (YYYY-MM-DD) |
| limit | integer | 50 | Max: 100 |
| offset | integer | 0 | For pagination |

**Example:**
```
GET /api/expenses?spent_by=SJ&start_date=2026-01-01&end_date=2026-01-31&limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": 123,
        "spent_by": "SJ",
        "category_id": 5,
        "category_name": "Groceries",
        "parent_category_name": "Food & Dining",
        "payment_method_id": 2,
        "payment_method": "Credit Card",
        "amount": 45.50,
        "currency": "SGD",
        "expense_date": "2026-01-20",
        "description": "Weekly groceries",
        "created_at": "2026-01-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

#### GET /api/expenses/:id
Get single expense by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "spent_by": "SJ",
    "category_id": 5,
    "category_name": "Groceries",
    "parent_category_name": "Food & Dining",
    "payment_method_id": 2,
    "payment_method": "Credit Card",
    "amount": 45.50,
    "currency": "SGD",
    "expense_date": "2026-01-20",
    "description": "Weekly groceries",
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": null
  }
}
```

---

#### PUT /api/expenses/:id
Update an expense. Only include fields you want to update.

**Request:**
```json
{
  "amount": 50.00,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Expense updated successfully"
}
```

---

#### DELETE /api/expenses/:id
Delete an expense.

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Expense deleted successfully"
}
```

---

### Dashboard

#### GET /api/dashboard/summary
Get spending summary grouped by main category.

**Query Parameters (Required):**

| Param | Type | Required |
|-------|------|----------|
| start_date | string | Yes (YYYY-MM-DD) |
| end_date | string | Yes (YYYY-MM-DD) |

**Example:**
```
GET /api/dashboard/summary?start_date=2026-01-01&end_date=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "total_spent": 1250.75,
    "category_breakdown": [
      {
        "main_category_id": 1,
        "main_category_name": "Food & Dining",
        "icon": "utensils",
        "color": "#FF6B6B",
        "total": 450.50,
        "count": 12,
        "percentage": "36.0"
      },
      {
        "main_category_id": 2,
        "main_category_name": "Transport",
        "icon": "car",
        "color": "#4ECDC4",
        "total": 320.25,
        "count": 8,
        "percentage": "25.6"
      }
    ]
  }
}
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - Invalid/missing token |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

**Validation Error Example (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "amount": "amount must be at least 0.01",
    "expense_date": "expense_date must be a valid date in YYYY-MM-DD format"
  }
}
```

**Rate Limit Error (429):**
```json
{
  "success": false,
  "error": "Too many login attempts",
  "retry_after_seconds": 845
}
```

---

## Rate Limit Headers

Login endpoint returns these headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1737373200
Retry-After: 845 (only on 429)
```

---

## Frontend Implementation Notes

### Token Storage
Store the JWT token securely (e.g., httpOnly cookie or secure storage). Include it in all protected API calls.

### Token Refresh
Tokens expire after 7 days. Handle 401 responses by redirecting to login.

### Date Handling
- All dates use `YYYY-MM-DD` format
- Dates are stored/returned in UTC
- Valid date range: 2000-01-01 to 10 years in future

### Pagination
Use `offset` and `limit` for pagination. Check `has_more` to determine if more pages exist.

```javascript
// Example: Load next page
const nextOffset = pagination.offset + pagination.limit;
if (pagination.has_more) {
  fetchExpenses({ offset: nextOffset, limit: 20 });
}
```

### Allowed Values
- `spent_by`: `SJ`, `YS`, `Shared`
- `currency`: Always `SGD` (default)