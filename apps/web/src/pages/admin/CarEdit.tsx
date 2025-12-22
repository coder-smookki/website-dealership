import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { carsApi, Car } from '../../api/cars';
import { usersApi } from '../../api/users';
import CarForm from '../../components/admin/CarForm';
import './CarEdit.css';

export default function CarEdit() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    Promise.all([
      id ? carsApi.getCar(id) : Promise.resolve(null),
      usersApi.getUsers({ role: 'owner' }),
    ]).then(([carData, usersData]) => {
      setCar(carData);
      setUsers(usersData);
      setFetching(false);
    }).catch(console.error);
  }, [id, isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    setLoading(true);
    try {
      await carsApi.updateCar(id, data);
      navigate('/admin/cars');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при обновлении');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!car) {
    return <div className="error">Автомобиль не найден</div>;
  }

  return (
    <div className="car-edit">
      <div className="container">
        <h1>Редактировать объявление</h1>
        <CarForm
          onSubmit={handleSubmit}
          users={users}
          initialData={car}
          loading={loading}
        />
      </div>
    </div>
  );
}

