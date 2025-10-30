import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Auth from './Auth';
import Cart from './Cart';
import AdminPanel from './AdminPanel';

const Header = () => {
  const { user, logout, cart, setSelectedPlatform } = useApp();
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const platforms = [
    { id: 'all', name: 'Todos' },
    { id: 'playstation', name: 'PlayStation' },
    { id: 'xbox', name: 'Xbox' },
    { id: 'nintendo', name: 'Nintendo' }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>ZeetaxShop</h1>
            <span className="neon-text">Gaming Store</span>
          </div>
          
          <nav className="platform-nav">
            {platforms.map(platform => (
              <button
                key={platform.id}
                className="platform-btn"
                onClick={() => setSelectedPlatform(platform.id)}
              >
                {platform.name}
              </button>
            ))}
          </nav>

          <div className="user-actions">
            {user ? (
              <>
                <span className="welcome">Hola, {user.full_name}</span>
                <button className="cart-btn" onClick={() => setShowCart(true)}>
                  🛒 Carrito ({cart.length})
                </button>
                {user.is_admin && (
                  <button className="admin-btn" onClick={() => setShowAdmin(true)}>
                    🔧 Admin
                  </button>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button className="login-btn" onClick={() => setShowAuth(true)}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
      {showCart && <Cart onClose={() => setShowCart(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
};

export default Header;