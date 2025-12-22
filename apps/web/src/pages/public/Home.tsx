import { useEffect, useState, useMemo } from 'react';
import { carsApi, Car, CarFilters } from '../../api/cars';
import { settingsApi, Settings } from '../../api/settings';
import CarCard from '../../components/public/CarCard';
import './Home.css';

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Фильтры для будущего использования
  // const [filters, setFilters] = useState<CarFilters>({
  //   status: 'available',
  //   limit: 1000,
  // });

  // Фильтры по параметрам
  const [filterParams, setFilterParams] = useState({
    priceFrom: '',
    priceTo: '',
    yearFrom: '',
    yearTo: '',
    fuelType: '',
    transmission: '',
    drive: '',
  });

  // Загружаем все доступные автомобили
  useEffect(() => {
    Promise.all([
      carsApi.getCars({ status: 'available', limit: 1000 }),
      settingsApi.getSettings(),
    ]).then(([carsData, settingsData]) => {
      setAllCars(carsData.cars);
      setSettings(settingsData);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading data:', error);
      setLoading(false);
      setSettings({
        _id: '',
        phone: '+7 495 266 7524',
        email: 'info@car-shop.ru',
        address: 'Москва, ул. Примерная, д. 1',
        workHours: 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
        slogan: 'SMK Dealership',
        createdAt: '',
        updatedAt: '',
      });
    });
  }, []);

  // Применяем фильтры
  useEffect(() => {
    if (!loading) {
      const appliedFilters: CarFilters = {
        status: 'available',
        limit: 1000,
      };

      if (selectedBrand !== 'all') {
        appliedFilters.brand = selectedBrand;
      }

      if (filterParams.priceFrom) {
        appliedFilters.priceFrom = Number(filterParams.priceFrom);
      }
      if (filterParams.priceTo) {
        appliedFilters.priceTo = Number(filterParams.priceTo);
      }
      if (filterParams.yearFrom) {
        appliedFilters.yearFrom = Number(filterParams.yearFrom);
      }
      if (filterParams.yearTo) {
        appliedFilters.yearTo = Number(filterParams.yearTo);
      }
      if (filterParams.fuelType) {
        appliedFilters.fuelType = filterParams.fuelType;
      }
      if (filterParams.transmission) {
        appliedFilters.transmission = filterParams.transmission;
      }
      if (filterParams.drive) {
        appliedFilters.drive = filterParams.drive;
      }

      carsApi.getCars(appliedFilters)
        .then((carsData) => {
          setCars(carsData.cars);
          setCurrentPage(0);
        })
        .catch((error) => {
          console.error('Error loading filtered cars:', error);
        });
    }
  }, [loading, selectedBrand, filterParams]);

  // Получаем уникальные марки из всех доступных автомобилей
  const availableBrands = useMemo(() => {
    const brandsMap = new Map<string, number>();
    allCars.forEach(car => {
      if (car.status === 'available' && car.brand) {
        const brand = car.brand.trim();
        brandsMap.set(brand, (brandsMap.get(brand) || 0) + 1);
      }
    });
    return Array.from(brandsMap.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [allCars]);

  // Получаем уникальные значения для фильтров
  const uniqueFuelTypes = useMemo(() => {
    const types = new Set<string>();
    allCars.forEach(car => {
      if (car.fuelType) types.add(car.fuelType);
    });
    return Array.from(types).sort();
  }, [allCars]);

  const uniqueTransmissions = useMemo(() => {
    const types = new Set<string>();
    allCars.forEach(car => {
      if (car.transmission) types.add(car.transmission);
    });
    return Array.from(types).sort();
  }, [allCars]);

  const uniqueDrives = useMemo(() => {
    const types = new Set<string>();
    allCars.forEach(car => {
      if (car.drive) types.add(car.drive);
    });
    return Array.from(types).sort();
  }, [allCars]);

  const handleBrandClick = (brand: string) => {
    setSelectedBrand(brand);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilterParams({
      priceFrom: '',
      priceTo: '',
      yearFrom: '',
      yearTo: '',
      fuelType: '',
      transmission: '',
      drive: '',
    });
  };

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = Object.values(filterParams).some(val => val !== '');

  // Карусель: показываем 12 автомобилей на странице
  const CARS_PER_PAGE = 12;
  const totalPages = Math.ceil(cars.length / CARS_PER_PAGE);
  const startIndex = currentPage * CARS_PER_PAGE;
  const endIndex = startIndex + CARS_PER_PAGE;
  const displayedCars = cars.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-container">
          <img 
            src="/main_page.jpg" 
            alt="Luxury Cars" 
            className="hero-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">{settings?.slogan || 'SMK Dealership'}</h1>
              <p className="hero-subtitle">Эксклюзивные автомобили премиум класса</p>
              <a href="/contacts" className="hero-cta">
                Связаться с нами
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section with Filter Icon */}
      {availableBrands.length > 0 && (
        <section className="categories-section">
          <div className="categories-container">
            <button
              className={`filter-icon-button ${filtersOpen ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-label="Фильтры"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 5H17.5M5 10H15M7.5 15H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {hasActiveFilters && <span className="filter-badge"></span>}
            </button>
            <div className="categories">
              <button
                className={`category-button ${selectedBrand === 'all' ? 'active' : ''}`}
                onClick={() => handleBrandClick('all')}
              >
                ВСЕ
                {allCars.length > 0 && (
                  <span className="category-count">
                    {allCars.length}
                  </span>
                )}
              </button>
              {availableBrands.map(({ brand, count }) => (
                <button
                  key={brand}
                  className={`category-button ${selectedBrand.toLowerCase() === brand.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleBrandClick(brand)}
                >
                  {brand.toUpperCase()}
                  {count > 0 && <span className="category-count">{count}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div className="filters-panel">
              <div className="filters-panel-content">
                <div className="filters-panel-header">
                  <h3>Фильтры</h3>
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Сбросить
                  </button>
                </div>

                <div className="filters-grid">
                  {/* Цена */}
                  <div className="filter-group">
                    <label>Цена, ₽</label>
                    <div className="filter-range">
                      <input
                        type="number"
                        placeholder="От"
                        value={filterParams.priceFrom}
                        onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                        className="filter-input"
                      />
                      <span>—</span>
                      <input
                        type="number"
                        placeholder="До"
                        value={filterParams.priceTo}
                        onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                        className="filter-input"
                      />
                    </div>
                  </div>

                  {/* Год */}
                  <div className="filter-group">
                    <label>Год</label>
                    <div className="filter-range">
                      <input
                        type="number"
                        placeholder="От"
                        value={filterParams.yearFrom}
                        onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                        className="filter-input"
                        min="1900"
                        max="2030"
                      />
                      <span>—</span>
                      <input
                        type="number"
                        placeholder="До"
                        value={filterParams.yearTo}
                        onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                        className="filter-input"
                        min="1900"
                        max="2030"
                      />
                    </div>
                  </div>

                  {/* Тип топлива */}
                  <div className="filter-group">
                    <label>Тип топлива</label>
                    <select
                      value={filterParams.fuelType}
                      onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Все</option>
                      {uniqueFuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Коробка передач */}
                  <div className="filter-group">
                    <label>Коробка передач</label>
                    <select
                      value={filterParams.transmission}
                      onChange={(e) => handleFilterChange('transmission', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Все</option>
                      {uniqueTransmissions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Привод */}
                  <div className="filter-group">
                    <label>Привод</label>
                    <select
                      value={filterParams.drive}
                      onChange={(e) => handleFilterChange('drive', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Все</option>
                      {uniqueDrives.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Cars Carousel Section */}
      <section className="cars-section">
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Загрузка автомобилей...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="no-cars">
              <h2>Автомобили не найдены</h2>
              <p>Попробуйте изменить фильтры поиска</p>
            </div>
          ) : (
            <>
              <div className="cars-header">
                <h2 className="section-title">Наш каталог</h2>
                <div className="cars-pagination-info">
                  Показано {displayedCars.length} из {cars.length} автомобилей
                  {totalPages > 1 && (
                    <span className="page-info">
                      (Страница {currentPage + 1} из {totalPages})
                    </span>
                  )}
                </div>
              </div>

              <div className="cars-carousel-wrapper">
                <button
                  className="carousel-button carousel-button-prev"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  aria-label="Предыдущая страница"
                >
                  ←
                </button>

                <div className="cars-carousel">
                  <div className="cars-grid">
                    {displayedCars.map((car) => (
                      <CarCard key={car._id} car={car} />
                    ))}
                  </div>
                </div>

                <button
                  className="carousel-button carousel-button-next"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages - 1}
                  aria-label="Следующая страница"
                >
                  →
                </button>
              </div>

              {totalPages > 1 && (
                <div className="carousel-dots">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${currentPage === index ? 'active' : ''}`}
                      onClick={() => setCurrentPage(index)}
                      aria-label={`Страница ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
