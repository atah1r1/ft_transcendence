import { RoomUser } from "./room-user.interface";

export interface Room {
	id: number;
	roomId: string;
	name: string;
	requiresPassword: boolean;
	password: string;
	members: RoomUser[];
	createdAt: Date;
	updatedAt: Date;
}
