# Expense Tracker API - Frontend Integration Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Authentication Flow](#authentication-flow)
- [Base Configuration](#base-configuration)
- [Authentication Endpoints](#authentication-endpoints)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [Error Handling](#error-handling)
- [TypeScript Interfaces](#typescript-interfaces)

---

## Quick Start

### Environment Setup

```bash
# Backend URLs
Development: http://localhost:8787
Production: https://expense-backend.<your-subdomain>.workers.dev
```

### Frontend Requirements

**CRITICAL:** All API requests MUST include `credentials: 'include'` to send/receive HttpOnly cookies.

```typescript
// ✅ CORRECT
fetch('/api/expenses', {
  credentials: 'include'
})

// ❌ WRONG - Cookies won't be sent
fetch('/api/expenses')
```

---

## Authentication Flow

### How HttpOnly Cookie Authentication Works

The backend uses **HttpOnly cookies** for authentication. This means:

1. **NO localStorage/sessionStorage** - Tokens are stored in browser cookies
2. **Automatic cookie management** - Browser sends cookies automatically with `credentials: 'include'`
3. **JavaScript cannot read tokens** - More secure against XSS attacks
4. **No manual token refresh needed** - Backend handles cookie refresh automatically

### Complete Authentication Lifecycle

```typescript
// 1. APP INITIALIZATION (On page load)
// ====================================
async function initializeApp() {
  // Clean up any legacy localStorage tokens
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('access_token');

  // Check if user has valid session by calling any protected endpoint
  // Recommended: Use a protected endpoint like /api/expenses?limit=1
  try {
    const response = await fetch(`${API_URL}/api/expenses?limit=1`, {
      credentials: 'include'
    });

    if (response.ok) {
      // User is authenticated
      return true;
    } else if (response.status === 401) {
      // User is not authenticated
      return false;
    }
  } catch (error) {
    return false;
  }
}

// 2. LOGIN FLOW
// =============
async function login(passcode: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // CRITICAL: Allows cookies to be set
    body: JSON.stringify({ passcode })
  });

  if (!response.ok) {
    if (response.status === 429) {
      const data = await response.json();
      throw new Error(`Rate limited. Retry in ${data.retry_after_seconds}s`);
    }
    throw new Error('Login failed');
  }

  const data = await response.json();
  // Backend sets HttpOnly cookies automatically
  // Frontend does NOT need to store anything
  return data;
}

// 3. MAKING AUTHENTICATED REQUESTS
// =================================
async function getExpenses() {
  const response = await fetch(`${API_URL}/api/expenses`, {
    credentials: 'include' // Cookies sent automatically
  });

  if (response.status === 401) {
    // Token expired - try to refresh
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry original request
      return fetch(`${API_URL}/api/expenses`, {
        credentials: 'include'
      });
    } else {
      // Refresh failed - redirect to login
      window.location.href = '/login';
    }
  }

  return response.json();
}

// 4. TOKEN REFRESH (Automatic)
// =============================
async function refreshToken() {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include' // Sends refresh_token cookie
  });

  if (response.ok) {
    // Backend sets new auth_token cookie
    return true;
  }

  // Refresh token expired or invalid
  return false;
}

// 5. LOGOUT FLOW
// ==============
async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    // Ignore errors - always clear frontend state
    console.error('Logout error:', error);
  } finally {
    // Backend clears cookies automatically
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### Request Queue Pattern (Advanced)

Prevent multiple simultaneous refresh attempts:

```typescript
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: 'include'
  });

  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        // Refresh succeeded - retry all queued requests
        response = await fetch(url, { ...options, credentials: 'include' });
        refreshQueue.forEach(cb => cb());
        refreshQueue = [];
      } else {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    } finally {
      isRefreshing = false;
    }
  } else if (response.status === 401 && isRefreshing) {
    // Wait for ongoing refresh to complete
    await new Promise(resolve => refreshQueue.push(resolve));
    response = await fetch(url, { ...options, credentials: 'include' });
  }

  return response;
}
```

---

## Base Configuration

### CORS Settings

The backend allows requests from these origins:

```
http://localhost:3000
http://localhost:3001
https://sjys-expense.pages.dev
```

**Required Headers:**
- `Access-Control-Allow-Credentials: true` ✅ (Enabled)
- `Access-Control-Allow-Origin: <your-origin>` ✅ (Enabled)
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS` ✅ (Enabled)

