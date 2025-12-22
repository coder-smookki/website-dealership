import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  phone: string;
  email: string;
  address: string;
  workHours: string;
  slogan: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    phone: {
      type: String,
      default: '+7 495 266 7524',
    },
    email: {
      type: String,
      default: 'info@car-shop.ru',
    },
    address: {
      type: String,
      default: 'Москва, ул. Примерная, д. 1',
    },
    workHours: {
      type: String,
      default: 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
    },
    slogan: {
      type: String,
      default: 'SMK Dealership',
    },
  },
  {
    timestamps: true,
  }
);

// Singleton pattern - только один документ настроек
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

