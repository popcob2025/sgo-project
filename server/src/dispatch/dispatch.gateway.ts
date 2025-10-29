import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Incident } from '../incidents/entities/incident.entity';

// Habilita o CORS para o cliente React (ex: rodando em localhost:3001)
@WebSocketGateway({ cors: { origin: '*' } })
export class DispatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // Instância do servidor Socket.io
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    // TODO: Adicionar cliente a uma "sala" (ex: 'dispatchers')
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // --- Nossos métodos de notificação ---

  /**
   * Notifica todos os clientes sobre uma nova ocorrência na fila.
   * Evento: 'incident:new'
   */
  notifyNewIncident(incident: Incident) {
    console.log('Emitindo evento: incident:new');
    this.server.emit('incident:new', incident);
  }

  /**
   * Notifica todos os clientes que uma ocorrência foi despachada.
   * Evento: 'incident:assigned'
   */
  notifyIncidentAssigned(incident: Incident) {
    console.log('Emitindo evento: incident:assigned');
    this.server.emit('incident:assigned', incident);
  }
}
