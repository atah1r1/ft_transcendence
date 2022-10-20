import { User } from "@prisma/client";

// NOTE: WILL NOT BE SAVED IN DB
export interface ConnectdUser {
	id: number;
	user: User;
	socketId: [string];
}
