import React, { useState, useEffect } from 'react';
import { Card, AuthStatus } from './types';
import ApiService from './api';
import CardGrid from './components/CardGrid';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false });
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Debug effect to monitor auth status changes
  useEffect(() => {
    console.log('Auth status changed:', authStatus);
  }, [authStatus]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load cards and auth status in parallel
      const [cardsData, authData] = await Promise.all([
        ApiService.getCards(),
        ApiService.getAuthStatus().catch(() => ({ authenticated: false }))
      ]);
      
      setCards(cardsData);
      setAuthStatus(authData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      const authData = await ApiService.login({ username, password });
      console.log('Login successful, auth data:', authData); // Debug log
      
      // Update state using functional updates to ensure proper re-render
      setShowLogin(false);
      setAuthStatus(() => authData);
      
      // Reload cards after login to refresh admin view
      loadCards();
    } catch (err) {
      console.error('Login failed:', err); // Debug log
      throw err; // Re-throw to let Login component handle the error display
    }
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      setAuthStatus({ authenticated: false });
    } catch (err) {
      console.error('Logout failed:', err);
      // Force logout on frontend even if backend fails
      setAuthStatus({ authenticated: false });
    }
  };

  const handleCardUpdate = () => {
    // Reload cards when they're updated
    loadCards();
  };

  const loadCards = async () => {
    try {
      const cardsData = await ApiService.getCards();
      setCards(cardsData);
    } catch (err) {
      console.error('Failed to reload cards:', err);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        Loading...
      </div>
    );
  }

  if (showLogin) {
    return <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />;
  }

  if (authStatus.authenticated) {
    return (
      <AdminPanel
        cards={cards}
        onLogout={handleLogout}
        onCardUpdate={handleCardUpdate}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fontys ICT Applied GenAI Challenge Cards</h1>
        <button
          className="admin-login-btn"
          onClick={() => setShowLogin(true)}
          title="Admin Login"
          aria-label="Admin Login"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>
      
      <main className="app-main">
        {error ? (
          <div className="app-error">
            <p>Error: {error}</p>
            <button onClick={loadInitialData}>Retry</button>
          </div>
        ) : (
          <CardGrid cards={cards} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 Fontys ICT Applied GenAI Challenge</p>
      </footer>
    </div>
  );
}

export default App; 