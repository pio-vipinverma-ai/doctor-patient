import config from './config/env';
import { createApp } from './server';
import { testConnection, closePool } from './config/database';

// Test database connection before starting server
const startServer = async () => {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('\x1b[31m✗ Failed to connect to database. Please check your configuration.\x1b[0m');
    process.exit(1);
  }

  // Create Express app
  const app = createApp();

  // Start server
  const PORT = config.PORT;

  const server = app.listen(PORT, () => {
    console.log(`\x1b[36m╔════════════════════════════════════════╗\x1b[0m`);
    console.log(`\x1b[36m║   Patient Management System - Backend   ║\x1b[0m`);
    console.log(`\x1b[36m╠════════════════════════════════════════╣\x1b[0m`);
    console.log(`\x1b[32m✓ Server running on port ${PORT}\x1b[0m`);
    console.log(`\x1b[36m✓ Environment: ${config.NODE_ENV}\x1b[0m`);
    console.log(`\x1b[36m✓ CORS enabled for: ${config.FRONTEND_URL}\x1b[0m`);
    console.log(`\x1b[36m✓ Health check: http://localhost:${PORT}/health\x1b[0m`);
    console.log(`\x1b[36m╚════════════════════════════════════════╝\x1b[0m`);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n\x1b[33m⚠ Shutting down gracefully...\x1b[0m');
    server.close(async () => {
      await closePool();
      console.log('\x1b[32m✓ Server closed\x1b[0m');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error: Error) => {
    console.error('\x1b[31m✗ Uncaught Exception:\x1b[0m', error);
    await closePool();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason: any) => {
    console.error('\x1b[31m✗ Unhandled Rejection:\x1b[0m', reason);
    await closePool();
    process.exit(1);
  });
};

// Start the server
startServer().catch((error) => {
  console.error('\x1b[31m✗ Failed to start server:\x1b[0m', error);
  process.exit(1);
});
