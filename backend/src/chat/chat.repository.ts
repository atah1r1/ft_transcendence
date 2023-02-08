import { Socket } from 'socket.io';

export default class ChatRepository {
  // NOTE: userId -> [socketId]
  connectedUsers: Map<string, Socket[]> = new Map();

  private static instance: ChatRepository;
  private constructor() {}
  public static getInstance(): ChatRepository {
    if (!ChatRepository.instance) {
      ChatRepository.instance = new ChatRepository();
    }
    return ChatRepository.instance;
  }
}
