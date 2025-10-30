import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Home from './pages/Home';
import EmailVerification from './components/EmailVerification';
import { useApp } from './context/AppContext';
import './App.css';

function AppContent() {
  const { needsVerification } = useApp();

  return (
    <div className="App">
      <Header />
      <main>
        <Home />
      </main>
      {needsVerification && <EmailVerification />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;