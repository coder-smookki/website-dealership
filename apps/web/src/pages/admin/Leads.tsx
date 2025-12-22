import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { leadsApi, Lead } from '../../api/leads';
import './Leads.css';

export default function Leads() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/admin/login');
      return;
    }

    const filters: any = {};
    if (statusFilter) {
      filters.status = statusFilter;
    }

    leadsApi.getLeads(filters)
      .then((data) => setLeads(data.leads))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, navigate, statusFilter]);

  const handleStatusChange = async (id: string, status: 'new' | 'in_progress' | 'closed') => {
    try {
      await leadsApi.updateLeadStatus(id, status);
      setLeads(leads.map(lead => 
        lead._id === id ? { ...lead, status } : lead
      ));
    } catch (error) {
      alert('Ошибка при обновлении статуса');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="leads-page">
      <div className="container">
        <div className="page-header">
          <h1>Управление заявками</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">Все заявки</option>
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="closed">Закрытые</option>
          </select>
        </div>
        {leads.length === 0 ? (
          <div className="no-leads">Нет заявок</div>
        ) : (
          <div className="leads-table">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Автомобиль</th>
                  <th>Имя</th>
                  <th>Телефон</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{new Date(lead.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>{lead.carId?.title || 'N/A'}</td>
                    <td>{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.email || '—'}</td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value as any)}
                        className={`status-select status-${lead.status}`}
                      >
                        <option value="new">Новая</option>
                        <option value="in_progress">В работе</option>
                        <option value="closed">Закрыта</option>
                      </select>
                    </td>
                    <td>
                      {lead.message && (
                        <details>
                          <summary>Сообщение</summary>
                          <p>{lead.message}</p>
                        </details>
                      )}
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

