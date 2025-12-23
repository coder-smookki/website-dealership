import { Db } from 'mongodb';

export interface IDataSource {
  getConnection(): Db;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

