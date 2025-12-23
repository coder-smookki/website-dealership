import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { settingsApi, Settings } from '../../api/settings';
import { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const { isAuthenticated, isAdmin, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    settingsApi.getSettings()
      .then(setSettings)
      .catch((error) => {
        console.error('Error loading settings:', error);
      });
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <img src="/logo.png" alt="SMK Dealership" className="logo-image" />
          <span className="logo-text">{settings?.slogan || 'SMK Dealership'}</span>
        </Link>
        
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Главная</Link>
          <Link to="/contacts" onClick={() => setMobileMenuOpen(false)}>Контакты</Link>
          {isAuthenticated() ? (
            <>
              {isAdmin() ? (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Админка</Link>
              ) : (
                <Link to="/account/cars" onClick={() => setMobileMenuOpen(false)}>Мои объявления</Link>
              )}
              <button onClick={handleLogout} className="nav-button logout">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/account/register" onClick={() => setMobileMenuOpen(false)}>Регистрация</Link>
              <Link to="/account/login" onClick={() => setMobileMenuOpen(false)} className="nav-button login">Вход</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
