import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { carsApi, Car } from '../../api/cars';
import './CarsList.css';

type StatusFilter = 'all' | 'available' | 'reserved' | 'sold';

export default function CarsList() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    const filters: any = {};
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }

    carsApi.getCars({ ...filters, limit: 1000 })
      .then((data) => setCars(data.cars))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, navigate, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это объявление?')) return;
    try {
      await carsApi.deleteCar(id);
      setCars(cars.filter(car => car._id !== id));
    } catch (error) {
      alert('Ошибка при удалении');
      console.error(error);
    }
  };

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
      <div className="cars-list-page">
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
    <div className="cars-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Управление автомобилями</h1>
          <Link to="/admin/cars/new" className="create-button">
            + Создать объявление
          </Link>
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

        {cars.length === 0 ? (
          <div className="no-cars">
            {statusFilter === 'sold' ? (
              <>
                <h2>Архив пуст</h2>
                <p>Проданные автомобили будут отображаться здесь</p>
              </>
            ) : (
              <>
                <h2>Нет объявлений</h2>
                <p>Создайте первое объявление для управления</p>
              </>
            )}
          </div>
        ) : (
          <div className="admin-cars-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Бренд/Модель</th>
                  <th>Год</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Владелец</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>{car.title}</td>
                    <td>{car.brand} {car.model}</td>
                    <td>{car.year}</td>
                    <td>{car.price.toLocaleString('ru-RU')} {car.currency}</td>
                    <td>
                      <span className={`status-badge status-${car.status}`}>
                        {car.status === 'available' ? 'Доступен' : 
                         car.status === 'reserved' ? 'Забронирован' : 'В архиве'}
                      </span>
                    </td>
                    <td>{car.ownerId?.name || car.ownerId?.email || 'N/A'}</td>
                    <td>
                      <div className="actions">
                        <Link to={`/admin/cars/${car._id}/edit`} className="edit-link">
                          Редактировать
                        </Link>
                        <button
                          onClick={() => handleDelete(car._id)}
                          className="delete-button"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