### Cookie Details

The backend sets these cookies on successful login:

```
Set-Cookie: auth_token=<jwt>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=172800
Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
```

**Cookie Attributes:**
- `HttpOnly` - JavaScript cannot access (security feature)
- `Secure` - Only sent over HTTPS in production
- `SameSite=None` - CSRF protection
- `Max-Age=172800` - Access token expires in 2 days
- `Max-Age=604800` - Refresh token expires in 7 days

**Frontend doesn't need to handle cookie names or values** - the browser manages everything automatically.

### Token Expiry

| Token Type | Duration | Purpose |
|-----------|----------|---------|
| Access Token (`auth_token`) | 2 days (172800 seconds) | Authentication for API requests |
| Refresh Token (`refresh_token`) | 7 days (604800 seconds) | Renewing expired access tokens |

### Response Format

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

## Authentication Endpoints

### POST /api/auth/login

Authenticate with passcode and receive HttpOnly session cookies.

**Rate Limit:** 5 attempts per 15 minutes per IP

**Request:**
```typescript
POST /api/auth/login
Content-Type: application/json
Credentials: include

{
  "passcode": "your-passcode"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "expires_in": 172800,
    "refresh_expires_in": 604800,
    "message": "Login successful"
  }
}
```

**Cookies Set:**
- `auth_token` - HttpOnly session cookie (2 days)
- `refresh_token` - HttpOnly refresh cookie (7 days)

**Error Responses:**

**400 - Missing Passcode:**
```json
{
  "success": false,
  "error": "Passcode is required"
}
```

**401 - Invalid Passcode:**
```json
{
  "success": false,
  "error": "Invalid passcode"
}
```

**429 - Rate Limited:**
```json
{
  "success": false,
  "error": "Too many login attempts",
  "retry_after_seconds": 845
}
```

**Rate Limit Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1737373200
Retry-After: 845 (only on 429)
```

**Frontend Implementation:**
```typescript
async function login(passcode: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passcode })
  });

  if (response.status === 429) {
    const data = await response.json();
    throw new Error(`Too many attempts. Retry in ${data.retry_after_seconds} seconds`);
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Login failed');
  }

  return response.json();
}
```

---

### POST /api/auth/refresh

Refresh expired access token using refresh token cookie.

**Authentication:** None required (uses `refresh_token` cookie automatically)

**Request:**
```typescript
POST /api/auth/refresh
Credentials: include
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "expires_in": 172800,
    "message": "Token refreshed successfully"
  }
}
```

**Cookies Updated:**
- `auth_token` - New access token set (2 days)
- `refresh_token` - Unchanged (not rotated)

**Error Responses:**

**401 - No Refresh Token:**
```json
{
  "success": false,
  "error": "No refresh token provided"
}
```

**401 - Invalid/Expired Refresh Token:**
```json
{
  "success": false,
  "error": "Invalid or expired refresh token"
}
```

**Frontend Implementation:**
```typescript
async function refreshToken() {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  return response.ok;
}
```

**Usage Pattern:**
Call this when ANY API request returns 401. See [Request Queue Pattern](#request-queue-pattern-advanced) above.

---

### POST /api/auth/logout

Logout and clear session cookies.

**Authentication:** Required (must have valid `auth_token`)

**Request:**
```typescript
POST /api/auth/logout
Credentials: include
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Cookies Cleared:**
- `auth_token` - Set to empty with Max-Age=0
- `refresh_token` - Set to empty with Max-Age=0

