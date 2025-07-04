# Node.js Text Analysis App

A Node.js text analysis application with user authentication and comprehensive text analytics functionality using clean architecture.

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **MongoDB** for data persistence
- **Redis** for caching
- **JWT** for authentication
- **Winston** for logging
- **Docker** for containerization

## Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── User.ts                # User domain model
│   │   └── Text.ts                # Text domain model
│   └── repositories/
│       ├── UserRepository.ts      # User repository interface
│       └── TextRepository.ts      # Text repository interface
├── application/
│   ├── UserService.ts             # User business logic
│   ├── TextService.ts             # Text business logic
│   └── TextAnalyzer.ts            # Text analysis logic
├── infrastructure/
│   ├── database/
│   │   ├── models/
│   │   │   ├── UserModel.ts       # MongoDB user model
│   │   │   └── TextModel.ts       # MongoDB text model
│   │   └── mongoose.ts            # Database connection
│   ├── repositories/
│   │   ├── MongoUserRepository.ts # User repository implementation
│   │   └── MongoTextRepository.ts # Text repository implementation
│   ├── cache/
│   │   └── redis.ts               # Redis connection
│   └── logging/
│       └── logger.ts              # Winston logger setup
└── presentation/
    ├── controllers/
    │   ├── UserController.ts      # HTTP user request handlers
    │   └── TextController.ts      # HTTP text request handlers
    ├── routes/
    │   ├── userRoutes.ts          # User route definitions
    │   └── textRoutes.ts          # Text route definitions
    └── validation/
        ├── userValidation.ts      # User input validation schemas
        └── textValidation.ts      # Text input validation schemas
```

## Setup and Running

### Prerequisites

- Docker and Docker Compose installed

### Running the Application

1. **Clone the repository and navigate to the project directory**

2. **Build and start the services using Docker Compose:**
   ```bash
   docker compose up --build
   ```

3. **The application will be available at:**
   - API: http://localhost:3000
   - MongoDB: http://localhost:27017
   - Redis: http://localhost:6379

### Quick Test Commands

**Run all tests:**
```bash
docker compose -f docker-compose.test.yml up --build app-test --abort-on-container-exit
```

**Run tests with coverage:**
```bash
docker compose -f docker-compose.test.yml up --build app-test-coverage --abort-on-container-exit
```

**Or use the test script (recommended):**
```bash
./test.sh run       # Run all tests
./test.sh coverage  # Run with coverage
./test.sh watch     # Run in watch mode
./test.sh cleanup   # Clean up containers
```

## Documentation

- **[Detailed API Documentation](./API.md)** - Comprehensive API guide with examples
- **[OpenAPI Specification](./openapi.yaml)** - Machine-readable API specification for tools like Swagger UI
- **[Project README](./README.md)** - This file with setup and basic usage

### Viewing API Documentation

You can view the interactive API documentation using Swagger UI:

1. **Online Swagger Editor:**
   - Go to [editor.swagger.io](https://editor.swagger.io/)
   - Copy and paste the contents of `openapi.yaml`

2. **Local Swagger UI (Optional):**
   ```bash
   npx swagger-ui-serve openapi.yaml
   ```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
This API uses JWT (JSON Web Tokens) for authentication. After successful login, include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### 1. Health Check
**Endpoint:** `GET /health`

**Description:** Check if the server is running and healthy.

**Request:**
```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

#### 2. User Registration
**Endpoint:** `POST /api/users/register`

**Description:** Register a new user account.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Body Schema:**
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 6 characters

**Success Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
```json
// Validation Error (400)
{
  "error": "\"email\" must be a valid email"
}

// User Already Exists (400)
{
  "error": "User already exists with this email"
}
```

**Status Codes:**
- `201 Created` - User registered successfully
- `400 Bad Request` - Validation error or user already exists

---

#### 3. User Login
**Endpoint:** `POST /api/users/login`

**Description:** Authenticate user and receive JWT token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Body Schema:**
- `email` (string, required): Valid email address
- `password` (string, required): User's password

**Success Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
```json
// Validation Error (400)
{
  "error": "\"email\" is required"
}

// Invalid Credentials (401)
{
  "error": "Invalid email or password"
}
```

**Status Codes:**
- `200 OK` - Login successful
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid credentials

---

#### 4. Text Management
**Endpoint:** `POST /api/texts`

