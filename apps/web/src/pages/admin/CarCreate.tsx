import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { carsApi } from '../../api/cars';
import { usersApi } from '../../api/users';
import CarForm from '../../components/admin/CarForm';
import './CarCreate.css';

export default function CarCreate() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }
    usersApi.getUsers({ role: 'owner' }).then(setUsers).catch(console.error);
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await carsApi.createCar(data);
      navigate('/admin/cars');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при создании');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="car-create">
      <div className="container">
        <h1>Создать объявление</h1>
        <CarForm onSubmit={handleSubmit} users={users} loading={loading} />
      </div>
    </div>
  );
}

