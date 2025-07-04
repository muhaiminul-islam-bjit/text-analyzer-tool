# API Documentation

## Overview
This document provides comprehensive documentation for the Node.js Authentication API. The API provides user registration and authentication functionality using JWT tokens.

## Base Information
- **Base URL:** `http://localhost:3000`
- **API Version:** 1.0.0
- **Authentication:** JWT Bearer Token
- **Content Type:** `application/json`

## Authentication

### JWT Token
After successful login, you'll receive a JWT token that must be included in subsequent requests requiring authentication.

**Header Format:**
```
Authorization: Bearer <jwt-token>
```

**Token Expiration:** 24 hours

## Endpoints

### 1. Health Check

Check if the API server is running and healthy.

**URL:** `/health`  
**Method:** `GET`  
**Authentication:** Not required

#### Request
```http
GET /health HTTP/1.1
Host: localhost:3000
```

#### Response
**Success (200 OK):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

#### Example
```bash
curl -X GET http://localhost:3000/health
```

---

### 2. User Registration

Register a new user account in the system.

**URL:** `/api/users/register`  
**Method:** `POST`  
**Authentication:** Not required

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

#### Request Body Parameters
| Parameter | Type   | Required | Description                    | Constraints        |
|-----------|--------|----------|--------------------------------|--------------------|
| email     | string | Yes      | User's email address           | Valid email format |
| password  | string | Yes      | User's password                | Minimum 6 characters |

#### Response

**Success (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "email": "string"
  }
}
```

**Error (400 Bad Request) - Validation Error:**
```json
{
  "error": "\"email\" must be a valid email"
}
```

**Error (400 Bad Request) - User Exists:**
```json
{
  "error": "User already exists with this email"
}
```

#### Examples

**Successful Registration:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "674d2f8e9b1c8a3d4e5f6789",
    "email": "john.doe@example.com"
  }
}
```

---

### 3. User Login

Authenticate a user and receive a JWT token for subsequent requests.

**URL:** `/api/users/login`  
**Method:** `POST`  
**Authentication:** Not required

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

#### Request Body Parameters
| Parameter | Type   | Required | Description          | Constraints        |
|-----------|--------|----------|----------------------|--------------------|
| email     | string | Yes      | User's email address | Valid email format |
| password  | string | Yes      | User's password      | Any length         |

#### Response

**Success (200 OK):**
```json
{
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string"
  }
}
```

**Error (400 Bad Request) - Validation Error:**
```json
{
  "error": "\"email\" is required"
}
```

**Error (401 Unauthorized) - Invalid Credentials:**
```json
{
  "error": "Invalid email or password"
}
```

#### Examples

**Successful Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzRkMmY4ZTliMWM4YTNkNGU1ZjY3ODkiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNzMzMTQ4NTU4LCJleHAiOjE3MzMyMzQ5NTh9.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "user": {
    "id": "674d2f8e9b1c8a3d4e5f6789",
    "email": "john.doe@example.com"
  }
}
```

---

### 4. Get All Users

Retrieve a list of all registered users in the system.

**URL:** `/api/users/`  
**Method:** `GET`  
**Authentication:** Required (JWT Bearer Token)

#### Request Headers
```
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200 OK):**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "string",
      "email": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "count": "number"
}
```

**Error (401 Unauthorized) - Missing Token:**
```json
{
  "error": "Access token required"
}
```

**Error (403 Forbidden) - Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

#### Examples

**Successful Request:**
```bash
curl -X GET http://localhost:3000/api/users/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "674d2f8e9b1c8a3d4e5f6789",
      "email": "john.doe@example.com",
      "createdAt": "2024-12-02T10:30:00.000Z",
      "updatedAt": "2024-12-02T10:30:00.000Z"
    },
    {
      "id": "674d2f8e9b1c8a3d4e5f6790",
      "email": "jane.smith@example.com",
      "createdAt": "2024-12-02T09:15:00.000Z",
      "updatedAt": "2024-12-02T09:15:00.000Z"
    }
  ],
  "count": 2
}
```

**Request without token:**
```bash
curl -X GET http://localhost:3000/api/users/
```

**Response:**
```json
{
  "error": "Access token required"
}
```

## Error Responses

### Standard Error Format
All error responses follow a consistent format:

```json
{
  "error": "Error description message"
}
```

### HTTP Status Codes

| Code | Description                  | When it occurs                           |
|------|------------------------------|------------------------------------------|
| 200  | OK                          | Request successful                       |
| 201  | Created                     | Resource created successfully            |
| 400  | Bad Request                 | Invalid request data or validation error |
| 401  | Unauthorized                | Invalid credentials or missing token     |
| 403  | Forbidden                   | Invalid or expired JWT token             |
| 404  | Not Found                   | Endpoint not found                       |
| 500  | Internal Server Error       | Server-side error                        |

### Common Error Scenarios

#### Validation Errors (400)
- Missing required fields
- Invalid email format
- Password too short (less than 6 characters)

```json
{
  "error": "\"password\" length must be at least 6 characters long"
}
```

#### Authentication Errors (401/403)
- Invalid email or password during login
- Missing JWT token in protected routes
- Expired or invalid JWT token

```json
{
  "error": "Invalid email or password"
}
```

```json
{
  "error": "Access token required"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

#### Business Logic Errors (400)
- Attempting to register with an existing email

```json
{
  "error": "User already exists with this email"
}
```

## Data Models

### User Object
```json
{
  "id": "string",
  "email": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Note:** The password field is never returned in API responses for security reasons.

### JWT Token Payload
```json
{
  "userId": "string",
  "email": "string",
  "iat": "number",
  "exp": "number"
}
```

## Testing the API

### Using cURL

**1. Test Health Check:**
```bash
curl -X GET http://localhost:3000/health
```

**2. Register a New User:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**3. Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**4. Get All Users (with JWT token from login):**
```bash
curl -X GET http://localhost:3000/api/users/ \
  -H "Authorization: Bearer <your-jwt-token-here>"
```

### Using Postman

1. **Import Collection:** Create a new collection in Postman
2. **Set Base URL:** Configure `{{baseUrl}}` variable as `http://localhost:3000`
3. **Add Requests:** Create requests for each endpoint with proper headers and body
4. **Test Workflow:** Register → Login → Save token → Use token for protected endpoints (Get All Users)
5. **Authorization:** For protected routes, add the JWT token in the Authorization tab as "Bearer Token"

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Original passwords are never stored or returned

### JWT Security
- Tokens expire after 24 hours
- Tokens are signed with a secret key (configure `JWT_SECRET` environment variable)
- For production, use a strong, random secret key

### Input Validation
- All inputs are validated using Joi schemas
- Email format validation
- Password length requirements

