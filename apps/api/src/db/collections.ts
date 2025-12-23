import { User } from '../models/User.js';
import { Car } from '../models/Car.js';
import { Lead } from '../models/Lead.js';
import { Settings } from '../models/Settings.js';

// Экспортируем модели для использования в сервисах
export { User, Car, Lead, Settings };

// Хелперы для получения моделей (для обратной совместимости, если нужно)
export function getUsersCollection() {
  return User;
}

export function getCarsCollection() {
  return Car;
}

export function getLeadsCollection() {
  return Lead;
}

export function getSettingsCollection() {
  return Settings;
}
