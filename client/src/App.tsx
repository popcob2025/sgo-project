import React, { useEffect } from 'react';
import './App.css';
import { SocketConnector } from './components/SocketConnector';
import { DispatchDashboard } from './components/DispatchDashboard';
import { TriageForm } from './components/TriageForm';
import { LoginForm } from './components/LoginForm';
import { useAuthStore } from './store/auth.store';
import { UserRole } from './types';

// Enum para controlar as "páginas"
enum AppView {
  TRIAGE,
  DISPATCH,
  SUPERVISOR,
}

function App() {
  // Pega o estado de autenticação da store (Zustand)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const logout = useAuthStore((state) => state.logout);

  // Estado para controlar a visão atual
  // O padrão agora é baseado na função (role) do usuário
  const getDefaultView = () => {
    switch (user?.role) {
      case UserRole.TRIAGE:
        return AppView.TRIAGE;
      case UserRole.DISPATCH:
        return AppView.DISPATCH;
      case UserRole.SUPERVISOR:
        return AppView.DISPATCH; // Supervisor vê o despacho por padrão
      default:
        return AppView.DISPATCH;
    }
  };
  const [currentView, setCurrentView] = React.useState(getDefaultView());

  // 1. Verifica se o usuário já tem um token no localStorage ao carregar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Atualiza a view padrão quando o usuário loga
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView(getDefaultView());
    }
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps


  // Se não estiver logado, mostra a tela de login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Se estiver logado, mostra o app principal
  return (
    <>
      {/* Gerencia a conexão WebSocket (só conecta se logado) */}
      <SocketConnector />
      
      {/* Barra de Navegação Principal */}
      <nav>
        <strong>SGO</strong> | 
        
        {/* Permite que Supervisor e Triagem acessem o form */}
        {(user?.role === UserRole.TRIAGE || user?.role === UserRole.SUPERVISOR) && (
          <button onClick={() => setCurrentView(AppView.TRIAGE)}>
            Triagem
          </button>
        )}
        
        {/* Permite que Supervisor e Despachante acessem o dashboard */}
        {(user?.role === UserRole.DISPATCH || user?.role === UserRole.SUPERVISOR) && (
          <button onClick={() => setCurrentView(AppView.DISPATCH)}>
            Despacho
          </button>
        )}

        {/* TODO: Adicionar botão para Admin (Passo 2.5) */}
        {/* <button>Admin</button> */}

        <span style={{ marginLeft: 'auto', fontSize: '14px', marginRight: '15px' }}>
          Olá, {user?.email} ({user?.role})
        </span>
        <button className="logout" onClick={logout}>
          Sair
        </button>
      </nav>

      {/* Renderiza a interface principal selecionada */}
      <div className="main-content">
        {currentView === AppView.TRIAGE && <TriageForm />}
        {currentView === AppView.DISPATCH && <DispatchDashboard />}
        {/* TODO: Adicionar render do Admin (Passo 2.5) */}
      </div>
    </>
  );
}

export default App;

