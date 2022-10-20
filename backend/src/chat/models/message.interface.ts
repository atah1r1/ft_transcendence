import { User } from "@prisma/client";
import { RoomUser } from "./room-user.interface";
import { Room } from "./room.interface";

export interface Message {
	id: number;
	room: Room;
	roomUser: RoomUser;
	message: string;
	createdAt: Date;
	updatedAt: Date;
}