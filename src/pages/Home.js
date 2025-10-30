import React from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { products, selectedPlatform } = useApp();

  const filteredProducts = selectedPlatform === 'all' 
    ? products 
    : products.filter(product => product.platform === selectedPlatform);

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'playstation': return 'PlayStation';
      case 'xbox': return 'Xbox';
      case 'nintendo': return 'Nintendo';
      default: return 'Todos los Juegos';
    }
  };

  return (
    <div className="home-page">
      <div className="container">
        <h2 className="page-title">{getPlatformName(selectedPlatform)}</h2>
        
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;