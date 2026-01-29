# Expense Tracker API Design Document

## Overview
Backend application for expense tracking with CRUD operations using Node.js (LTS) and Express.

**Level**: POC (Proof of Concept)

---

## Technology Stack
- **Runtime**: Node.js (LTS - v20.x)
- **Framework**: Express.js (v4.x)
- **Database**: In-memory (Array) for POC
- **Data Format**: JSON

### Dependencies

#### Production Dependencies
| Package | Version | Purpose |
|---------|---------|----------|
| express | ^4.19.2 | Web framework for building REST APIs |
| uuid | ^10.0.0 | Generate unique IDs for expense records |
| cors | ^2.8.5 | Enable Cross-Origin Resource Sharing |
| dotenv | ^16.4.5 | Load environment variables from .env file |

#### Development Dependencies
| Package | Version | Purpose |
|---------|---------|----------|
| nodemon | ^3.1.4 | Auto-restart server on file changes during development |

### Dependency Selection Rationale

**express (^4.19.2)**:
- Latest stable v4.x release
- Fully compatible with Node.js 20 LTS
- v5.x is still in beta, so v4.x is production-ready choice
- No breaking changes from earlier 4.x versions

**uuid (^10.0.0)**:
- Latest major version with ESM and CommonJS support
- No conflicts with Node.js 20
- Provides RFC4122 compliant UUIDs
- v9.x to v10.x migration is seamless (no breaking changes for basic usage)

**cors (^2.8.5)**:
- Stable and widely used
- No known conflicts with Express 4.x
- Essential for POC if frontend will be on different origin

**dotenv (^16.4.5)**:
- Latest stable version
- Compatible with Node.js 20
- Follows security best practices for environment variables
- v16.x has improved parsing and error handling

**nodemon (^3.1.4)**:
- Latest version with Node.js 20 support
- v3.x includes performance improvements
- Dev dependency only, not needed in production

### Conflict Resolution

**No conflicts identified** - All selected packages are:
1. Compatible with Node.js 20 LTS
2. Compatible with each other (no peer dependency conflicts)
3. Actively maintained with recent updates
4. Using semantic versioning with caret (^) for minor/patch updates

### Version Strategy
- Using caret (^) ranges to allow backward-compatible updates
- Locked to specific major versions to prevent breaking changes
- All packages tested and verified for Node.js 20 LTS compatibility

---

## Data Model

### Expense Entity
```json
{
  "id": "string (UUID)",
  "title": "string",
  "amount": "number",
  "category": "string",
  "date": "string (ISO 8601)",
  "description": "string (optional)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

---

## 1. Create Expense

**Endpoint**: `POST /expenses`

**Description**: Create a new expense entry

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Grocery Shopping",
  "amount": 150.50,
  "category": "Food",
  "date": "2024-01-15",
  "description": "Weekly groceries"
}
```

**Validation Rules**:
- `title`: Required, string, min 3 chars, max 100 chars
- `amount`: Required, number, must be positive
- `category`: Required, string
- `date`: Required, valid date format
- `description`: Optional, string, max 500 chars

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Grocery Shopping",
    "amount": 150.50,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "description": "Weekly groceries",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Expense created successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a positive number"
      }
    ]
  }
}
```

---

## 2. Get All Expenses

**Endpoint**: `GET /expenses`

**Description**: Retrieve all expenses with optional filtering and pagination

**Query Parameters**:
- `category` (optional): Filter by category
- `startDate` (optional): Filter expenses from this date
- `endDate` (optional): Filter expenses until this date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (default: date)
- `order` (optional): asc or desc (default: desc)

**Example Request**:
```
GET /expenses?category=Food&startDate=2024-01-01&limit=20&sortBy=amount&order=desc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Grocery Shopping",
      "amount": 150.50,
      "category": "Food",
      "date": "2024-01-15T00:00:00.000Z",
      "description": "Weekly groceries",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Invalid query parameters"
  }
}
```

---

## 3. Get Expense by ID

**Endpoint**: `GET /expenses/:id`

**Description**: Retrieve a single expense by ID

**Path Parameters**:
- `id`: Expense UUID

**Example Request**:
```
GET /expenses/550e8400-e29b-41d4-a716-446655440000
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Grocery Shopping",
    "amount": 150.50,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "description": "Weekly groceries",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Expense not found"
  }
}
```

---

## 4. Update Expense

**Endpoint**: `PUT /expenses/:id`

**Description**: Update an existing expense (full update)

**Path Parameters**:
- `id`: Expense UUID

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Grocery Shopping - Updated",
  "amount": 175.75,
  "category": "Food",
  "date": "2024-01-15",
  "description": "Weekly groceries with extras"
}
```

