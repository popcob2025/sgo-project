import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class IncidentsGateway {
  @SubscribeMessage('message')
  handleMessage(): string {
    return 'Hello world!';
  }
}
