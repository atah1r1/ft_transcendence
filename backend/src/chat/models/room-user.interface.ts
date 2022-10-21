import { User } from "@prisma/client";
import { Room } from "./room.interface";

export interface RoomUser {
	id: string;
	room: Room;
	user: User;
	isAdmin: boolean;
	isBanned: boolean;
	createdAt: Date;
	updatedAt: Date;
}