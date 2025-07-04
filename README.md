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

- **Docker and Docker Compose installed (latest version)**
  
  > **⚠️ Important**: This project uses the `docker compose` command (with a space). If you get a "command not found" error, you're using an older version of Docker. Please update to Docker Desktop 3.6+ or Docker Engine 20.10.13+ which includes Compose V2. Alternatively, you can use `docker-compose` (with a hyphen) if you have the older standalone version.

### Running the Application

1. **Clone the repository and navigate to the project directory**

2. **Build and start the services using Docker Compose:**
   ```bash
   docker compose up --build
   ```

3. **The application will be available at:**
   - **Web Interface**: http://localhost:3000 (Interactive frontend for text analysis)
   - **API**: http://localhost:3000/api (RESTful API endpoints)
   - **MongoDB**: http://localhost:27017
   - **Redis**: http://localhost:6379

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

## Web Interface

🎨 **Modern Frontend Experience**: This application includes a beautiful, responsive web interface that provides an intuitive way to interact with the text analysis features without needing to use curl commands or API clients.

### Frontend Features

- **🔐 User Authentication**: Register new accounts and login with a sleek authentication form
- **📄 Text Management**: Create, edit, and manage your text documents through a user-friendly interface
- **🔍 Real-time Analysis**: Instantly analyze your texts for:
  - Word count
  - Character count (excluding whitespace)
  - Sentence count
  - Paragraph count
  - Longest words per paragraph
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **✨ Modern UI**: Clean, gradient-based design with smooth animations and blur effects

### Using the Web Interface

1. **Start the application** using Docker Compose (as described above)
2. **Open your browser** and navigate to `http://localhost:3000`
3. **Register a new account** or login with existing credentials
4. **Create text documents** and analyze them instantly through the interface
5. **View your text library** with all your saved documents

The web interface provides the same functionality as the REST API but with a much more user-friendly experience for non-technical users or quick testing.

## Documentation

📋 **[Complete API Documentation](./API.md)** - Detailed API guide with examples and all endpoints

### Quick Start

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Register a user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Login and get token
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Create and analyze text (use token from step 3)
curl -X POST http://localhost:3000/api/texts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Sample","content":"Hello world!"}'
```

For complete API documentation with all endpoints, examples, and schemas, see **[API.md](./API.md)**.

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

- ✅ **Modern Web Interface** - Beautiful, responsive frontend with real-time text analysis
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
