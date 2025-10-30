import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const EmailVerification = () => {
  const { 
    pendingUser, 
    verifyEmail, 
    resendVerificationEmail, 
    logout,
    setNeedsVerification 
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    if (!pendingUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const success = await verifyEmail(pendingUser);
      if (success) {
        setMessage('¡Email verificado correctamente! Ya puedes usar la tienda.');
      } else {
        setMessage('Error al verificar el email. Intenta nuevamente.');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!pendingUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const success = await resendVerificationEmail(pendingUser.email);
      if (success) {
        setMessage('✅ Email de verificación reenviado. Revisa tu bandeja de entrada.');
      } else {
        setMessage('❌ Error al reenviar el email. Intenta nuevamente.');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setNeedsVerification(false);
  };

  if (!pendingUser) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content auth-modal">
        <h2>Verifica tu Email</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p>Hemos enviado un email de verificación a:</p>
          <p style={{ fontWeight: 'bold', color: '#00ffff', fontSize: '1.1rem' }}>
            {pendingUser.email}
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#cccccc' }}>
            Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.
          </p>
        </div>

        {message && (
          <div style={{ 
            padding: '1rem', 
            background: message.includes('Error') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
            border: message.includes('Error') ? '1px solid #ff4444' : '1px solid #00ff00',
            borderRadius: '5px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleVerify}
            className="auth-submit-btn"
            disabled={loading}
            style={{ background: '#00ff00' }}
          >
            {loading ? 'Verificando...' : '✅ Ya verifiqué mi email'}
          </button>

          <button 
            onClick={handleResendEmail}
            className="auth-submit-btn"
            disabled={loading}
            style={{ background: '#ffaa00' }}
          >
            {loading ? 'Enviando...' : '🔄 Reenviar email de verificación'}
          </button>

          <button 
            onClick={handleLogout}
            className="auth-submit-btn"
            style={{ background: '#666' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '10px',
          fontSize: '0.8rem'
        }}>
          <p><strong>Nota:</strong> Debes verificar tu email para poder comprar en la tienda.</p>
          <p>Si no encuentras el email, revisa tu carpeta de spam.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;