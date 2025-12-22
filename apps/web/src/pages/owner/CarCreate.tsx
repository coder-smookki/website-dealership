import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { carsApi } from '../../api/cars';
import './CarCreate.css';

export default function CarCreate() {
  const { isAuthenticated, isOwner, user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    currency: 'RUB',
    fuelType: '',
    transmission: '',
    drive: '',
    engine: '',
    powerHp: 0,
    color: '',
    description: '',
    features: [] as string[],
    images: [] as string[],
  });

  const [featureInput, setFeatureInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated() || !isOwner()) {
      navigate('/account/login');
    }
  }, [isAuthenticated, isOwner, navigate]);

  if (!isAuthenticated() || !isOwner()) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await carsApi.createMyCar({
        ...formData,
        ownerId: user?.id,
      });
      alert('Объявление создано и отправлено на модерацию. После одобрения администратором оно появится на сайте.');
      navigate('/account/cars');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при создании объявления');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="car-create-owner">
      <div className="container">
        <div className="page-header">
          <h1>Создать объявление</h1>
          <button onClick={() => navigate('/account/cars')} className="back-button">
            ← Назад
          </button>
        </div>
        
        <div className="moderation-notice">
          <p>⚠️ Ваше объявление будет отправлено на модерацию. После одобрения администратором оно появится на сайте.</p>
        </div>

        <form onSubmit={handleSubmit} className="car-form">
          <div className="form-row">
            <div className="form-group">
              <label>Название *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Audi A4 2023"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Бренд *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Например: Audi"
              />
            </div>
            <div className="form-group">
              <label>Модель *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Например: A4"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Год *</label>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Пробег (км) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Цена *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Валюта</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Топливо *</label>
              <select
                required
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              >
                <option value="">Выберите тип топлива</option>
                <option value="Бензин">Бензин</option>
                <option value="Дизель">Дизель</option>
                <option value="Электричество">Электричество</option>
                <option value="Гибрид">Гибрид</option>
              </select>
            </div>
            <div className="form-group">
              <label>КПП *</label>
              <select
                required
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
              >
                <option value="">Выберите КПП</option>
                <option value="Автомат">Автомат</option>
                <option value="Механика">Механика</option>
                <option value="Робот">Робот</option>
                <option value="Вариатор">Вариатор</option>
              </select>
            </div>
            <div className="form-group">
              <label>Привод *</label>
              <select
                required
                value={formData.drive}
                onChange={(e) => setFormData({ ...formData, drive: e.target.value })}
              >
                <option value="">Выберите привод</option>
                <option value="Передний">Передний</option>
                <option value="Задний">Задний</option>
                <option value="Полный">Полный</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Двигатель *</label>
              <input
                type="text"
                required
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                placeholder="Например: 2.0 л I4"
              />
            </div>
            <div className="form-group">
              <label>Мощность (л.с.) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.powerHp}
                onChange={(e) => setFormData({ ...formData, powerHp: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Цвет *</label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Например: Черный"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Описание *</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите автомобиль подробно..."
            />
          </div>

          <div className="form-group">
            <label>Особенности</label>
            <div className="feature-input">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Добавить особенность"
              />
              <button type="button" onClick={addFeature}>+</button>
            </div>
            <div className="features-list">
              {formData.features.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                  <button type="button" onClick={() => removeFeature(index)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Изображения (URL или путь) *</label>
            <p className="form-hint">Например: /Audi.png или https://example.com/image.jpg</p>
            <div className="image-input">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="Добавить изображение"
              />
              <button type="button" onClick={addImage}>+</button>
            </div>
            <div className="images-list">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Image ${index + 1}`} onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/stub.png';
                  }} />
                  <button type="button" onClick={() => removeImage(index)}>×</button>
                </div>
              ))}
            </div>
            {formData.images.length === 0 && (
              <p className="form-error">Добавьте хотя бы одно изображение</p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/account/cars')} className="cancel-button">
              Отмена
            </button>
            <button type="submit" disabled={loading || formData.images.length === 0} className="submit-button">
              {loading ? 'Создание...' : 'Создать объявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

