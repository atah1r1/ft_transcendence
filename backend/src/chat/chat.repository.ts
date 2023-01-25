import { Socket } from 'socket.io';

export default class ChatRepository {
  // NOTE: userId -> [socketId]
  connectedUsers: Map<string, Socket[]> = new Map();

  private static instance: ChatRepository;
  private constructor() {
    console.log('ChatRepository created');
  }
  public static getInstance(): ChatRepository {
    if (!ChatRepository.instance) {
      ChatRepository.instance = new ChatRepository();
    }
    return ChatRepository.instance;
  }
}
