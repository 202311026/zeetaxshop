import React, { useState, useEffect } from 'react';

function Practica4() {
  const [pokemons, setPokemons] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [limite, setLimite] = useState(20);

  useEffect(() => {
    cargarPokemons();
  }, [limite]);

  const cargarPokemons = async () => {
    try {
      setCargando(true);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limite}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los Pokémon');
      }
      
      const data = await response.json();
      setPokemons(data.results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarMas = () => {
    setLimite(limite + 20);
  };

  return (
    <div className="practica">
      <h2>Práctica 4: Pokémon desde API</h2>
      <p>Mostrando {limite} Pokémon de la PokeAPI</p>
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={cargarPokemons} className="btn-cargar">
            Intentar de nuevo
          </button>
        </div>
      )}
      
      {cargando && !error ? (
        <div className="cargando">Cargando Pokémon...</div>
      ) : (
        <>
          <div className="pokemon-grid">
            {pokemons.map((pokemon, index) => (
              <div key={pokemon.name} className="pokemon-card">
                <div className="pokemon-id">{index + 1}</div>
                <div className="pokemon-nombre">{pokemon.name}</div>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
                  URL: {pokemon.url.split('/').slice(-2, -1)[0]}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={cargarMas} className="btn-cargar">
              Cargar más Pokémon
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Practica4;