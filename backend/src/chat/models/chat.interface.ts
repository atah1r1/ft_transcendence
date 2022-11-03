import { Message } from "./message.interface";
import { Room } from "./room.interface";

export interface Chat {
	room: Room,
	name: string,
	image: string,
	lastMessage: Message,
	wasRead: boolean,
};
