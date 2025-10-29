import { create } from 'zustand';
import { Socket, io } from 'socket.io-client';
import { Incident, IncidentStatus, Resource, ResourceStatus } from '../types';
// 1. Importar a auth.store para pegar o token
import { useAuthStore } from './auth.store';

const API_URL = 'http://localhost:3000';
const WS_URL = 'http://localhost:3000';

interface DispatchState {
  socket: Socket | null;
  isConnected: boolean;
  incidentQueue: Incident[];
  availableResources: Resource[];
  connect: () => void;
  disconnect: () => void;
  loadInitialData: () => Promise<void>;
  assignResources: (
    incidentId: string,
    resourceIds: string[],
  ) => Promise<void>;
  // Métodos internos para manipulação do estado via WS
  _handleIncidentNew: (incident: Incident) => void;
  _handleIncidentAssigned: (assignment: {
    incident: Incident;
    resource: Resource;
  }) => void;
  // TODO: _handleResourceUpdate
}

export const useDispatchStore = create<DispatchState>((set, get) => ({
  socket: null,
  isConnected: false,
  incidentQueue: [],
  availableResources: [],

  /**
   * Conecta ao WebSocket
   */
  connect: () => {
    if (get().socket) return; // Já conectado

    const socket = io(WS_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      set({ isConnected: true, socket });
      get().loadInitialData(); // Carrega dados iniciais ao conectar
    });

    socket.on('disconnect', () => {
      set({ isConnected: false, socket: null });
    });

    // --- Listeners de Eventos do Backend ---
    
    // [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/dispatch/dispatch.gateway.ts]
    socket.on('incident:new', (incident: Incident) => {
      get()._handleIncidentNew(incident);
    });

    // [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/dispatch/dispatch.gateway.ts]
    socket.on('incident:assigned', (assignment) => {
      get()._handleIncidentAssigned(assignment);
    });

    // TODO: Adicionar listener para 'resource:update'
  },

  /**
   * Desconecta do WebSocket
   */
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false });
  },

  /**
   * Carrega os dados iniciais (fila e viaturas) via API REST
   */
  loadInitialData: async () => {
    // 2. Obter o token da auth.store
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('Sem token, impossível carregar dados iniciais.');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/incidents/incidents.controller.ts] (GET /incidents)
      const incidentsRes = await fetch(`${API_URL}/incidents`, { headers });
      const incidents = await incidentsRes.json();

      // [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/resources/resources.controller.ts] (GET /resources)
      const resourcesRes = await fetch(`${API_URL}/resources`, { headers });
      const resources = await resourcesRes.json();

      set({
        incidentQueue: incidents.filter(
          (inc: Incident) => inc.status === IncidentStatus.AWAITING_DISPATCH,
        ),
        availableResources: resources.filter(
          (res: Resource) => res.status === ResourceStatus.AVAILABLE,
        ),
      });
    } catch (error) {
      console.error('Falha ao carregar dados iniciais:', error);
    }
  },

  /**
   * Tenta alocar viaturas para uma ocorrência via API.
   * [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/dispatch/dispatch.controller.ts] (POST /dispatch/assign)
   */
  assignResources: async (incidentId: string, resourceIds: string[]) => {
    // 2. Obter o token da auth.store
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.error('Nenhum token de autenticação, impossível despachar.');
      alert('Erro de autenticação. Faça login novamente.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/dispatch/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 3. Adicionar o Bearer Token
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ incidentId, resourceIds }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao alocar viatura');
      }

      // Não precisamos de 'set' aqui. O WebSocket (evento incident:assigned)
      // será o responsável por atualizar o estado da store quando o
      // backend confirmar a alocação.
      console.log('Alocação enviada com sucesso.');
      
    } catch (error) {
      console.error('Erro ao despachar viatura:', error);
      alert(`Erro ao despachar: ${error}`);
    }
  },

  // --- Métodos Privados (Manipuladores de WS) ---

  _handleIncidentNew: (incident: Incident) => {
    set((state) => ({
      incidentQueue: [...state.incidentQueue, incident],
    }));
  },

  _handleIncidentAssigned: (assignment: {
    incident: Incident;
    resource: Resource;
  }) => {
    set((state) => ({
      // Remove a ocorrência da fila (agora ela está 'ASSIGNED')
      incidentQueue: state.incidentQueue.filter(
        (inc) => inc.id !== assignment.incident.id,
      ),
      // Atualiza o status da viatura para 'IN_TRANSIT'
      availableResources: state.availableResources.map((res) =>
        res.id === assignment.resource.id ? assignment.resource : res,
      ),
      // TODO: Em um app real, teríamos colunas separadas para
      // viaturas 'IN_TRANSIT' ou 'ON_SCENE'
    }));
  },
}));