**Description:** Create a new text for analysis. Requires authentication.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Sample Text",
  "content": "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun."
}
```

**Success Response:**
```json
{
  "message": "Text created successfully",
  "text": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Sample Text",
    "content": "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.",
    "createdAt": "2023-07-05T10:00:00.000Z",
    "updatedAt": "2023-07-05T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created` - Text created successfully
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required

---

#### 5. Get All User Texts
**Endpoint:** `GET /api/texts`

**Description:** Retrieve all texts for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "message": "Texts retrieved successfully",
  "texts": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Sample Text",
      "content": "The quick brown fox jumps over the lazy dog...",
      "createdAt": "2023-07-05T10:00:00.000Z",
      "updatedAt": "2023-07-05T10:00:00.000Z"
    }
  ]
}
```

---

#### 6. Text Analysis - Word Count
**Endpoint:** `GET /api/texts/:id/words`

**Description:** Get the word count for a specific text.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "textId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "wordCount": 15
}
```

---

#### 7. Text Analysis - Character Count
**Endpoint:** `GET /api/texts/:id/characters`

**Description:** Get the character count (excluding whitespace) for a specific text.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "textId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "characterCount": 60
}
```

---

#### 8. Text Analysis - Sentence Count
**Endpoint:** `GET /api/texts/:id/sentences`

**Description:** Get the sentence count for a specific text.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "textId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "sentenceCount": 2
}
```

---

#### 9. Text Analysis - Paragraph Count
**Endpoint:** `GET /api/texts/:id/paragraphs`

**Description:** Get the paragraph count for a specific text.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "textId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "paragraphCount": 1
}
```

---

#### 10. Text Analysis - Longest Words
**Endpoint:** `GET /api/texts/:id/longest-words`

**Description:** Get the longest words in each paragraph of the text.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "textId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "longestWords": ["quick", "brown", "jumps", "slept"]
}
```

---

#### 11. Complete Text Analysis
**Endpoint:** `GET /api/texts/:id/analysis`

**Description:** Get complete analysis including all metrics for a specific text.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "textId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "analysis": {
    "wordCount": 15,
    "characterCount": 60,
    "sentenceCount": 2,
    "paragraphCount": 1,
    "longestWords": ["quick", "brown", "jumps", "slept"]
  }
}
```

---

#### 12. Update Text
**Endpoint:** `PUT /api/texts/:id`

**Description:** Update an existing text. Requires authentication and ownership.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content here."
}
```

**Status Codes:**
- `200 OK` - Text updated successfully
- `400 Bad Request` - Validation error
- `403 Forbidden` - Unauthorized access
- `404 Not Found` - Text not found

---

#### 13. Delete Text
**Endpoint:** `DELETE /api/texts/:id`

**Description:** Delete a text. Requires authentication and ownership.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:**
```json
{
  "message": "Text deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Text deleted successfully
- `403 Forbidden` - Unauthorized access
- `404 Not Found` - Text not found

---

### Text Analysis Rules

The text analysis follows these rules:
- **Words**: Split by whitespace, case-insensitive, punctuation removed
- **Characters**: Count excluding whitespace and punctuation
- **Sentences**: Split by `.`, `!`, `?` punctuation
- **Paragraphs**: Split by double newlines or more
- **Longest Words**: One longest word per paragraph, duplicates removed across paragraphs

---

### Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

### Testing the API

**1. Check if the server is running:**
```bash
curl http://localhost:3000/health
```

**2. Register a new user:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**3. Login with the user:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**4. Create a text for analysis:**
```bash
curl -X POST http://localhost:3000/api/texts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Sample Text","content":"The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun."}'
```

**5. Analyze the text:**
```bash
# Get word count
curl -X GET http://localhost:3000/api/texts/TEXT_ID/words \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get character count
curl -X GET http://localhost:3000/api/texts/TEXT_ID/characters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get full analysis
curl -X GET http://localhost:3000/api/texts/TEXT_ID/analysis \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Stopping the Application

```bash
docker compose down
```

To remove volumes (database data):
```bash
docker compose down -v
```

## Testing

This project includes a comprehensive test suite using Jest and Supertest, running in isolated Docker containers with health checks to ensure reliable test execution.

### Quick Test Commands

**Run all tests (recommended):**
```bash
docker compose -f docker-compose.test.yml up --build app-test --abort-on-container-exit
```

**Run tests with coverage:**
```bash
docker compose -f docker-compose.test.yml up --build app-test-coverage --abort-on-container-exit
```

**Run tests in watch mode (for development):**
```bash
docker compose -f docker-compose.test.yml up --build app-test-watch
```

**Using the test script (easier):**
```bash
./test.sh run      # Run all tests once
./test.sh coverage # Run with coverage report
./test.sh watch    # Run in watch mode
./test.sh cleanup  # Clean up test containers
```

### Test Suite Overview

The test suite covers all major functionality:

- ✅ **Health Check** - Server availability and basic connectivity
- ✅ **User Registration** - Input validation, duplicate prevention, password hashing
- ✅ **User Authentication** - Login validation, JWT generation, credential verification
- ✅ **Protected Routes** - Authorization middleware, JWT validation
- ✅ **Integration Tests** - Complete user flows and API interaction
- ✅ **Error Handling** - Proper error responses and status codes

