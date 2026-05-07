# Patient Management System - Backend API

## Project Overview

Backend API for the Patient Management System built with Node.js, Express.js, and TypeScript.

## Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm 8+
- PostgreSQL 14+

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (already created, check configuration):
```bash
# Copy from .env.example if needed
cp .env.example .env.local
```

4. Update environment variables in `.env.local` as needed.

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── server.ts                # Express app configuration
│   ├── config/
│   │   └── env.ts               # Environment variables
│   ├── middleware/
│   │   ├── requestLogger.ts      # HTTP request logging
│   │   └── errorHandler.ts       # Global error handling
│   ├── routes/                  # API routes (to be implemented)
│   ├── controllers/             # Request handlers (to be implemented)
│   ├── services/                # Business logic (to be implemented)
│   ├── models/                  # Data access layer (to be implemented)
│   └── types/                   # TypeScript interfaces (to be implemented)
├── package.json
├── tsconfig.json
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (git ignored)
└── README.md
```

## Available Endpoints

### Health Check
- **GET** `/health` - Server health status
  - Response: `{ status: "ok", timestamp: "...", uptime: ..., environment: "..." }`
  - Status Code: 200

### Root
- **GET** `/` - API information
  - Response: `{ message: "Patient Management System API", version: "1.0.0", timestamp: "..." }`
  - Status Code: 200

## Features Implemented

✅ Express.js server with TypeScript
✅ Environment configuration with dotenv
✅ CORS enabled for frontend (http://localhost:5173)
✅ Request logging middleware (method, path, status, duration)
✅ Global error handling middleware
✅ Health check endpoint for monitoring
✅ Structured error responses in JSON format
✅ Graceful shutdown handling
✅ 404 Not Found handler

## Scripts

- `npm run dev` - Start development server with ts-node and hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm run dev:watch` - Development with nodemon
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Jest

## Environment Configuration

Key environment variables (set in `.env.local`):

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment mode |
| FRONTEND_URL | http://localhost:5173 | Frontend URL for CORS |
| DATABASE_URL | postgresql://... | Database connection string |
| JWT_SECRET | dev-secret | JWT signing secret |
| LOG_LEVEL | info | Logging level |

## Middleware Stack

1. **Trust Proxy** - For reverse proxy compatibility
2. **JSON Parser** - Parse JSON request bodies
3. **CORS** - Cross-origin requests from frontend
4. **Request Logger** - Log all incoming requests
5. **Route Handlers** - API endpoints
6. **404 Handler** - Handle undefined routes
7. **Error Handler** - Catch and format errors

## Error Handling

All errors return structured JSON responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2026-05-07T08:23:49.919Z",
  "requestId": "optional-request-id"
}
```

## Development Tips

### Adding New Routes

Create route files in `src/routes/` and import them in `src/server.ts`:

```typescript
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);
```

### Adding New Middleware

Create middleware in `src/middleware/` and use in `src/server.ts`:

```typescript
app.use(yourMiddleware);
```

### Type Safety

Use TypeScript interfaces for all data structures. Place them in `src/types/`.

## Verification Checklist

✅ Server starts without errors
✅ Health endpoint returns JSON response (status code 200)
✅ Console shows "Server running on port 5000"
✅ Request logs visible in console
✅ CORS headers present in responses
✅ Error middleware catches errors
✅ 404 handler for undefined routes
✅ Environment variables load from .env.local

## Troubleshooting

### Port Already in Use
If port 5000 is in use, change PORT in `.env.local`:
```
PORT=5001
```

### Module Not Found
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
Ensure TypeScript types are properly installed:
```bash
npm install --save-dev @types/express @types/node
```

## Next Steps

The backend infrastructure is complete. Next phase:
1. **Phase 2**: Implement authentication API
2. **Phase 3**: Implement patient management API
3. **Phase 4**: Implement appointment API
4. And so on...

See `../Document/EXECUTION_PROMPTS.md` for step-by-step implementation guides.

## License

ISC

## Author

Patient Management System Team
