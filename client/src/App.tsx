import React from 'react';
import './App.css';
import { SocketConnector } from './store/components/SocketConnector';
import { DispatchDashboard } from './store/components/DispatchDashboard';
import { TriageForm } from 'components/TriageForm';
// 1. Importar a store de Auth e o LoginForm
import { useAuthStore } from 'store/auth.store';
import { LoginForm } from 'components/LoginForm';

enum AppView {
  TRIAGE,
  DISPATCH,
  // ADMIN_NATURES, (Futuro)
  // ADMIN_RESOURCES, (Futuro)
}

function App() {
  const [currentView, setCurrentView] = React.useState<AppView>(
    AppView.TRIAGE,
  );

  // 2. Obter estado e ações da auth.store
  const { isAuthenticated, user, logout } = useAuthStore();

  // 3. Renderizar o LoginForm se não estiver autenticado
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // 4. Se estiver autenticado, renderizar a app principal
  return (
    <div className="App">
      {/* O SocketConnector agora pode (opcionalmente) ser movido para dentro
          da verificação de 'isAuthenticated' se a conexão WS também
          precisar de um token (o que é uma boa prática). 
          Por enquanto, mantemos aqui. */}
      <SocketConnector />
      
      <header className="App-header">
        <h1>SGO - Sistema de Gestão de Ocorrências</h1>
        <div className="user-info">
          <span>Olá, {user?.name} ({user?.role})</span>
          <button onClick={logout} className="logout-btn">
            Sair
          </button>
        </div>
      </header>

      <nav className="App-nav">
        <button
          className={currentView === AppView.TRIAGE ? 'active' : ''}
          onClick={() => setCurrentView(AppView.TRIAGE)}
        >
          Triagem (Nova Ocorrência)
        </button>
        <button
          className={currentView === AppView.DISPATCH ? 'active' : ''}
          onClick={() => setCurrentView(AppView.DISPATCH)}
        >
          Mesa de Despacho
        </button>
        {/* TODO: Adicionar botões de Admin (visível apenas para SUPERVISOR) */}
      </nav>

      <main className="App-container">
        {currentView === AppView.TRIAGE && <TriageForm />}
        {currentView === AppView.DISPATCH && <DispatchDashboard />}
      </main>
    </div>
  );
}

export default App;
