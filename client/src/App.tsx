import React from 'react';
import './App.css';
import { SocketConnector } from './store/components/SocketConnector';
import { DispatchDashboard } from './store/components/DispatchDashboard';
import { TriageForm } from './components/TriageForm';
import { useAuthStore } from './store/auth.store';
import { LoginForm } from './components/LoginForm';
import { AdminNatures } from './components/admin/AdminNatures';
import { AdminResources } from './components/admin/AdminResources';
// 1. Importar o novo componente Admin
import { AdminProtocols } from './components/admin/AdminProtocols';

enum AppView {
  TRIAGE,
  DISPATCH,
  ADMIN_NATURES,
  ADMIN_RESOURCES,
  // 2. Adicionar a nova View
  ADMIN_PROTOCOLS,
}

function App() {
  const [currentView, setCurrentView] = React.useState<AppView>(
    AppView.TRIAGE,
  );

  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="App">
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
        {/* Botões do Operador */}
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
        
        {/* Botões de Admin (Condicional) */}
        {(user?.role === 'SUPERVISOR' || user?.role === 'ADMIN') && (
          <>
            <button
              className={`admin-nav-btn ${
                currentView === AppView.ADMIN_NATURES ? 'active' : ''
              }`}
              onClick={() => setCurrentView(AppView.ADMIN_NATURES)}
            >
              Admin: Naturezas
            </button>
            <button
              className={`admin-nav-btn ${
                currentView === AppView.ADMIN_RESOURCES ? 'active' : ''
              }`}
              onClick={() => setCurrentView(AppView.ADMIN_RESOURCES)}
            >
              Admin: Recursos
            </button>
            {/* 3. Adicionar botão para Protocolos */}
            <button
              className={`admin-nav-btn ${
                currentView === AppView.ADMIN_PROTOCOLS ? 'active' : ''
              }`}
              onClick={() => setCurrentView(AppView.ADMIN_PROTOCOLS)}
            >
              Admin: Protocolos
            </button>
          </>
        )}
      </nav>

      <main className="App-container">
        {currentView === AppView.TRIAGE && <TriageForm />}
        {currentView === AppView.DISPATCH && <DispatchDashboard />}
        {/* 4. Adicionar Renderização do Admin */}
        {currentView === AppView.ADMIN_NATURES && <AdminNatures />}
        {currentView === AppView.ADMIN_RESOURCES && <AdminResources />}
        {currentView === AppView.ADMIN_PROTOCOLS && <AdminProtocols />}
      </main>
    </div>
  );
}

export default App;