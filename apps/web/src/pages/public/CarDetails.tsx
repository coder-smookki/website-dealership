import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { carsApi, Car } from '../../api/cars';
import { leadsApi } from '../../api/leads';
import LeadForm from '../../components/public/LeadForm';
import './CarDetails.css';

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      carsApi.getCar(id)
        .then((carData) => {
          // Проверяем наличие всех необходимых полей
          if (!carData) {
            throw new Error('Автомобиль не найден');
          }
          setCar(carData);
        })
        .catch((err) => {
          console.error('Error loading car:', err);
          setError(err.response?.data?.message || err.message || 'Не удалось загрузить информацию об автомобиле');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleLeadSubmit = async (data: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  }) => {
    if (!id) return;
    try {
      await leadsApi.createLead({
        carId: id,
        ...data,
      });
      alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
      setShowForm(false);
    } catch (error) {
      alert('Ошибка при отправке заявки');
      console.error(error);
    }
  };

  const images = car?.images && car.images.length > 0 
    ? car.images 
    : ['/stub.png'];

  const currentImage = images[currentImageIndex] || images[0];

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleZoomClose = () => {
    setIsZoomed(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Клавиатурная навигация
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showForm && e.key === 'Escape') {
        e.preventDefault();
        setShowForm(false);
        return;
      }
      
      if (isZoomed) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevImage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextImage();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleZoomClose();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') prevImage();
        else nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isZoomed, showForm, prevImage, nextImage]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'Забронировано';
      case 'sold':
        return 'В архиве';
      default:
        return 'Доступно';
    }
  };

  if (loading) {
    return (
      <div className="car-details">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-details">
        <div className="container">
          <Link to="/" className="back-link">← Назад к каталогу</Link>
          <div className="error-message">
            <h2>Автомобиль не найден</h2>
            <p>{error || 'Автомобиль с указанным ID не существует или был удален.'}</p>
            <Link to="/" className="back-to-catalog-button">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="car-details">
      <div className="container">
        <Link to="/" className="back-link">← Назад к каталогу</Link>

        {/* Индикатор статуса */}
        {car.status !== 'available' && (
          <div className={`status-banner status-${car.status}`}>
            {getStatusLabel(car.status)}
          </div>
        )}

        <div className="car-details-content">
          <div className="car-images">
            <div className="main-image-container">
              <img 
                src={currentImage} 
                alt={car.title || 'Автомобиль'} 
                className="main-image"
                onClick={handleImageClick}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/stub.png';
                }}
              />
              {images.length > 1 && (
                <>
                  <button 
                    className="image-nav-button image-nav-prev"
                    onClick={prevImage}
                    aria-label="Предыдущее фото"
                  >
                    ←
                  </button>
                  <button 
                    className="image-nav-button image-nav-next"
                    onClick={nextImage}
                    aria-label="Следующее фото"
                  >
                    →
                  </button>
                  <div className="image-counter">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              <button 
                className="zoom-hint"
                onClick={handleImageClick}
                title="Кликните для увеличения"
              >
                🔍
              </button>
            </div>
            {images.length > 1 && (
              <div className="thumbnail-images">
                {images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`${car.title || 'Автомобиль'} ${idx + 1}`}
                    className={idx === currentImageIndex ? 'active' : ''}
                    onClick={() => setCurrentImageIndex(idx)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/stub.png';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="car-info">
            <h1>{car.title || 'Без названия'}</h1>
            <div className="car-price">{formatPrice(car.price || 0, car.currency || 'RUB')}</div>

            <div className="car-specs">
              <div className="spec-item">
                <span className="spec-label">Год:</span>
                <span className="spec-value">{car.year || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Пробег:</span>
                <span className="spec-value">{(car.mileage || 0).toLocaleString('ru-RU')} км</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Двигатель:</span>
                <span className="spec-value">{car.engine || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Мощность:</span>
                <span className="spec-value">{car.powerHp || 0} л.с.</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Топливо:</span>
                <span className="spec-value">{car.fuelType || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">КПП:</span>
                <span className="spec-value">{car.transmission || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Привод:</span>
                <span className="spec-value">{car.drive || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Цвет:</span>
                <span className="spec-value">{car.color || '—'}</span>
              </div>
            </div>

            {car.features && car.features.length > 0 && (
              <div className="car-features">
                <h3>Особенности</h3>
                <ul>
                  {car.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="car-description">
              <h3>Описание</h3>
              <p>{car.description || 'Описание отсутствует'}</p>
            </div>

            {car.status === 'available' && (
              <button 
                className="contact-button"
                onClick={() => setShowForm(true)}
              >
                Связаться с нами
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для формы связи */}
      {showForm && (
        <div 
          className="modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setShowForm(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <LeadForm
              onSubmit={handleLeadSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Модальное окно для зума */}
      {isZoomed && (
        <div 
          className="zoom-modal"
          onClick={handleZoomClose}
          onMouseMove={handleZoomMouseMove}
        >
          <button 
            className="zoom-close"
            onClick={handleZoomClose}
            aria-label="Закрыть"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button 
                className="zoom-nav-button zoom-nav-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Предыдущее фото"
              >
                ←
              </button>
              <button 
                className="zoom-nav-button zoom-nav-next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Следующее фото"
              >
                →
              </button>
            </>
          )}
          <div 
            className="zoom-image-container"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={currentImage} 
              alt={car.title || 'Автомобиль'}
              className="zoom-image"
              style={{
                transform: `scale(2)`,
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/stub.png';
              }}
            />
          </div>
          <div className="zoom-counter">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
