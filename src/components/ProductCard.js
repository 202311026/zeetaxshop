import React from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase';

const ProductCard = ({ product }) => {
  const { addToCart, user } = useApp();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Convertir imagen a Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        // Actualizar directamente en la base de datos
        const { error } = await supabase
          .from('products')
          .update({ image_url: base64Image })
          .eq('id', product.id);

        if (error) {
          alert('Error al guardar imagen: ' + error.message);
        } else {
          alert('✅ Imagen guardada correctamente');
          // Recargar la página para ver los cambios
          window.location.reload();
        }
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'playstation': return '🎮';
      case 'xbox': return '🎯';
      case 'nintendo': return '🍄';
      default: return '🎮';
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id={`image-upload-${product.id}`}
              style={{ display: 'none' }}
            />
            <label htmlFor={`image-upload-${product.id}`} className="upload-label">
              📷 Subir imagen
            </label>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="platform-badge">
          {getPlatformIcon(product.platform)} {product.platform}
        </div>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <button 
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
            disabled={!user}
          >
            {user ? 'Agregar al Carrito' : 'Inicia sesión para comprar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;