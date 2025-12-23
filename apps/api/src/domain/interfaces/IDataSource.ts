import { Db } from 'mongodb';

/**
 * Domain layer - Interface for data source abstraction
 * Defines contract for database operations without implementation details
 */
export interface IDataSource {
  /**
   * Get active database connection
   * @throws Error if database is not connected
   */
  getConnection(): Db;
  
  /**
   * Establish database connection
   */
  connect(): Promise<void>;
  
  /**
   * Close database connection gracefully
   */
  disconnect(): Promise<void>;
  
  /**
   * Check if database is currently connected
   */
  isConnected(): boolean;
}