**Validation Rules**: Same as Create Expense

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Grocery Shopping - Updated",
    "amount": 175.75,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "description": "Weekly groceries with extras",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  },
  "message": "Expense updated successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Expense not found"
  }
}
```

---

## 5. Partial Update Expense

**Endpoint**: `PATCH /expenses/:id`

**Description**: Partially update an expense (update specific fields)

**Path Parameters**:
- `id`: Expense UUID

**Request Headers**:
```
Content-Type: application/json
```

**Request Body** (any combination of fields):
```json
{
  "amount": 200.00
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Grocery Shopping",
    "amount": 200.00,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "description": "Weekly groceries",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Expense updated successfully"
}
```

---

## 6. Delete Expense

**Endpoint**: `DELETE /expenses/:id`

**Description**: Delete an expense by ID

**Path Parameters**:
- `id`: Expense UUID

**Example Request**:
```
DELETE /expenses/550e8400-e29b-41d4-a716-446655440000
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Expense not found"
  }
}
```

---

## 7. Get Expense Summary

**Endpoint**: `GET /expenses/summary/stats`

**Description**: Get aggregated expense statistics

**Query Parameters**:
- `startDate` (optional): Start date for summary
- `endDate` (optional): End date for summary
- `category` (optional): Filter by category

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalExpenses": 1250.75,
    "totalCount": 15,
    "averageExpense": 83.38,
    "categoryBreakdown": [
      {
        "category": "Food",
        "total": 450.50,
        "count": 5
      },
      {
        "category": "Transport",
        "total": 300.25,
        "count": 4
      }
    ],
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

---

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input/validation error |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": []
  }
}
```

---

## Common Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Resource not found |
| INVALID_QUERY | Invalid query parameters |
| SERVER_ERROR | Internal server error |

---

## RESTful Design Principles Applied

1. **Resource-based URLs**: `/expenses` as the main resource
2. **HTTP Methods**: Proper use of GET, POST, PUT, PATCH, DELETE
3. **Stateless**: Each request contains all necessary information
4. **JSON Format**: Consistent JSON request/response format
5. **HTTP Status Codes**: Appropriate status codes for different scenarios
6. **Versioning**: API versioned as `/api/v1`
7. **Plural Nouns**: Using `/expenses` instead of `/expense`
8. **Filtering & Pagination**: Query parameters for filtering and pagination

---

## Project Structure

```
expense-tracker/
├── src/
│   ├── controllers/
│   │   └── expenseController.js
│   ├── routes/
│   │   └── expenseRoutes.js
│   ├── models/
│   │   └── expenseModel.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/
│   │   └── response.js
│   └── app.js
├── server.js
├── package.json
└── .gitignore
```

---

## Coding Standards

1. **Naming Conventions**:
   - camelCase for variables and functions
   - PascalCase for classes
   - UPPER_CASE for constants

2. **Code Organization**:
   - Separate concerns (routes, controllers, models)
   - Single responsibility principle
   - DRY (Don't Repeat Yourself)

3. **Error Handling**:
   - Centralized error handling middleware
   - Consistent error response format
   - Proper HTTP status codes

4. **Validation**:
   - Input validation for all endpoints
   - Sanitize user inputs
   - Type checking

5. **Response Format**:
   - Consistent JSON structure
   - Include success flag
   - Meaningful messages

---

## Future Enhancements (Out of POC Scope)

- Authentication & Authorization
- Database integration (MongoDB/PostgreSQL)
- Rate limiting
- Logging
- Unit & Integration tests
- API documentation (Swagger/OpenAPI)
- Environment configuration
- CORS configuration
- Request validation middleware (express-validator)
