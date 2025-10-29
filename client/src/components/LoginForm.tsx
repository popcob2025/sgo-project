import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import './LoginForm.css';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pega a ação de 'login' da nossa store
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      // Se o login for bem-sucedido, o App.tsx vai
      // automaticamente renderizar o dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao tentar logar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>SGO - Login</h1>
        
        <div className="form-group">
          <label htmlFor="username">Usuário (username)</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};