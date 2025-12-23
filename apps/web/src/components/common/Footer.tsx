import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { settingsApi, Settings } from '../../api/settings';
import './Footer.css';

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    settingsApi.getSettings()
      .then(setSettings)
      .catch((error) => {
        console.error('Error loading settings:', error);
        // Устанавливаем дефолтные настройки при ошибке
        setSettings({
          _id: '',
          phone: '+7 495 266 7524',
          email: 'info@car-shop.ru',
          address: 'Москва, ул. Примерная, д. 1',
          workHours: 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
          slogan: 'SMK Dealership',
          createdAt: '',
          updatedAt: '',
        });
      });
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Контакты</h3>
          {settings && (
            <>
              <p>📞 {settings.phone}</p>
              <p>✉️ {settings.email}</p>
              <p>📍 {settings.address}</p>
              <p>🕐 {settings.workHours}</p>
            </>
          )}
        </div>
        <div className="footer-section">
          <h3>Навигация</h3>
          <Link to="/">Главная</Link>
          <Link to="/contacts">Контакты</Link>
        </div>
        <div className="footer-section">
          <p className="copyright">© 2025 SMK Dealership. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

