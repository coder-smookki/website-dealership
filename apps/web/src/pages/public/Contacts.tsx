import { useEffect, useState, useRef } from 'react';
import { settingsApi, Settings } from '../../api/settings';
import './Contacts.css';

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function Contacts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    settingsApi.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.ymaps) return;

    // Ждем загрузки Яндекс.Карт
    window.ymaps.ready(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Координаты автосалона Rolls-Royce в Санкт-Петербурге
      // Примерный адрес: Санкт-Петербург, Невский проспект (центр города)
      const coordinates = [59.9343, 30.3351]; // Невский проспект, центр СПб

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl'],
      });

      // Добавляем метку
      const placemark = new window.ymaps.Placemark(
        coordinates,
        {
          balloonContent: 'SMK Dealership<br/>Автосалон Rolls-Royce',
          hintContent: 'SMK Dealership',
        },
        {
          preset: 'islands#redDotIcon',
        }
      );

      mapInstanceRef.current.geoObjects.add(placemark);
    });
  }, [loading]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!settings) {
    return <div className="error">Информация не найдена</div>;
  }

  return (
    <div className="contacts">
      <div className="contacts-container">
        <h1>Контакты</h1>
        <div className="contacts-content">
          <div className="contact-info">
            <div className="contact-item">
              <h3>📞 Телефон</h3>
              <a href={`tel:${settings.phone}`}>{settings.phone}</a>
            </div>
            <div className="contact-item">
              <h3>✉️ Email</h3>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div className="contact-item">
              <h3>📍 Адрес</h3>
              <p>Санкт-Петербург, Невский проспект, д. 28</p>
            </div>
            <div className="contact-item">
              <h3>🕐 Часы работы</h3>
              <p>{settings.workHours}</p>
            </div>
          </div>
          <div className="map-container">
            <div ref={mapRef} className="yandex-map"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
