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
    console.log(`Получен сигнал ${signal}, начинается корректное завершение...`);
    
    for (const handler of this.handlers) {
      try {
        await handler();
      } catch (error) {
        console.error('Ошибка при выполнении обработчика завершения:', error);
      }
    }
    
    try {
      await closeDatabase();
      console.log('Соединение с базой данных закрыто');
    } catch (error) {
      console.error('Ошибка закрытия базы данных:', error);
    }
    
    console.log('Завершение выполнено');
    process.exit(0);
  }
}

const shutdownManager = new ShutdownManager();

export function registerShutdownHandler(handler: ShutdownHandler): void {
  shutdownManager.register(handler);
}

process.on('SIGTERM', () => shutdownManager.shutdown('SIGTERM'));
process.on('SIGINT', () => shutdownManager.shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Необработанное отклонение промиса:', reason);
  shutdownManager.shutdown('unhandledRejection');
});

process.on('uncaughtException', (error: Error) => {
  console.error('Необработанное исключение:', error);
  shutdownManager.shutdown('uncaughtException');
});