**Frontend Implementation:**
```typescript
async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always redirect to login
    window.location.href = '/login';
  }
}
```

**Note:** After logout, tokens remain technically valid on the server until expiry (Option 1 tradeoff). For personal use, this is acceptable.

---

## Public Endpoints

These endpoints do NOT require authentication. However, always include `credentials: 'include'` for consistency.

### GET /

Health check endpoint.

**Request:**
```typescript
GET /
```

**Success Response (200):**
```json
{
  "status": "healthy",
  "version": "1.1",
  "timestamp": "2026-02-03T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "healthy"
    }
  }
}
```

**Unhealthy Response (503):**
```json
{
  "status": "unhealthy",
  "version": "1.1",
  "timestamp": "2026-02-03T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "Connection failed"
    }
  }
}
```

---

### Categories

#### GET /api/categories/main

Get all main (parent) categories.

**Authentication:** NOT required (public endpoint)

**Request:**
```typescript
GET /api/categories/main
Credentials: include
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "icon": "utensils",
      "color": "#FF6B6B",
      "has_subcategories": true
    },
    {
      "id": 2,
      "name": "Transportation",
      "icon": "car",
      "color": "#4ECDC4",
      "has_subcategories": false
    }
  ]
}
```

---

#### GET /api/categories/sub/:parentId

Get subcategories for a parent category.

**Authentication:** NOT required (public endpoint)

**Request:**
```typescript
GET /api/categories/sub/1
Credentials: include
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Groceries",
      "parent_id": 1
    },
    {
      "id": 6,
      "name": "Restaurants",
      "parent_id": 1
    }
  ]
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Parent category not found"
}
```

---

#### GET /api/categories/all

Get all categories with full hierarchy information.

**Authentication:** NOT required (public endpoint)

**Request:**
```typescript
GET /api/categories/all
Credentials: include
```

**Response (200):**
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

---

#### GET /api/categories/:id

Get single category by ID.

**Authentication:** NOT required (public endpoint)

**Request:**
```typescript
GET /api/categories/1
Credentials: include
```

**Response (200):**
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

**Error (404):**
```json
{
  "success": false,
  "error": "Category not found"
}
```

---

### Payment Methods

#### GET /api/payment-methods

Get all active payment methods.

**Authentication:** NOT required (public endpoint)

**Request:**
```typescript
GET /api/payment-methods
Credentials: include
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Cash" },
    { "id": 2, "name": "Credit Card" },
    { "id": 3, "name": "Debit Card" },
    { "id": 4, "name": "PayNow" }
  ]
}
```

---

## Protected Endpoints

These endpoints **REQUIRE authentication**. The backend validates the `auth_token` cookie on every request.

**CRITICAL:** Always include `credentials: 'include'` to send the authentication cookie.

### Expenses

#### POST /api/expenses

Create a new expense.

**Authentication:** Required

**Request:**
```typescript
POST /api/expenses
Content-Type: application/json
Credentials: include

{
  "spent_by": "SJ",
  "category_id": 5,
  "payment_method_id": 2,
  "amount": 45.50,
  "expense_date": "2026-02-03",
  "description": "Weekly groceries",
  "currency": "SGD"
}
```

