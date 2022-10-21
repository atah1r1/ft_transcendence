import { RoomUser } from "./room-user.interface";

export interface Room {
	id: string;
	roomId: string;
	name: string;
	image: string;
	requiresPassword: boolean;
	password: string;
	isDm: boolean;
	members: RoomUser[];
	createdAt: Date;
	updatedAt: Date;
}
