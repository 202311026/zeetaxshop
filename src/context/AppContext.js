import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    initializeApp();
  }, []);

  // Cargar carrito cuando el usuario cambia
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const initializeApp = async () => {
    try {
      // Cargar usuario desde localStorage
      const savedUser = localStorage.getItem('zeetaxshop_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Verificar si el email está verificado
        if (userData.email_verified) {
          setUser(userData);
        } else {
          // Si no está verificado, mostrar pantalla de verificación
          setPendingUser(userData);
          setNeedsVerification(true);
        }
      }

      // Cargar productos
      await fetchProducts();
    } catch (error) {
      console.error('Error inicializando app:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('carts')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }

      setCart(data || []);
    } catch (error) {
      console.error('Error in fetchCart:', error);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      alert('Por favor inicia sesión para agregar al carrito');
      return;
    }

    try {
      const existingItem = cart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        const { error } = await supabase
          .from('carts')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carts')
          .insert([
            { 
              user_id: user.id, 
              product_id: product.id, 
              quantity: 1 
            }
          ]);

        if (error) throw error;
      }

      // Actualizar carrito
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito: ' + error.message);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Error al eliminar del carrito: ' + error.message);
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    if (quantity === 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('carts')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      alert('Error al actualizar cantidad: ' + error.message);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error al vaciar carrito: ' + error.message);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setCart([]);
      setNeedsVerification(false);
      setPendingUser(null);
      localStorage.removeItem('zeetaxshop_user');
    } catch (error) {
      console.error('Error in logout:', error);
    }
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const getCurrentUser = async (userId) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      if (userData) {
        setUser(userData);
        localStorage.setItem('zeetaxshop_user', JSON.stringify(userData));
        return userData;
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  };

  const verifyEmail = async (userData) => {
    try {
      // Actualizar usuario como verificado
      const { error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', userData.id);

      if (error) throw error;

      const verifiedUser = { ...userData, email_verified: true };
      setUser(verifiedUser);
      setNeedsVerification(false);
      setPendingUser(null);
      localStorage.setItem('zeetaxshop_user', JSON.stringify(verifiedUser));
      
      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resending verification email:', error);
      return false;
    }
  };

  const value = {
    user,
    setUser,
    products,
    cart,
    loading,
    needsVerification,
    pendingUser,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    logout,
    selectedPlatform,
    setSelectedPlatform,
    refreshProducts,
    getCurrentUser,
    verifyEmail,
    resendVerificationEmail,
    setNeedsVerification,
    setPendingUser // ✅ ESTA ES LA QUE FALTABA
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};