import mongoose, { ConnectOptions } from 'mongoose';
import { env } from '../config/env.js';

export interface IDataSource {
  getConnection(): typeof mongoose;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
}

export class MongoDataSource implements IDataSource {
  private static instance: MongoDataSource;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): MongoDataSource {
    if (!MongoDataSource.instance) {
      MongoDataSource.instance = new MongoDataSource();
    }
    return MongoDataSource.instance;
  }

  getConnection(): typeof mongoose {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected');
    }
    return mongoose;
  }

  async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) return;
    if (this.connectionPromise) return this.connectionPromise;

    const options: ConnectOptions = {
      autoIndex: env.nodeEnv !== 'production',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    this.connectionPromise = mongoose
      .connect(env.mongodbUri, options)
      .then(() => {
        // Connection successful
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        this.connectionPromise = null;
      });

    return this.connectionPromise;
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === 0) return;
    try {
      await mongoose.disconnect();
    } catch (err) {
      // Log error but don't throw
    }
  }

  async isConnected(): Promise<boolean> {
    return mongoose.connection.readyState === 1;
  }
}

