import { useState, FormEvent, useEffect } from 'react';
import './CarForm.css';

interface CarFormProps {
  onSubmit: (data: any) => void;
  users: any[];
  initialData?: any;
  loading?: boolean;
}

export default function CarForm({ onSubmit, users, initialData, loading }: CarFormProps) {
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
    status: 'available' as 'available' | 'reserved' | 'sold',
    ownerId: '',
  });

  const [featureInput, setFeatureInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        brand: initialData.brand || '',
        model: initialData.model || '',
        year: initialData.year || new Date().getFullYear(),
        mileage: initialData.mileage || 0,
        price: initialData.price || 0,
        currency: initialData.currency || 'RUB',
        fuelType: initialData.fuelType || '',
        transmission: initialData.transmission || '',
        drive: initialData.drive || '',
        engine: initialData.engine || '',
        powerHp: initialData.powerHp || 0,
        color: initialData.color || '',
        description: initialData.description || '',
        features: initialData.features || [],
        images: initialData.images || [],
        status: initialData.status || 'available',
        ownerId: initialData.ownerId?._id || initialData.ownerId || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
    <form onSubmit={handleSubmit} className="car-form">
      <div className="form-row">
        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Владелец *</label>
          <select
            required
            value={formData.ownerId}
            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
          >
            <option value="">Выберите владельца</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
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
          />
        </div>
        <div className="form-group">
          <label>Модель *</label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>Пробег (км) *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.mileage}
            onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>Цена *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
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
          <input
            type="text"
            required
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>КПП *</label>
          <input
            type="text"
            required
            value={formData.transmission}
            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Привод *</label>
          <input
            type="text"
            required
            value={formData.drive}
            onChange={(e) => setFormData({ ...formData, drive: e.target.value })}
          />
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
          />
        </div>
        <div className="form-group">
          <label>Мощность (л.с.) *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.powerHp}
            onChange={(e) => setFormData({ ...formData, powerHp: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>Цвет *</label>
          <input
            type="text"
            required
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
        />
      </div>

      <div className="form-group">
        <label>Статус</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
        >
          <option value="available">Доступен</option>
          <option value="reserved">Забронирован</option>
          <option value="sold">Продан</option>
        </select>
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
        <label>Изображения (URL)</label>
        <div className="image-input">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="Добавить URL изображения"
          />
          <button type="button" onClick={addImage}>+</button>
        </div>
        <div className="images-list">
          {formData.images.map((image, index) => (
            <div key={index} className="image-item">
              <img src={image} alt={`Image ${index + 1}`} />
              <button type="button" onClick={() => removeImage(index)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}

