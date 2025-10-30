import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useApp } from '../context/AppContext';

const Auth = ({ onClose }) => {
  const { setUser, setPendingUser, setNeedsVerification } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login con verificación de email
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .eq('password', formData.password)
          .single();

        if (error || !userData) {
          alert('Credenciales incorrectas');
          return;
        }

        // Verificar si el email está confirmado
        if (!userData.email_verified) {
          setPendingUser(userData);
          setNeedsVerification(true);
          localStorage.setItem('zeetaxshop_user', JSON.stringify(userData));
          alert('Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
          return;
        }

        setUser(userData);
        localStorage.setItem('zeetaxshop_user', JSON.stringify(userData));
        onClose();
        
      } else {
        // REGISTRO CON VERIFICACIÓN OBLIGATORIA
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (existingUser) {
          alert('Este email ya está registrado');
          return;
        }

        // 1. Registrar en Supabase Auth (para el email de verificación)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name
            },
            emailRedirectTo: `${window.location.origin}`
          }
        });

        if (authError) {
          alert('Error al registrar: ' + authError.message);
          return;
        }

        if (authData.user) {
          // 2. Crear usuario en nuestra tabla usando el UUID de Supabase Auth
          const { data: userData, error } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id, // Usar el UUID de Supabase Auth
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                is_admin: formData.email === 'admin@zeetaxshop.com',
                email_verified: false
              }
            ])
            .select()
            .single();

          if (error) {
            console.error('Error creating user:', error);
            alert('Error al crear usuario: ' + error.message);
            return;
          }

          // 3. Mostrar pantalla de verificación
          setPendingUser(userData);
          setNeedsVerification(true);
          localStorage.setItem('zeetaxshop_user', JSON.stringify(userData));
          alert('¡Registro exitoso! Se ha enviado un email de verificación. Por favor verifica tu email.');
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              name="full_name"
              placeholder="Nombre completo"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <p>
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button 
            className="toggle-auth"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>

        {isLogin && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'rgba(0, 255, 255, 0.1)', 
            borderRadius: '10px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            <p><strong>Cuenta de prueba (ya verificada):</strong></p>
            <p>admin@zeetaxshop.com / admin123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;