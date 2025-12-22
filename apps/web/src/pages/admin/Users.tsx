import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usersApi, User } from '../../api/users';
import './Users.css';

export default function Users() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    usersApi.getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, navigate]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        role: (formData.get('role') as 'admin' | 'owner') || 'owner',
      };
      await usersApi.createUser(data);
      const updated = await usersApi.getUsers();
      setUsers(updated);
      setShowForm(false);
      alert('Пользователь создан');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при создании');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await usersApi.updateUser(id, { isActive: !isActive });
      setUsers(users.map(user => 
        user._id === id ? { ...user, isActive: !isActive } : user
      ));
    } catch (error) {
      alert('Ошибка при обновлении');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="users-page">
      <div className="container">
        <div className="page-header">
          <h1>Управление пользователями</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="create-button"
          >
            + Создать пользователя
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="create-user-form">
            <h3>Создать нового пользователя</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" required />
              </div>
              <div className="form-group">
                <label>Пароль *</label>
                <input type="password" name="password" required minLength={6} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Имя</label>
                <input type="text" name="name" />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input type="tel" name="phone" />
              </div>
            </div>
            <div className="form-group">
              <label>Роль</label>
              <select name="role" defaultValue="owner">
                <option value="owner">Владелец</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={creating} className="submit-button">
                {creating ? 'Создание...' : 'Создать'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-button">
                Отмена
              </button>
            </div>
          </form>
        )}

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.name || '—'}</td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? 'Администратор' : 'Владелец'}
                    </span>
                  </td>
                  <td>
                    <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className="toggle-button"
                    >
                      {user.isActive ? 'Деактивировать' : 'Активировать'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

