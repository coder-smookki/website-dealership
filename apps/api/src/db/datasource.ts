import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { env } from '../config/env.js';

export interface IDataSource {
  getConnection(): Db;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export class MongoDataSource implements IDataSource {
  private static instance: MongoDataSource;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): MongoDataSource {
    if (!MongoDataSource.instance) {
      MongoDataSource.instance = new MongoDataSource();
    }
    return MongoDataSource.instance;
  }

  getConnection(): Db {
    if (!this.db || !this.isConnected()) {
      throw new Error('MongoDB is not connected');
    }
    return this.db;
  }

  async connect(): Promise<void> {
    if (this.isConnected()) return;
    if (this.connectionPromise) return this.connectionPromise;

    const options: MongoClientOptions = {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    this.connectionPromise = (async () => {
      this.client = new MongoClient(env.mongodbUri, options);
      await this.client.connect();
      this.db = this.client.db();
    })()
      .catch((err) => {
        this.client = null;
        this.db = null;
        throw err;
      })
      .finally(() => {
        this.connectionPromise = null;
      });

    return this.connectionPromise;
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.close();
    } finally {
      this.client = null;
      this.db = null;
    }
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }
}