### Test Environment

**Technology Stack:**
- **Jest** - Testing framework with extensive matchers
- **Supertest** - HTTP testing library for API endpoints
- **Docker Compose** - Isolated test environment
- **MongoDB** - Real database (not in-memory) for better test reliability
- **Redis** - Caching layer for complete integration testing

**Environment Configuration:**
- Tests run in isolated Docker containers
- Fresh database for each test run
- Health checks ensure services are ready before tests start
- Automatic cleanup between test cases

### Understanding Test Output

**Successful test run example:**
```
✓ Health endpoint should return OK status
✓ User registration should create new user successfully
✓ User registration should reject invalid email
✓ User login should return JWT token
✓ Protected route should require valid token
✓ Integration test should handle complete user flow

Test Suites: 6 passed, 6 total
Tests:       15+ passed, 15+ total
```

**With coverage report:**
```
File                     | % Stmts | % Branch | % Funcs | % Lines |
-------------------------|---------|----------|---------|---------|
All files               |   95.2  |   88.1   |   100   |   94.8  |
```

### Local Testing (Alternative)

If you prefer running tests locally without Docker:

**Prerequisites:**
- Node.js 18+
- MongoDB and Redis running locally

**Commands:**
```bash
npm install
npm test                # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage report
```

### Continuous Integration

For CI/CD pipelines, use the following commands:

```bash
# In your CI pipeline
docker compose -f docker-compose.test.yml up --build app-test-coverage --abort-on-container-exit
docker compose -f docker-compose.test.yml down -v
```

### Troubleshooting Tests

**Common Issues and Solutions:**

**1. Tests timeout or hang:**
```bash
# Clean up any existing containers
docker compose -f docker-compose.test.yml down -v

# Ensure ports are available (27018, 6380)
docker ps | grep -E "(27018|6380)"

# Run with verbose output
docker compose -f docker-compose.test.yml up --build app-test
```

**2. Database connection errors:**
```bash
# Check if MongoDB test container is healthy
docker compose -f docker-compose.test.yml ps

# View container logs
docker compose -f docker-compose.test.yml logs mongodb-test
```

**3. Redis connection issues:**
```bash
# Check Redis container status
docker compose -f docker-compose.test.yml logs redis-test

# Verify Redis connectivity
docker exec -it nodejs-project-text-search-redis-test-1 redis-cli ping
```

**4. Build issues:**
```bash
# Force rebuild without cache
docker compose -f docker-compose.test.yml build --no-cache app-test

# Clean up Docker system
docker system prune -f
```

**5. Permission issues (macOS/Linux):**
```bash
# Make test script executable
chmod +x test.sh

# Fix Docker permissions
sudo chown -R $USER:$USER .
```

### Test Configuration

The test setup automatically:
- Starts MongoDB and Redis containers with health checks
- Waits for services to be fully ready
- Creates isolated test database
- Runs all test files in the `tests/` directory
- Cleans up database state between tests
- Provides detailed error reporting

**Environment Variables (Test):**
```env
NODE_ENV=test
JWT_SECRET=test-secret-key-for-testing
MONGODB_URI=mongodb://test:test@mongodb-test:27017/test?authSource=admin
REDIS_URL=redis://redis-test:6379
```

## Environment Variables

The following environment variables are configured in docker-compose.yml:

- `NODE_ENV`: Application environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT token generation

## Architecture

This project follows **Clean Architecture** principles:

- **Domain Layer**: Contains business entities and repository interfaces
- **Application Layer**: Contains business logic and use cases
- **Infrastructure Layer**: Contains external dependencies (database, cache, logging)
- **Presentation Layer**: Contains HTTP handlers, routes, and validation

## Features

- ✅ User registration with email validation
- ✅ Password hashing with bcrypt
- ✅ User authentication with JWT tokens
- ✅ Input validation with Joi
- ✅ Error handling and logging
- ✅ Clean architecture separation
- ✅ Docker containerization
- ✅ MongoDB for data persistence
- ✅ Redis for caching (ready for future use)
- ✅ **Text Analysis System** - Complete CRUD operations for texts
- ✅ **Word Count Analysis** - Count words in any text
- ✅ **Character Count Analysis** - Count characters (excluding whitespace)
- ✅ **Sentence Count Analysis** - Count sentences based on punctuation
- ✅ **Paragraph Count Analysis** - Count paragraphs based on line breaks
- ✅ **Longest Words Analysis** - Find longest words in each paragraph
- ✅ **Protected Routes** - All text operations require authentication
- ✅ **User Isolation** - Users can only access their own texts
- ✅ **Comprehensive Testing** - TDD approach with full test coverage
