import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { carsApi, Car } from '../../api/cars';
import './Moderation.css';

export default function Moderation() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    loadCars();
  }, [isAuthenticated, isAdmin, navigate, filter]);

  const loadCars = async () => {
    try {
      const filters: any = { limit: 1000 };
      if (filter === 'pending') {
        filters.moderationStatus = 'pending';
      }
      const data = await carsApi.getCars(filters);
      setCars(data.cars);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (carId: string, status: 'approved' | 'rejected', comment?: string) => {
    try {
      await carsApi.moderateCar(carId, status, comment);
      await loadCars();
      alert(status === 'approved' ? 'Объявление одобрено' : 'Объявление отклонено');
    } catch (error) {
      alert('Ошибка при модерации');
      console.error(error);
    }
  };

  const pendingCount = cars.filter(c => c.moderationStatus === 'pending').length;

  if (loading) {
    return (
      <div className="moderation-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="moderation-page">
      <div className="container">
        <div className="page-header">
          <h1>Модерация объявлений</h1>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              На модерации ({pendingCount})
            </button>
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все
            </button>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="no-cars">
            <h2>Нет объявлений для модерации</h2>
            <p>Все объявления обработаны</p>
          </div>
        ) : (
          <div className="moderation-list">
            {cars.map((car) => (
              <div key={car._id} className="moderation-item">
                <div className="moderation-item-content">
                  <div className="car-preview">
                    <img
                      src={car.images && car.images.length > 0 ? car.images[0] : '/stub.png'}
                      alt={car.title}
                      className="car-preview-image"
                    />
                    <div className="car-preview-info">
                      <h3>{car.title}</h3>
                      <p className="car-specs">
                        {car.brand} {car.model} • {car.year} • {car.mileage.toLocaleString('ru-RU')} км
                      </p>
                      <p className="car-price">
                        {car.price.toLocaleString('ru-RU')} {car.currency}
                      </p>
                      <div className="car-owner">
                        <strong>Владелец:</strong> {car.ownerName || car.ownerEmail || 'N/A'}
                      </div>
                      {car.moderationComment && (
                        <div className="moderation-comment">
                          <strong>Комментарий:</strong> {car.moderationComment}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="moderation-status">
                    <span className={`status-badge status-${car.moderationStatus || 'pending'}`}>
                      {car.moderationStatus === 'pending' ? 'На модерации' :
                       car.moderationStatus === 'approved' ? 'Одобрено' : 'Отклонено'}
                    </span>
                  </div>
                </div>
                {car.moderationStatus === 'pending' && (
                  <div className="moderation-actions">
                    <button
                      className="approve-button"
                      onClick={() => handleModerate(car._id, 'approved')}
                    >
                      ✓ Одобрить
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => {
                        const comment = prompt('Укажите причину отклонения (необязательно):');
                        if (comment !== null) {
                          handleModerate(car._id, 'rejected', comment || undefined);
                        }
                      }}
                    >
                      ✗ Отклонить
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

