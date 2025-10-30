import React from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase';

const Cart = ({ onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, user } = useApp();

  const total = cart.reduce((sum, item) => 
    sum + (item.products.price * item.quantity), 0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      // Crear pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: total,
            status: 'completed'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear items del pedido
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpiar carrito
      await clearCart();
      alert('¡Compra realizada con éxito!');
      onClose();
    } catch (error) {
      alert('Error al procesar la compra: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content cart-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Tu Carrito de Compras</h2>
        
        {cart.length === 0 ? (
          <p className="empty-cart">Tu carrito está vacío</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.products.name}</h4>
                    <p>${item.products.price} x {item.quantity}</p>
                  </div>
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >-</button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <h3>Total: ${total.toFixed(2)}</h3>
              <button className="checkout-btn" onClick={handleCheckout}>
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;