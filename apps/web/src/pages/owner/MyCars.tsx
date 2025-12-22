import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { carsApi, Car } from '../../api/cars';
import { useAuthStore } from '../../store/authStore';
import CarCard from '../../components/public/CarCard';
import StatusSelect from '../../components/owner/StatusSelect';
import './MyCars.css';

type StatusFilter = 'all' | 'available' | 'reserved' | 'sold';

export default function MyCars() {
  const { isAuthenticated, isOwner } = useAuthStore();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!isAuthenticated() || !isOwner()) {
      navigate('/account/login');
      return;
    }

    carsApi.getMyCars()
      .then((data) => setCars(data.cars))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, isOwner, navigate]);

  const handleStatusChange = async (carId: string, status: 'available' | 'reserved' | 'sold') => {
    try {
      // Подтверждение при перемещении в архив
      if (status === 'sold') {
        const confirmed = window.confirm(
          'Вы уверены, что хотите переместить это объявление в архив? ' +
          'Вы сможете вернуть его в продажу позже.'
        );
        if (!confirmed) return;
      }

      await carsApi.updateCarStatus(carId, status);
      setCars(cars.map(car => 
        car._id === carId ? { ...car, status } : car
      ));

      // Показываем сообщение об успехе
      if (status === 'sold') {
        alert('Объявление перемещено в архив');
      } else if (status === 'available') {
        alert('Объявление возвращено в продажу');
      }
    } catch (error) {
      alert('Ошибка при обновлении статуса');
      console.error(error);
    }
  };

  const handleRestoreFromArchive = async (carId: string) => {
    try {
      await carsApi.updateCarStatus(carId, 'available');
      setCars(cars.map(car => 
        car._id === carId ? { ...car, status: 'available' } : car
      ));
      alert('Объявление возвращено в продажу');
    } catch (error) {
      alert('Ошибка при восстановлении объявления');
      console.error(error);
    }
  };

  // Фильтрация автомобилей по статусу
  const filteredCars = useMemo(() => {
    if (statusFilter === 'all') return cars;
    return cars.filter(car => car.status === statusFilter);
  }, [cars, statusFilter]);

  // Статистика
  const stats = useMemo(() => {
    return {
      total: cars.length,
      available: cars.filter(c => c.status === 'available').length,
      reserved: cars.filter(c => c.status === 'reserved').length,
      archived: cars.filter(c => c.status === 'sold').length,
    };
  }, [cars]);

  if (loading) {
    return (
      <div className="my-cars">
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
    <div className="my-cars">
      <div className="container">
        <div className="page-header">
          <h1>Мои объявления</h1>
          <button
            onClick={() => navigate('/account/cars/new')}
            className="create-button"
          >
            + Создать объявление
          </button>
        </div>

        {/* Статистика */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Всего</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>В продаже</h3>
            <p className="stat-number">{stats.available}</p>
          </div>
          <div className="stat-card">
            <h3>Забронировано</h3>
            <p className="stat-number">{stats.reserved}</p>
          </div>
          <div className="stat-card">
            <h3>В архиве</h3>
            <p className="stat-number">{stats.archived}</p>
          </div>
        </div>

        {/* Фильтры по статусу */}
        <div className="status-filters">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Все ({stats.total})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'available' ? 'active' : ''}`}
            onClick={() => setStatusFilter('available')}
          >
            В продаже ({stats.available})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'reserved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('reserved')}
          >
            Забронировано ({stats.reserved})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'sold' ? 'active' : ''}`}
            onClick={() => setStatusFilter('sold')}
          >
            В архиве ({stats.archived})
          </button>
        </div>

        {/* Список автомобилей */}
        {filteredCars.length === 0 ? (
          <div className="no-cars">
            {statusFilter === 'all' ? (
              <>
                <h2>У вас пока нет объявлений</h2>
                <p>Создайте первое объявление, чтобы начать продавать автомобили</p>
              </>
            ) : statusFilter === 'sold' ? (
              <>
                <h2>Архив пуст</h2>
                <p>Проданные автомобили будут автоматически перемещаться сюда</p>
              </>
            ) : (
              <>
                <h2>Нет автомобилей с таким статусом</h2>
                <p>Измените фильтр, чтобы увидеть другие объявления</p>
              </>
            )}
          </div>
        ) : (
          <div className="cars-grid">
            {filteredCars.map((car) => (
              <div key={car._id} className={`my-car-card-wrapper ${car.status === 'sold' ? 'archived' : ''}`}>
                <CarCard car={car} />
                <div className="car-actions">
                  {/* Статус модерации */}
                  {car.moderationStatus && car.moderationStatus !== 'approved' && (
                    <div className="moderation-status-badge">
                      {car.moderationStatus === 'pending' && (
                        <span className="moderation-pending">
                          ⏳ На модерации
                        </span>
                      )}
                      {car.moderationStatus === 'rejected' && (
                        <div className="moderation-rejected">
                          <span>❌ Отклонено</span>
                          {car.moderationComment && (
                            <p className="moderation-comment-text">{car.moderationComment}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {car.status === 'sold' ? (
                    // Для архивных машин показываем кнопку восстановления
                    <div className="archive-actions">
                      <div className="archive-info">
                        <span className="archive-label">В архиве</span>
                        <p className="archive-description">Это объявление было перемещено в архив</p>
                      </div>
                      <button
                        className="restore-button"
                        onClick={() => handleRestoreFromArchive(car._id)}
                      >
                        Вернуть в продажу
                      </button>
                    </div>
                  ) : (
                    // Для активных машин показываем обычный селектор статуса
                    <div className="status-control">
                      <label>Статус:</label>
                      <StatusSelect
                        value={car.status}
                        onChange={(status) => handleStatusChange(car._id, status)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