**Request Fields:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `spent_by` | string | Yes | One of: `SJ`, `YS`, `Shared` | Who paid |
| `category_id` | integer | Yes | Must exist in categories table | Category ID |
| `payment_method_id` | integer | Yes | Must exist in payment_methods table | Payment method ID |
| `amount` | number | Yes | Min: 0.01, Max: Number.MAX_SAFE_INTEGER | Expense amount |
| `expense_date` | string | Yes | Format: `YYYY-MM-DD`, Range: 2000-01-01 to +10 years | Date of expense |
| `description` | string | No | Max 500 characters | Optional description |
| `currency` | string | No | Defaults to `SGD` | Currency code |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "spent_by": "SJ",
    "category_id": 5,
    "category_name": "Groceries",
    "parent_category_name": "Food & Dining",
    "main_cat_icon": "utensils",
    "main_cat_color": "#FF6B6B",
    "payment_method_id": 2,
    "payment_method": "Credit Card",
    "amount": 45.50,
    "currency": "SGD",
    "expense_date": "2026-02-03",
    "description": "Weekly groceries",
    "created_at": "2026-02-03T10:30:00.000Z",
    "updated_at": null
  },
  "message": "Expense created successfully"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "amount": "amount must be at least 0.01",
    "expense_date": "expense_date must be a valid date in YYYY-MM-DD format",
    "spent_by": "spent_by must be one of: SJ, YS, Shared"
  }
}
```

**Foreign Key Error (400):**
```json
{
  "success": false,
  "error": "Database constraint violation",
  "details": {
    "constraint": "Invalid category_id or payment_method_id"
  }
}
```

---

#### GET /api/expenses

List expenses with optional filters and pagination.

**Authentication:** Required

**Request:**
```typescript
GET /api/expenses?spent_by=SJ&start_date=2026-01-01&end_date=2026-01-31&limit=20&offset=0
Credentials: include
```

**Query Parameters:**

| Parameter | Type | Required | Default | Validation | Notes |
|-----------|------|----------|---------|------------|-------|
| `spent_by` | string | No | - | One of: `SJ`, `YS`, `Shared` | Filter by spender |
| `category_id` | integer | No | - | Must be positive integer | Filter by category |
| `start_date` | string | No | - | Format: `YYYY-MM-DD` | Filter from date (inclusive) |
| `end_date` | string | No | - | Format: `YYYY-MM-DD` | Filter to date (inclusive) |
| `limit` | integer | No | 50 | Min: 1, Max: 100 | Results per page |
| `offset` | integer | No | 0 | Min: 0 | Pagination offset |

**Response (200):**
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
        "main_cat_icon": "utensils",
        "main_cat_color": "#FF6B6B",
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

**Frontend Pagination:**
```typescript
async function loadExpenses(page: number = 0, limit: number = 20) {
  const offset = page * limit;
  const response = await fetchWithAuth(
    `${API_URL}/api/expenses?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();

  return {
    expenses: data.data.expenses,
    hasMore: data.data.pagination.has_more,
    total: data.data.pagination.total
  };
}
```

---

#### GET /api/expenses/:id

Get single expense by ID.

**Authentication:** Required

**Request:**
```typescript
GET /api/expenses/123
Credentials: include
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "spent_by": "SJ",
    "category_id": 5,
    "category_name": "Groceries",
    "parent_category_name": "Food & Dining",
    "main_cat_icon": "utensils",
    "main_cat_color": "#FF6B6B",
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

**Error (404):**
```json
{
  "success": false,
  "error": "Expense not found"
}
```

---

#### PUT /api/expenses/:id

Update an expense. Only include fields you want to update.

**Authentication:** Required

**Request:**
```typescript
PUT /api/expenses/123
Content-Type: application/json
Credentials: include

{
  "amount": 50.00,
  "description": "Updated description"
}
```

**Updatable Fields:**
- `spent_by`
- `category_id`
- `payment_method_id`
- `amount`
- `expense_date`
- `description`
- `currency`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "spent_by": "SJ",
    "category_id": 5,
    "category_name": "Groceries",
    "parent_category_name": "Food & Dining",
    "main_cat_icon": "utensils",
    "main_cat_color": "#FF6B6B",
    "payment_method_id": 2,
    "payment_method": "Credit Card",
    "amount": 50.00,
    "currency": "SGD",
    "expense_date": "2026-01-20",
    "description": "Updated description",
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-02-03T10:45:00.000Z"
  },
  "message": "Expense updated successfully"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Expense not found"
}
```

---

#### DELETE /api/expenses/:id

Delete an expense.

**Authentication:** Required

**Request:**
```typescript
DELETE /api/expenses/123
Credentials: include
```

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Expense deleted successfully"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Expense not found"
}
```

---

### Dashboard

#### GET /api/dashboard/overview

Get analytics dashboard with spending overview and trends.

**Authentication:** Required

**Request:**
```typescript
// Monthly view
GET /api/dashboard/overview?period=monthly&date=2026-01
Credentials: include

// Yearly view
GET /api/dashboard/overview?period=yearly&date=2026
Credentials: include
```

**Query Parameters:**

| Parameter | Type | Required | Validation | Notes |
|-----------|------|----------|------------|-------|
| `period` | string | Yes | One of: `monthly`, `yearly` | Time period type |
| `date` | string | Yes | `YYYY-MM` (monthly) or `YYYY` (yearly) | Period to analyze |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "date": "2026-01",
    "date_range": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "cards": {
      "total_expenses": {
        "current": 5000.50,
        "previous": 4800.00,
        "change_percentage": 4.2
      },
      "top_category": {
        "category_id": 1,
        "category_name": "Food & Dining",
        "icon": "utensils",
        "color": "#FF6B6B",
        "total": 1500.00,
        "previous_total": 1200.00,
        "change_percentage": 25.0
      },
      "top_spender": {
        "spent_by": "SJ",
        "total": 3000.00,
        "previous_total": 2800.00,
        "change_percentage": 7.1
      }
    },
    "spending_chart": [
      {
        "period": "2026-01",
        "categories": [
          {
            "category_id": 1,
            "category_name": "Food & Dining",
            "color": "#FF6B6B",
            "amount": 500.00
          },
          {
            "category_id": 2,
            "category_name": "Transportation",
            "color": "#4ECDC4",
            "amount": 300.00
          }
        ],
        "total": 800.00
      }
    ],
    "category_ranking": [
      {
        "rank": 1,
        "main_category_id": 1,
        "main_category_name": "Food & Dining",
        "icon": "utensils",
        "color": "#FF6B6B",
        "total": 2000.00,
        "transaction_count": 15,
        "percentage": 40.0
      },
      {
        "rank": 2,
        "main_category_id": 2,
        "main_category_name": "Transportation",
        "icon": "car",
        "color": "#4ECDC4",
        "total": 1500.00,
        "transaction_count": 8,
        "percentage": 30.0
      }
    ]
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "period": "period must be either 'monthly' or 'yearly'",
    "date": "date must be in YYYY-MM format for monthly period"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | When it occurs |
|--------|---------|----------------|
| 200 | OK | Successful GET, PUT, DELETE, POST (auth) |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation failed, invalid input |
| 401 | Unauthorized | Missing/invalid/expired authentication token |
| 403 | Forbidden | CSRF validation failed (wrong origin) |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | Request body exceeds 100KB |
| 429 | Too Many Requests | Rate limit exceeded (login only) |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database connection failed |

### Error Response Formats

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "amount": "amount must be at least 0.01",
    "expense_date": "expense_date must be a valid date in YYYY-MM-DD format",
    "spent_by": "spent_by must be one of: SJ, YS, Shared"
  }
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**CSRF Error (403):**
```json
{
  "success": false,
  "error": "Cross-origin request not allowed"
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

**Database Constraint Error (400):**
```json
{
  "success": false,
  "error": "Database constraint violation",
  "details": {
    "constraint": "Invalid category_id or payment_method_id"
  }
}
```

### Frontend Error Handling

```typescript
async function handleApiCall<T>(
  fetcher: () => Promise<Response>
): Promise<T> {
  try {
    const response = await fetcher();

    // Handle specific error codes
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        return handleApiCall(fetcher);
      } else {
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (response.status === 429) {
      const data = await response.json();
      throw new Error(
        `Too many requests. Retry in ${data.retry_after_seconds} seconds`
      );
    }

    if (response.status === 403) {
      throw new Error('Request blocked by CSRF protection');
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
const expenses = await handleApiCall<ExpenseListResponse>(() =>
  fetch(`${API_URL}/api/expenses`, { credentials: 'include' })
);
```

---

## TypeScript Interfaces

```typescript
// ============================================================================
// Authentication
// ============================================================================

interface LoginRequest {
  passcode: string;
}

interface LoginResponse {
  success: true;
  data: {
    expires_in: number;        // Access token expiry in seconds (172800)
    refresh_expires_in: number; // Refresh token expiry in seconds (604800)
    message: string;
  };
}

interface RefreshResponse {
  success: true;
  data: {
    expires_in: number;
    message: string;
  };
}

interface LogoutResponse {
  success: true;
  data: {
    message: string;
  };
}

// ============================================================================
// Categories
// ============================================================================

interface Category {
  id: number;
  name: string;
  parent_category_id: number | null;
  icon: string | null;
  color: string | null;
  parent_name: string | null;
}

interface MainCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  has_subcategories: boolean;
}

interface SubCategory {
  id: number;
  name: string;
  parent_id: number;
}

interface CategoryResponse {
  success: true;
  data: Category;
}

interface MainCategoriesResponse {
  success: true;
  data: MainCategory[];
}

interface SubCategoriesResponse {
  success: true;
  data: SubCategory[];
}

interface AllCategoriesResponse {
  success: true;
  data: Category[];
}

// ============================================================================
// Payment Methods
// ============================================================================

interface PaymentMethod {
  id: number;
  name: string;
}

interface PaymentMethodsResponse {
  success: true;
  data: PaymentMethod[];
}

// ============================================================================
// Expenses
// ============================================================================

type SpentBy = 'SJ' | 'YS' | 'Shared';

interface ExpenseRequest {
  spent_by: SpentBy;
  category_id: number;
  payment_method_id: number;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  description?: string;
  currency?: string;
}

interface ExpenseUpdateRequest {
  spent_by?: SpentBy;
  category_id?: number;
  payment_method_id?: number;
  amount?: number;
  expense_date?: string; // YYYY-MM-DD
  description?: string;
  currency?: string;
}

interface Expense {
  id: number;
  spent_by: SpentBy;
  category_id: number;
  category_name: string;
  parent_category_name: string | null;
  main_cat_icon: string;
  main_cat_color: string;
  payment_method_id: number;
  payment_method: string;
  amount: number;
  currency: string;
  expense_date: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

interface ExpenseResponse {
  success: true;
  data: Expense;
  message?: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

interface ExpenseListResponse {
  success: true;
  data: {
    expenses: Expense[];
    pagination: Pagination;
  };
}

interface ExpenseFilters {
  spent_by?: SpentBy;
  category_id?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  limit?: number;      // 1-100, default 50
  offset?: number;     // >= 0, default 0
}

// ============================================================================
// Dashboard
// ============================================================================

type DashboardPeriod = 'monthly' | 'yearly';

interface DashboardRequest {
  period: DashboardPeriod;
  date: string; // YYYY-MM or YYYY
}

interface DashboardCard {
  current: number;
  previous: number;
  change_percentage: number;
}

interface TopCategoryCard extends DashboardCard {
  category_id: number;
  category_name: string;
  icon: string;
  color: string;
  total: number;
  previous_total: number;
}

interface TopSpenderCard extends DashboardCard {
  spent_by: string;
  total: number;
  previous_total: number;
}

interface SpendingChartCategory {
  category_id: number;
  category_name: string;
  color: string;
  amount: number;
}

interface SpendingChartPeriod {
  period: string;
  categories: SpendingChartCategory[];
  total: number;
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

interface DashboardResponse {
  success: true;
  data: {
    period: DashboardPeriod;
    date: string;
    date_range: {
      start: string;
      end: string;
    };
    cards: {
      total_expenses: DashboardCard;
      top_category: TopCategoryCard | null;
      top_spender: TopSpenderCard | null;
    };
    spending_chart: SpendingChartPeriod[];
    category_ranking: CategoryRanking[];
  };
}

// ============================================================================
// Health Check
// ============================================================================

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      error?: string;
    };
  };
}

// ============================================================================
// Error Responses
// ============================================================================

interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string> | { constraint?: string };
  retry_after_seconds?: number; // Only for 429 rate limit errors
}

// ============================================================================
// Generic Response
// ============================================================================

type ApiResponse<T> = T | ApiError;

// ============================================================================
// Utility Types
// ============================================================================

// Check if response is an error
function isApiError(response: unknown): response is ApiError {
  return (response as ApiError).success === false;
}

// Example usage:
const response = await fetch('/api/expenses');
const data: ApiResponse<ExpenseListResponse> = await response.json();

if (isApiError(data)) {
  console.error('Error:', data.error);
  if (data.details) {
    console.error('Details:', data.details);
  }
} else {
  console.log('Expenses:', data.data.expenses);
}
```

---

## Security Headers

All responses include these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Cache-Control: no-store
```

---

## Additional Notes

### Date Handling

- **Format:** All dates use `YYYY-MM-DD` format
- **Timezone:** Dates are stored/returned in UTC
- **Validation:** Must be between 2000-01-01 and 10 years in the future

### Validation Rules

- `amount`: 0.01 to Number.MAX_SAFE_INTEGER
- `description`: Max 500 characters, sanitized (null bytes removed)
- `spent_by`: Must be exactly "SJ", "YS", or "Shared" (case-sensitive)
- `limit`: 1 to 100 (pagination)
- `offset`: >= 0 (pagination)

### CSRF Protection

The backend validates the `Origin` or `Referer` header on all state-changing requests (POST, PUT, DELETE). Requests from unauthorized origins will receive a 403 error.

**Allowed Origins:**
- http://localhost:3000
- http://localhost:3001
- https://sjys-expense.pages.dev

### Token Lifecycle Notes

**After logout:**
- Cookies are cleared from browser
- Tokens remain technically valid on backend until expiry
- For personal use with 2 users, this tradeoff is acceptable
- No token revocation database required

**Token refresh strategy:**
- Access token: 2 days (short enough for reasonable security)
- Refresh token: 7 days (user doesn't need to login frequently)
- Refresh token is NOT rotated on refresh (simpler implementation)

---

## Quick Reference

### Most Common Operations

```typescript
// Initialize app and check auth status
const isAuthenticated = await initializeApp();

// Login
await login(passcode);

// Get expenses (current month)
const expenses = await fetchWithAuth(
  `${API_URL}/api/expenses?start_date=2026-02-01&end_date=2026-02-28`
);

// Create expense
await fetchWithAuth(`${API_URL}/api/expenses`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    spent_by: 'SJ',
    category_id: 5,
    payment_method_id: 2,
    amount: 45.50,
    expense_date: '2026-02-03',
    description: 'Groceries'
  })
});

// Get dashboard (monthly)
const dashboard = await fetchWithAuth(
  `${API_URL}/api/dashboard/overview?period=monthly&date=2026-02`
);

// Logout
await logout();
```

### Remember

1. ✅ **Always use `credentials: 'include'`** on every request
2. ✅ **Never store tokens in localStorage** - cookies handle everything
3. ✅ **Handle 401 errors** by refreshing the token automatically
4. ✅ **Redirect to login** if refresh fails
5. ✅ **Clear legacy localStorage tokens** on app initialization

---

**Last Updated:** 2026-02-03
**Backend Version:** 1.1
**Authentication:** HttpOnly Cookies (Option 1 - No Revocation)