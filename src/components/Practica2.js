import React, { useState } from 'react';

function Practica2() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No hace nada como se solicita
    console.log('Formulario enviado (pero no hace nada):', formData);
  };

  return (
    <div className="practica">
      <h2>Práctica 2: Formulario</h2>
      <form onSubmit={handleSubmit} className="formulario">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Escribe tu nombre"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="apellidos">Apellidos:</label>
          <input
            type="text"
            id="apellidos"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            placeholder="Escribe tus apellidos"
          />
        </div>
        
        <button type="submit" className="btn-enviar">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Practica2;