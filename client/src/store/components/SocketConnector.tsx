import { useEffect } from 'react';
import { useDispatchStore } from '../dispatch.store';

/**
 * Este componente (quase) invisível tem uma única responsabilidade:
 * conectar e desconectar o WebSocket quando a aplicação montar/desmontar.
 */
export const SocketConnector = () => {
  // Pega as ações 'connect' e 'disconnect' da nossa store
  const connect = useDispatchStore((state: any) => state.connect);
  const disconnect = useDispatchStore((state: any) => state.disconnect);

  useEffect(() => {
    // Ao montar o componente, conecta
    connect();

    // Ao desmontar (ex: usuário fecha a aba), desconecta
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return null; // Não renderiza nada na tela
};