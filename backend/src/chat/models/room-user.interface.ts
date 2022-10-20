import { User } from "@prisma/client";

export interface RoomUser {
	id: number;
	roomId: string;
	user: User;
	isAdmin: boolean;
	createdAt: Date;
	updatedAt: Date;
}