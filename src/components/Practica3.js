import React, { useState } from 'react';

function Practica3() {
  const [contador, setContador] = useState(0);

  const incrementar = () => {
    setContador(contador + 1);
  };

  const resetear = () => {
    setContador(0);
  };

  return (
    <div className="practica">
      <h2>Práctica 3: Contador de Clics</h2>
      <div className="contador">
        <h3>Número de clics:</h3>
        <div className="numero-clics">{contador}</div>
        <button onClick={incrementar}>
          Haz clic aquí
        </button>
        <button onClick={resetear} style={{ backgroundColor: '#95a5a6' }}>
          Reiniciar contador
        </button>
      </div>
    </div>
  );
}

export default Practica3;