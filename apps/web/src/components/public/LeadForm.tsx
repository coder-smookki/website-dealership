import { useState, FormEvent } from 'react';
import './LeadForm.css';

interface LeadFormProps {
  onSubmit: (data: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  }) => void;
  onCancel: () => void;
}

export default function LeadForm({ onSubmit, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      message: formData.message || undefined,
    });
  };

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h3>Оставить заявку</h3>
      <div className="form-group">
        <label>Имя *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Телефон *</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Сообщение</label>
        <textarea
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-button">
          Отправить
        </button>
        <button type="button" onClick={onCancel} className="cancel-button">
          Отмена
        </button>
      </div>
    </form>
  );
}

