import React, { useState } from 'react';
import './App.css';
import Practica1 from './components/Practica1';
import Practica2 from './components/Practica2';
import Practica3 from './components/Practica3';
import Practica4 from './components/Practica4';

function App() {
  const [practicaActual, setPracticaActual] = useState(1);

  const practicas = [
    { id: 1, nombre: "Componente Simple" },
    { id: 2, nombre: "Formulario" },
    { id: 3, nombre: "Contador de Clics" },
    { id: 4, nombre: "Pokémon API" }
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Prácticas de React</h1>
        <nav className="menu">
          {practicas.map(practica => (
            <button
              key={practica.id}
              onClick={() => setPracticaActual(practica.id)}
              className={practicaActual === practica.id ? 'active' : ''}
            >
              Práctica {practica.id}: {practica.nombre}
            </button>
          ))}
        </nav>
      </header>

      <main className="contenido">
        {practicaActual === 1 && <Practica1 />}
        {practicaActual === 2 && <Practica2 />}
        {practicaActual === 3 && <Practica3 />}
        {practicaActual === 4 && <Practica4 />}
      </main>
    </div>
  );
}

export default App;