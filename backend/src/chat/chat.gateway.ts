import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
  constructor(private authService: AuthService, private chatService: ChatService) { }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
