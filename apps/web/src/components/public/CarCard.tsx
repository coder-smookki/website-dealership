import { Link } from 'react-router-dom';
import { Car } from '../../api/cars';
import './CarCard.css';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const mainImage = car.images && car.images.length > 0 
    ? car.images[0] 
    : '/stub.png';

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency;
  };

  return (
    <Link to={`/cars/${car._id}`} className="car-card">
      <div className="car-card-image-wrapper">
        <div className="car-card-image">
          <img src={mainImage} alt={car.title} />
          {car.status !== 'available' && (
            <div className={`status-badge status-${car.status}`}>
              {car.status === 'reserved' ? 'Забронировано' : 'В архиве'}
            </div>
          )}
          <div className="car-card-overlay">
            <span className="view-details">Подробнее →</span>
          </div>
        </div>
      </div>
      <div className="car-card-content">
        <h3 className="car-card-title">{car.title}</h3>
        <div className="car-card-specs">
          <div className="spec-item">
            <span className="spec-icon">📅</span>
            <span>{car.year}</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">🛣️</span>
            <span>{car.mileage.toLocaleString('ru-RU')} км</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">⚡</span>
            <span>{car.powerHp} л.с.</span>
          </div>
        </div>
        <div className="car-card-footer">
          <div className="car-card-price">{formatPrice(car.price, car.currency)}</div>
          <div className="car-card-brand">{car.brand}</div>
        </div>
      </div>
    </Link>
  );
}
