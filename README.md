# Node.js Text Analysis App

A Node.js text analysis application with user authentication and comprehensive text analytics functionality using clean architecture.

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **MongoDB** for data persistence
- **Redis** for caching and rate limiting
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
│   │   ├── CacheService.ts        # Redis caching service
│   │   └── redis.ts               # Redis connection
│   └── logging/
│       └── logger.ts              # Winston logger setup
└── presentation/
    ├── controllers/
    │   ├── UserController.ts      # HTTP user request handlers
    │   └── TextController.ts      # HTTP text request handlers
    ├── middleware/
    │   ├── authMiddleware.ts      # JWT authentication middleware
    │   └── rateLimitMiddleware.ts # Rate limiting middleware
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

## Rate Limiting & API Throttling

🛡️ **Enterprise-Grade Rate Limiting**: The application features a sophisticated throttling system built on Redis that provides comprehensive protection against API abuse while ensuring optimal performance for legitimate users.

### Advanced Throttling Features

- **🔒 Redis-Backed Distributed Limiting**: Scalable rate limiting across multiple server instances
- **🎯 Intelligent Endpoint-Specific Limits**: Granular throttling based on operation type and resource intensity
- **👤 Dual-Mode Identification**: Smart switching between user-based and IP-based limiting
- **🌐 Geographic IP Tracking**: Accurate client identification with proxy support
- **📊 Standard Rate Limit Headers**: RFC-compliant headers for client awareness
- **🔄 Fail-Open Architecture**: Graceful degradation when Redis is unavailable
- **📝 Detailed Audit Logging**: Complete violation tracking for security monitoring
- **⚡ Sliding Window Algorithm**: Precise request counting with time-based windows
- **🚦 Toast Notifications**: User-friendly frontend rate limit alerts

### Throttling Configuration by Endpoint

**🔐 Authentication Endpoints (Strict Security):**
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per 1 hour per IP
- Protection against brute force and spam registration attacks

**Text Analysis Operations:**
- **10 analysis requests per 5 minutes** per user
- CPU-intensive operations require tighter limits

**📝 Text Management Operations (User-Scoped):**
- **CRUD Operations**: 20 requests per 10 minutes per authenticated user
- **Covers**: Create, update, delete text documents
- Prevents content spam while allowing normal usage

**🔍 General API Access (Baseline Protection):**
- **All Endpoints**: 100 requests per 15 minutes per IP address
- **Health Checks**: 30 requests per 1 minute per IP (monitoring-friendly)
- Comprehensive baseline protection layer


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
- ✅ **API Rate Limiting & Throttling** - Enterprise-grade rate limiting with Redis backend
- ✅ Input validation with Joi
- ✅ Error handling and logging
- ✅ Clean architecture separation
- ✅ Docker containerization
- ✅ MongoDB for data persistence
- ✅ **Redis Caching System** - Intelligent caching with content change detection
- ✅ **Text Analysis System** - Complete CRUD operations for texts
- ✅ **Word Count Analysis** - Count words in any text
- ✅ **Character Count Analysis** - Count characters (excluding whitespace)
- ✅ **Sentence Count Analysis** - Count sentences based on punctuation
- ✅ **Paragraph Count Analysis** - Count paragraphs based on line breaks
- ✅ **Longest Words Analysis** - Find longest words in each paragraph
- ✅ **Protected Routes** - All text operations require authentication
- ✅ **User Isolation** - Users can only access their own texts
- ✅ **Comprehensive Testing** - TDD approaches with a full test coverage
