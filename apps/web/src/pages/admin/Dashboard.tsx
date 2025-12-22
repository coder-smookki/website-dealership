import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { carsApi } from '../../api/cars';
import { leadsApi } from '../../api/leads';
import './Dashboard.css';

export default function Dashboard() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalLeads: 0,
    newLeads: 0,
    pendingModeration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    Promise.all([
      carsApi.getCars({ limit: 1 }),
      carsApi.getCars({ status: 'available', limit: 1 }),
      carsApi.getCars({ moderationStatus: 'pending', limit: 1 }),
      leadsApi.getLeads({ limit: 1 }),
      leadsApi.getLeads({ status: 'new', limit: 1 }),
    ]).then(([cars, availableCars, pendingCars, leads, newLeads]) => {
      setStats({
        totalCars: cars.pagination.total,
        availableCars: availableCars.pagination.total,
        pendingModeration: pendingCars.pagination.total,
        totalLeads: leads.pagination.total,
        newLeads: newLeads.pagination.total,
      });
      setLoading(false);
    }).catch(console.error);
  }, [isAuthenticated, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="dashboard">
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
    <div className="dashboard">
      <div className="container">
        <h1>Панель администратора</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Всего автомобилей</h3>
            <p className="stat-number">{stats.totalCars}</p>
            <Link to="/admin/cars">Управление →</Link>
          </div>
          <div className="stat-card">
            <h3>Доступно</h3>
            <p className="stat-number">{stats.availableCars}</p>
            <Link to="/admin/cars?status=available">Посмотреть →</Link>
          </div>
          <div className="stat-card">
            <h3>Всего заявок</h3>
            <p className="stat-number">{stats.totalLeads}</p>
            <Link to="/admin/leads">Управление →</Link>
          </div>
          <div className="stat-card">
            <h3>Новых заявок</h3>
            <p className="stat-number">{stats.newLeads}</p>
            <Link to="/admin/leads?status=new">Обработать →</Link>
          </div>
          <div className="stat-card">
            <h3>На модерации</h3>
            <p className="stat-number">{stats.pendingModeration}</p>
            <Link to="/admin/moderation">Модерировать →</Link>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/admin/moderation" className="action-button">
            Модерация объявлений
          </Link>
          <Link to="/admin/cars/new" className="action-button">
            + Создать объявление
          </Link>
          <Link to="/admin/users" className="action-button">
            Управление пользователями
          </Link>
          <Link to="/admin/settings" className="action-button">
            Настройки сайта
          </Link>
        </div>
      </div>
    </div>
  );
}

