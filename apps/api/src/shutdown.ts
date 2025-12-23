import { closeDatabase } from './db/client.js';

type ShutdownHandler = () => Promise<void>;

class ShutdownManager {
  private handlers: ShutdownHandler[] = [];
  private isShuttingDown = false;

  register(handler: ShutdownHandler): void {
    this.handlers.push(handler);
  }

  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log(`Received ${signal}, starting graceful shutdown...`);
    
    // Выполняем все зарегистрированные обработчики
    for (const handler of this.handlers) {
      try {
        await handler();
      } catch (error) {
        console.error('Error during shutdown handler:', error);
      }
    }
    
    // Закрываем БД в последнюю очередь
    try {
      await closeDatabase();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
    
    console.log('Shutdown complete');
    process.exit(0);
  }
}

const shutdownManager = new ShutdownManager();

export function registerShutdownHandler(handler: ShutdownHandler): void {
  shutdownManager.register(handler);
}

process.on('SIGTERM', () => shutdownManager.shutdown('SIGTERM'));
process.on('SIGINT', () => shutdownManager.shutdown('SIGINT'));

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  shutdownManager.shutdown('unhandledRejection');
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  shutdownManager.shutdown('uncaughtException');
});

