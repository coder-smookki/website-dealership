import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { settingsApi, Settings } from '../../api/settings';
import './Settings.css';

export default function SettingsPage() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    settingsApi.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        workHours: formData.get('workHours') as string,
        slogan: formData.get('slogan') as string,
      };
      const updated = await settingsApi.updateSettings(data);
      setSettings(updated);
      alert('Настройки сохранены');
    } catch (error) {
      alert('Ошибка при сохранении');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="settings-page">
      <div className="container">
        <h1>Настройки сайта</h1>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Телефон</label>
            <input
              type="text"
              name="phone"
              defaultValue={settings.phone}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              defaultValue={settings.email}
              required
            />
          </div>
          <div className="form-group">
            <label>Адрес</label>
            <input
              type="text"
              name="address"
              defaultValue={settings.address}
              required
            />
          </div>
          <div className="form-group">
            <label>Часы работы</label>
            <input
              type="text"
              name="workHours"
              defaultValue={settings.workHours}
              required
            />
          </div>
          <div className="form-group">
            <label>Слоган (для главной страницы)</label>
            <input
              type="text"
              name="slogan"
              defaultValue={settings.slogan}
              required
            />
          </div>
          <button type="submit" disabled={saving} className="submit-button">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

