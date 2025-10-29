import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Incident, Resource } from '../types';

// A URL do nosso backend NestJS
const SOCKET_URL = 'http://localhost:3000';

// Interface do nosso estado
interface DispatchState {
  socket: Socket | null;
  incidentsQueue: Incident[]; // Fila de ocorrências (AWAITING_DISPATCH)
  availableResources: Resource[]; // Viaturas disponíveis

  // Ações de Conexão
  connect: () => void;
  disconnect: () => void;

  // Ações de API
  fetchInitialQueue: () => void;
  fetchAvailableResources: () => void;
  assignResources: (incidentId: string, resourceIds: string[]) => Promise<void>;
}

export const useDispatchStore = create<DispatchState>((set, get) => ({
  socket: null,
  incidentsQueue: [],
  availableResources: [],

  /**
   * Conecta ao WebSocket e registra os ouvintes (listeners).
   */
  connect: () => {
    if (get().socket) return; // Já conectado

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Socket.io conectado com sucesso:', socket.id);
      set({ socket });

      // Após conectar, buscamos os dados iniciais
      get().fetchInitialQueue();
      get().fetchAvailableResources();
    });

    socket.on('disconnect', () => {
      console.log('Socket.io desconectado.');
      set({ socket: null });
    });

    // --- Ouvintes de Eventos em Tempo Real ---

    /**
     * Ouve o evento 'incident:new' emitido pelo DispatchGateway.
     * [Ref: server/src/dispatch/dispatch.gateway.ts]
     */
    socket.on('incident:new', (newIncident: Incident) => {
      console.log('Evento recebido: incident:new', newIncident);
      // Adiciona a nova ocorrência no início da fila
      set((state) => ({
        incidentsQueue: [newIncident, ...state.incidentsQueue],
      }));
    });

    /**
     * Ouve o evento 'incident:assigned' emitido pelo DispatchGateway.
     * [Ref: server/src/dispatch/dispatch.gateway.ts]
     */
    socket.on('incident:assigned', (assignedIncident: Incident) => {
      console.log('Evento recebido: incident:assigned', assignedIncident);

      // Remove a ocorrência da fila de espera (AWAITING_DISPATCH)
      set((state) => ({
        incidentsQueue: state.incidentsQueue.filter(
          (inc) => inc.id !== assignedIncident.id,
        ),
      }));

      // Atualiza a lista de viaturas disponíveis
      get().fetchAvailableResources();
    });

    // Lidar com erros de conexão
    socket.on('connect_error', (err) => {
      console.error('Erro de conexão com Socket.io:', err.message);
    });
  },

  /**
   * Desconecta o socket.
   */
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },

  /**
   * Busca a fila inicial de ocorrências (GET /dispatch/queue).
   * [Ref: server/src/dispatch/dispatch.controller.ts]
   */
  fetchInitialQueue: async () => {
    // TODO: Adicionar header de autenticação (JWT)
    try {
      const response = await fetch('http://localhost:3000/dispatch/queue');
      const data: Incident[] = await response.json();
      set({ incidentsQueue: data });
    } catch (error) {
      console.error('Erro ao buscar fila inicial:', error);
    }
  },

  /**
   * Busca as viaturas disponíveis (GET /dispatch/available-resources).
   * [Ref: server/src/dispatch/dispatch.controller.ts]
   */
  fetchAvailableResources: async () => {
    // TODO: Adicionar header de autenticação (JWT)
    try {
      const response = await fetch('http://localhost:3000/dispatch/available-resources');
      const data: Resource[] = await response.json();
      set({ availableResources: data });
    } catch (error) {
      console.error('Erro ao buscar viaturas:', error);
    }
  },

  /**
   * Envia a ordem de despacho para o backend (POST /dispatch/assign).
   * [Ref: server/src/dispatch/dispatch.controller.ts]
   */
  assignResources: async (incidentId, resourceIds) => {
    try {
      // TODO: Adicionar header de autenticação (JWT)
      const response = await fetch('http://localhost:3000/dispatch/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ incidentId, resourceIds }),
      });

      if (!response.ok) {
        throw new Error('Falha ao despachar ocorrência.');
      }

      // O estado é atualizado automaticamente pelo listener 'incident:assigned'
      // assim que o backend confirma a operação.

    } catch (error) {
      console.error('Erro ao despachar viaturas:', error);
      // TODO: Mostrar erro para o usuário
    }
  },
}));