import { MongoDataSource } from './datasource.js';

const dataSource = MongoDataSource.getInstance();

export async function connectDatabase(): Promise<void> {
  return dataSource.connect();
}

export function getDatabase() {
  return dataSource.getConnection();
}

export async function closeDatabase(): Promise<void> {
  return dataSource.disconnect();
}
