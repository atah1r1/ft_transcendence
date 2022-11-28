import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Room,
  RoomUser,
  Message,
  RoomPrivacy,
  User,
  RoomRole,
  RoomUserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // NOTE: userId -> [socketId]
  connectedUsers: Map<string, Socket[]> = new Map();

  // Connected Users
  /**
   * return list of currently connected users ids from connectedUsers map
   * @returns list of string ids or empty list
   */
  getConnectedUsersIds(): string[] {
    return [...this.connectedUsers.keys()];
  }

  /**
   * finds and returns list of friends (User) of @userId who are currently connected
   * @param userId User excuting the action
   * @returns list of User objects or empty list
   */
  async getConnectedFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const connectedUsers = friends.filter((friend) =>
      this.connectedUsers.has(friend.id),
    );
    return connectedUsers;
  }

  /**
   * If userId is connected, returns list of sockets that represent all the devices that user is connected from.
   * @param userId User excuting the action
   * @returns list of Socket objects or empty list
   */
  getConnectedUserById(userId: string): Socket[] {
    return this.connectedUsers.get(userId) ?? [];
  }

  /**
   * Add new socket to connectedUsers map, when user is connected.
   * @param userId User excuting the action
   * @param socket newly connected socket
   */
  addConnectedUser(userId: string, socket: Socket) {
    const sockets = this.connectedUsers.get(userId);
    if (sockets) {
      sockets.push(socket);
    } else {
      this.connectedUsers.set(userId, [socket]);
    }
  }

  /**
   * Remove disconnected socket from connectedUsers map, when user is disconnected.
   * If all sockets from same user are disconnected, remove user from map.
   * @param userId User excuting the action
   * @param socket socket to remove when disconneted
   */
  removeConnectedUser(userId: string, socket: Socket) {
    const sockets = this.connectedUsers.get(userId);
    if (!sockets) return;
    const newSockets = sockets.filter((s) => s.id !== socket.id);
    if (newSockets.length === 0) {
      this.connectedUsers.delete(userId);
    } else {
      this.connectedUsers.set(userId, newSockets);
    }
  }

  // Rooms
  /**
   * Create new DM room between two users
   * @param userId User excuting the action | creator of DM
   * @param otherUserId second user in DM
   * @returns Room object or throws error
   */
  async createDm(userId: string, otherUserId: string): Promise<any> {
    const _existingDm = await this.getDmByUserIds(userId, otherUserId);
    if (_existingDm) return this.formatChat(userId, _existingDm, true);

    const otherUser = await this.userService.getUserById(userId, otherUserId);
    if (!otherUser) throw new Error('User does not exist or blocked');

    const _room = await this.prisma.room.create({
      data: {
        name: null,
        image: null,
        password: null,
        privacy: 'PRIVATE',
        isDm: true,
      },
    });

    await this.addUserToRoom(userId, _room.id, null, RoomRole.OWNER);
    await this.addUserToRoom(otherUserId, _room.id, null, RoomRole.OWNER);
    await this.userService.addFriend(userId, otherUserId);
    const _updatedRoom = await this.getRoomById(_room.id, true);

    return await this.formatChat(userId, _updatedRoom, false);
  }

  /**
   * Create new (PUBLIC, PRIVATE, PROTECTED) room and set creator as owner
   * @param creatorId User excuting the action | creator/owner of room
   * @param name room name
   * @param image room avatar
   * @param privacy room privacy (PUBLIC, PRIVATE, PROTECTED)
   * @param password room password (only if privacy is PROTECTED)
   * @returns Room object or throws error
   */
  async createRoom(
    creatorId: string,
    name: string,
    image: string,
    privacy: RoomPrivacy,
    password: string,
  ): Promise<any> {
    let _hashed: string = null;
    const _existingRoom = await this.getRoomByName(name);
    if (_existingRoom) throw new Error('Room with same name already exists');

    if (privacy === RoomPrivacy.PROTECTED) {
      _hashed = await this.encryptRoomPassword(password);
    }

    const _room = await this.prisma.room.create({
      data: {
        name: name,
        image: image,
        privacy: privacy,
        password: _hashed,
        isDm: false,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    await this.addUserToRoom(creatorId, _room.id, password, RoomRole.OWNER);
    return await this.formatChat(creatorId, _room, false);
  }

  /**
   * Utility: Deletes DM, when a user blocks a friend user,
   * Only called from inside not accessible in API or Gateway.
   * @param roomId dm id to be deleted
   */
  async deleteDm(roomId: string) {
    const _dm = await this.getRoomById(roomId);
    if (!_dm) throw new Error('Room does not exist');
    if (!_dm.isDm) throw new Error('Room is not a DM');
    await this.deleteAllMessagesInRoom(roomId);
    await this.removeAllMembersFromRoom(roomId);
    await this.prisma.room.delete({ where: { id: roomId } });
  }

  /**
   * Finds and returns DMs/Rooms that user is a member of except (BANNED, LEFT)
   * @param userId User excuting the action
   * @param includeUsers should include list of members > users in room
   * @returns return list of Room objects or empty list
   */
  async getRoomsByUserId(
    userId: string,
    includeUsers = false,
  ): Promise<Room[]> {
    const _rooms = await this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            status: {
              notIn: [RoomUserStatus.BANNED, RoomUserStatus.LEFT],
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: includeUsers,
          },
        },
      },
    });

    return _rooms;
  }

  /**
   * Finds room by id and returns it, or null if not found
   * @param roomId room id
   * @param includeMembers shoud include list of members in room
   * @returns return Room object or null
   */
  async getRoomById(roomId: string, includeMembers = false): Promise<any> {
    const _room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: includeMembers,
          },
        },
      },
    });
    return _room;
  }

  /**
   * Finds and returns DM by two users ids, or null if not found
   * @param userId User excuting the action | first user in DM
   * @param otherUserId second user in DM
   * @returns Room object or null
   */
  async getDmByUserIds(userId: string, otherUserId: string): Promise<any> {
    const _room = await this.prisma.room.findFirst({
      where: {
        isDm: true,
        members: {
          every: {
            userId: {
              in: [userId, otherUserId],
            },
          },
        },
      },
    });

    return _room;
  }

  /**
   * Utility: Hashes and returns a room password, used when creating a PROTECTED room
   * @param password room password
   * @returns hashed password string
   */
  private async encryptRoomPassword(password: string): Promise<string> {
    const _saltRounds = 10;
    const _hashed = await bcrypt.hash(password, _saltRounds);
    return _hashed;
  }

  /**
   * Utility: Compares and returns true if password matches hashed password,
   * otherwise false
   * @param password plain room password
   * @param hashed hashed room password
   * @returns true if password matches, false if not
   */
  private async validateRoomPassword(
    password: string,
    hashed: string,
  ): Promise<boolean> {
    const _isValid = await bcrypt.compare(password, hashed);
    return _isValid;
  }

  // Rooms/RoomUsers
  /**
   * Add user to room, by creating new RoomUser object linked to Room and User,
   * or updating existing RoomUser status to NORMAL if already LEFT room.
   * @param userToAddId User to be added to room
   * @param roomId room id
   * @param password password if room is PROTECTED
   * @param role role of user in room (OWNER, ADMIN, MEMBER)
   * @returns RoomUser object or throws error
   */
  async addUserToRoom(
    userToAddId: string,
    roomId: string,
    password?: string,
    role: RoomRole = RoomRole.MEMBER,
  ): Promise<RoomUser> {
    const _room = await this.getRoomById(roomId);
    if (!_room) throw new Error('Room does not exist');

    if (
      _room.privacy === RoomPrivacy.PROTECTED &&
      !(await this.validateRoomPassword(password, _room.password))
    )
      throw new Error('Incorrect room password');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToAddId,
      roomId,
    );

    if (_existingRoomUser) {
      if (_existingRoomUser.status !== RoomUserStatus.LEFT)
        throw new Error('User already in room');
      const _roomUser = await this.prisma.roomUser.update({
        where: { id: _existingRoomUser.id },
        data: {
          status: RoomUserStatus.NORMAL,
          role: role,
        },
      });
      return _roomUser;
    }

    const _roomUser = await this.prisma.roomUser.create({
      data: {
        role: role,
        hasRead: true,
        roomId: roomId,
        userId: userToAddId,
      },
    });

    return _roomUser;
  }

  /**
   * Self join user to a PUBLIC/PROTECTED room,
   * by creating new RoomUser object linked to Room and User,
   * @param userId User excuting the action | user to join room
   * @param roomId room id
   * @param password password if room is PROTECTED
   * @returns RoomUser object or throws error
   */
  async selfJoinRoom(
    userId: string,
    roomId: string,
    password?: string,
  ): Promise<RoomUser> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room does not exist');
    if (room.isDm) throw new Error('Cannot join DM');
    if (room.privacy === RoomPrivacy.PRIVATE)
      throw new Error('Cannot join private room');
    const ru = await this.addUserToRoom(userId, roomId, password);
    return ru;
  }

  /**
   * Adds user to room by an OWNER/ADMIN, if user LEFT room before, updates status to NORMAL.
   * @param adminId User excuting the action | owner/admin user id
   * @param userToAddId user to be added to room
   * @param roomId room id
   * @returns RoomUser object or throws error
   */
  async addUserToRoomByAdmin(
    adminId: string,
    userToAddId: string,
    roomId: string,
  ): Promise<RoomUser> {
    const _room = await this.getRoomById(roomId);
    if (!_room) throw new Error('Room does not exist');
    if (_room.isDm) throw new Error('Room is a DM');
    const _adminRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      adminId,
      roomId,
    );
    if (!_adminRoomUser || _adminRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_adminRoomUser.role === RoomRole.MEMBER)
      throw new Error('You are not an admin or owner');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToAddId,
      roomId,
    );
    if (_existingRoomUser) {
      if (_existingRoomUser.status !== RoomUserStatus.LEFT)
        throw new Error('User already in room');
      const _roomUser = await this.prisma.roomUser.update({
        where: { id: _existingRoomUser.id },
        data: {
          status: RoomUserStatus.NORMAL,
          role: RoomRole.MEMBER,
        },
      });
      return _roomUser;
    }

    const _roomUser = await this.prisma.roomUser.create({
      data: {
        role: RoomRole.MEMBER,
        status: RoomUserStatus.NORMAL,
        hasRead: false,
        roomId: roomId,
        userId: userToAddId,
      },
    });
    return _roomUser;
  }

  /**
   * Removes user from Room, by updating RoomUser status to LEFT,
   * can't remove OWNER user.
   * @param userToRemoveId user to be removed from room
   * @param roomId room id
   * @returns RoomUser object or throws error
   */
  async removeUserFromRoom(
    userToRemoveId: string,
    roomId: string,
  ): Promise<RoomUser> {
    const _room = await this.getRoomById(roomId);
    if (!_room) throw new Error('Room does not exist');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToRemoveId,
      roomId,
    );
    if (!_existingRoomUser || _existingRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_room.isDm) throw new Error('Cannot leave DM');
    if (_existingRoomUser.role === RoomRole.OWNER)
      throw new Error('Cannot leave room as owner');

    // NEW METHOD: set status as left
    const _leftRu = await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        status: RoomUserStatus.LEFT,
      },
    });
    return _leftRu;
    // OLD METHOD: Delete room user
    // NEED TO DELETE ALL MESSAGES FROM USER IN ROOM
    // await this.deleteAllMessagesOfRoomUser(_existingRoomUser.id);
    // const _deletedRu = await this.prisma.roomUser.delete({
    //   where: {
    //     id: _existingRoomUser.id,
    //   },
    // });
    // return _deletedRu;
  }

  /**
   * Removes user from Room by an OWNER/ADMIN, by updating RoomUser status to LEFT,
   * @param adminId User excuting the action | owner/admin user id
   * @param userToRemoveId user to be removed from room
   * @param roomId room id
   * @returns true if user removed, false if not or throws error
   */
  async removeUserFromRoomByAdmin(
    adminId: string,
    userToRemoveId: string,
    roomId: string,
  ): Promise<boolean> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');
    if (_room.isDm) throw new Error('Cannot leave DM');

    const _adminRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      adminId,
      roomId,
    );
    if (!_adminRoomUser || _adminRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_adminRoomUser.role === RoomRole.MEMBER)
      throw new Error('You are not an admin or owner');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToRemoveId,
      roomId,
    );
    if (!_existingRoomUser || _existingRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_existingRoomUser.role === RoomRole.OWNER)
      throw new Error('Cannot remove owner');

    // NEW METHOD: set status as left
    const _leftRu = await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        status: RoomUserStatus.LEFT,
      },
    });
    return _leftRu ? true : false;
    // NEED TO DELETE ALL MESSAGES FROM USER
    // await this.deleteAllMessagesOfRoomUser(_existingRoomUser.id);
    // const _deletedRu = await this.prisma.roomUser.delete({
    //   where: {
    //     id: _existingRoomUser.id,
    //   },
    // });

    // return _deletedRu ? true : false;
  }

  /**
   * Utility: deletes all members of a room,
   * MUST only be called after deleting all messages in room,
   * otherwise will fail.
   * @param roomId room id
   */
  async removeAllMembersFromRoom(roomId: string) {
    const _room = await this.getRoomById(roomId);
    if (!_room) throw new Error('Room does not exist');

    await this.prisma.roomUser.deleteMany({
      where: {
        roomId: roomId,
      },
    });
  }

  /**
   * Mute/Ban/Kick or Unmute/Unban/Unkick a user from room by an OWNER/ADMIN,
   * @param adminId User excuting the action | owner/admin user id
   * @param subjectedUserId user being affected by action
   * @param roomId room id
   * @param newStatus one of (NORMAL, MUTED, BANNED, LEFT)
   * @returns RoomUser object or throws error
   */
  async updateUserStatusByAdmin(
    adminId: string,
    subjectedUserId: string,
    roomId: string,
    newStatus: RoomUserStatus,
  ): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _adminRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      adminId,
      roomId,
    );
    if (!_adminRoomUser || _adminRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('You are not in room');
    if (_adminRoomUser.role === RoomRole.MEMBER)
      throw new Error('You are not an admin or owner');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      subjectedUserId,
      roomId,
    );
    if (!_existingRoomUser || _existingRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_existingRoomUser.role === RoomRole.OWNER)
      throw new Error('Cannot mute/ban owner');
    if (_existingRoomUser.status === newStatus)
      throw new Error(`User is already ${newStatus}`);

    const ru = await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        status: newStatus,
      },
    });

    return ru;
  }

  /**
   * Makes a member an admin of room by an OWNER.
   * @param ownerId User excuting the action | owner/admin user id
   * @param subjectedUserId user being affected by action
   * @param roomId room id
   * @returns RoomUser object or throws error
   */
  async makeUserAdmin(
    ownerId: string,
    subjectedUserId: string,
    roomId: string,
  ): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _ownerRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      ownerId,
      roomId,
    );
    if (!_ownerRoomUser || _ownerRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('You are not in room');
    if (_ownerRoomUser.role !== RoomRole.OWNER)
      throw new Error('You are not an owner');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      subjectedUserId,
      roomId,
    );
    if (!_existingRoomUser || _existingRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_existingRoomUser.role === RoomRole.OWNER)
      throw new Error('Cannot change owner role');
    if (_existingRoomUser.role === RoomRole.ADMIN)
      throw new Error('User is already an admin');
    if (_existingRoomUser.status !== RoomUserStatus.NORMAL)
      throw new Error('User is either muted/banned or left room :p');

    const ru = await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        role: RoomRole.ADMIN,
      },
    });

    return ru;
  }

  /**
   * find and return RoomUsers of a room except RoomUserStatus.LEFT users.
   * @param userId User excuting the action
   * @param roomId Target room
   * @param includeUser should the user object be included in the result
   * @param includeRoom should the room object be included in the result
   * @returns list of RoomUser objects
   */
  async getRoomUsersByRoomId(
    userId: string,
    roomId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any[]> {
    const _blockedUsersIds = (
      await this.userService.getBlockedUsers(userId)
    ).map((user) => user.id);

    const _roomUsers = await this.prisma.roomUser.findMany({
      where: {
        roomId: roomId,
        userId: {
          notIn: _blockedUsersIds,
        },
        status: {
          not: RoomUserStatus.LEFT,
        },
      },
      include: {
        user: includeUser,
        room: includeRoom,
      },
    });
    return _roomUsers;
  }

  /**
   * Return list of room members, except userId itself.
   * Sorted by role: OWNER > ADMIN > MEMBER
   * @param userId User excuting the action
   * @param roomId room id
   * @returns list of RoomUser objects or throws error
   */
  async getRoomMembersByRoomId(userId: string, roomId: string): Promise<any[]> {
    const ru = await this.getRoomUserByUserIdAndRoomId(userId, roomId);

    if (!ru || ru.status === RoomUserStatus.LEFT)
      throw new Error('You are not in room');

    if (ru.status === RoomUserStatus.BANNED)
      throw new Error('You are banned from room');

    const members = await this.getRoomUsersByRoomId(userId, roomId);

    if (members) {
      members.sort((a, b) => {
        if (a.role === b.role) return 0;
        if (a.role === RoomRole.OWNER) return -1;
        if (b.role === RoomRole.OWNER) return 1;
        if (a.role === RoomRole.ADMIN) return -1;
        if (b.role === RoomRole.ADMIN) return 1;
        return 0;
      });
    }
    return members ?? [];
  }

  // async getRoomUsersByUserId(
  //   userId: string,
  //   includeUser = false,
  //   includeRoom = false,
  // ): Promise<any[]> {
  //   const _roomUsers = await this.prisma.roomUser.findMany({
  //     where: {
  //       userId: userId,
  //     },
  //     include: {
  //       user: includeUser,
  //       room: includeRoom,
  //     },
  //   });
  //   return _roomUsers;
  // }

  /**
   * Finds RoomUser by userId and roomId, returns null if not found.
   * DOES NOT CHECK RoomUserStatus.LEFT, must be checked by caller.
   * @param userId User excuting the action | user in search
   * @param roomId room id in search
   * @param includeUser should the user object be included in the result
   * @param includeRoom should the room object be included in the result
   * @returns RoomUser object or null
   */
  async getRoomUserByUserIdAndRoomId(
    userId: string,
    roomId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any> {
    const _roomUser = await this.prisma.roomUser.findFirst({
      where: {
        userId: userId,
        roomId: roomId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      },
    });
    return _roomUser;
  }

  /**
   * Finds Room with the exact @name.
   * @param name name of room to find
   * @returns Room object or null
   */
  async getRoomByName(name: string): Promise<Room> {
    const _room = await this.prisma.room.findFirst({
      where: {
        name: name,
      },
    });
    return _room;
  }

  /**
   * Finds and returns list of PUBLIC/PROTECTED Room objects with names that contains @name,
   * and userId is not a member of.
   * @param userId User excuting the action
   * @param name name to search for
   * @returns list of Room objects or empty list
   */
  async findRoomsByName(userId: string, name: string): Promise<Room[]> {
    const _rooms = await this.prisma.room.findMany({
      where: {
        isDm: false,
        name: {
          contains: name,
        },
        NOT: {
          privacy: RoomPrivacy.PRIVATE,
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
    });
    return _rooms;
  }

  /**
   * Returns all PUBLIC/PROTECTED Room objects that userId is not a member of.
   * @param userId User excuting the action
   * @returns list of Room objects or empty list
   */
  async getRooms(userId: string): Promise<Room[]> {
    const _rooms = await this.prisma.room.findMany({
      where: {
        isDm: false,
        NOT: {
          privacy: RoomPrivacy.PRIVATE,
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
    });
    return _rooms;
  }

  /**
   * Utility: Converts Room object to Chat object.
   * @param userId User excuting the action
   * @param room Room object
   * @param existing whether the room already exists, or newly created (if newly created user must be redirected to chat).
   * @returns Chat object
   */
  async formatChat(userId: string, room: any, existing: boolean): Promise<any> {
    let _name: string = null;
    let _image: string = null;
    const _members: User[] = room.members.map((ru) => {
      delete ru.user.two_factor_auth;
      delete ru.user.two_factor_auth_uri;
      delete ru.user.two_factor_auth_key;
      return ru.user;
    });

    if (room.isDm) {
      _name = _members.find((member: User) => member.id !== userId).username;
      _image = _members.find((member: User) => member.id !== userId).avatar;
    } else {
      _name = room.name;
      _image = room.image;
    }

    const _lastMessage: any = await this.getLastMessageByRoomId(
      userId,
      room.id,
    );
    const _wasRead: boolean = (
      await this.getRoomUserByUserIdAndRoomId(userId, room.id)
    ).hasRead;

    return {
      roomId: room.id,
      name: _name,
      image: _image,
      updatedAt: room.updatedAt,
      lastMessage: _lastMessage,
      isDm: room.isDm,
      wasRead: _wasRead,
      existing: existing,
      members: _members,
    };
  }

  // Chats
  /**
   * Returns list of Chat objects for userId, sorted by updated date.
   * updatedAt is the last message date.
   * @param userId User excuting the action
   * @returns list of Chat objects sorted by updated date.
   */
  async getChatsByUserId(userId: string): Promise<any[]> {
    const _rooms: Room[] = await this.getRoomsByUserId(userId, true);

    const _chatPromises = _rooms.map(async (room) => {
      return await this.formatChat(userId, room, true);
    });

    const _sortedChats = (await Promise.all(_chatPromises)).sort((a, b) => {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    return _sortedChats;
  }

  /**
   * Set RoomUser of userId and roomId as seen or not.
   * Called when user enters a chat.
   * @param userId User excuting the action
   * @param roomId room id
   * @param seen boolean: set as seen or not
   */
  async updateSeen(userId: string, roomId: string, seen: boolean) {
    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userId,
      roomId,
    );
    if (!_existingRoomUser || _existingRoomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');

    await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        hasRead: seen,
      },
    });
  }

  /**
   * Update RoomUser hasRead (seen) for all members of room,
   * except userId and/ banned users.
   * @param userId User excuting the action
   * @param roomId room id
   * @param seen boolean: set as seen or not
   */
  async updateSeenInRoom(userId: string, roomId: string, seen: boolean) {
    const members = await this.getRoomUsersByRoomId(userId, roomId);
    members.forEach(async (member) => {
      if (member.userId === userId || member.status === RoomUserStatus.BANNED)
        return;
      await this.prisma.roomUser.update({
        where: {
          id: member.id,
        },
        data: {
          hasRead: seen,
        },
      });
    });
  }

  // Messages
  /**
   * Creates a new Message object if userId is in Room and not banned/muted.
   * @param userId User excuting the action | sender
   * @param roomId room id
   * @param message message content
   * @returns Formatted Message object or throws error
   */
  async createMessage(
    userId: string,
    roomId: string,
    message: string,
  ): Promise<Message> {
    const _room = await this.getRoomById(roomId);
    if (!_room) throw new Error('Room not found');
    const _roomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userId,
      roomId,
    );
    if (!_roomUser || _roomUser.status === RoomUserStatus.LEFT)
      throw new Error('User not in room');
    if (_roomUser.status !== RoomUserStatus.NORMAL)
      throw new Error('User is banned or muted');
    const _message: Message = await this.prisma.message.create({
      data: {
        message: message,
        roomUserId: _roomUser.id,
        roomId: roomId,
      },
      include: {
        roomUser: {
          include: {
            user: true,
          },
        },
        room: true,
      },
    });
    if (_message) {
      await this.prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    return this.formatMessage(_message);
  }

  /**
   * Returns all messages in room, except messages from Blocked users.
   * @param userId User excuting the action
   * @param roomId room id
   * @param includeUser should user object be included in the result
   * @param includeRoom should room object be included in the result
   * @returns list of Message objects or throws error
   */
  async getMessagesByRoomId(
    userId: string,
    roomId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any[]> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room does not exist');

    const _roomUser = await this.getRoomUserByUserIdAndRoomId(userId, roomId);
    if (!_roomUser || _roomUser.status === RoomUserStatus.LEFT)
      throw new Error('You are not in room');

    if (_roomUser.isBanned) throw new Error('User is banned');

    const _blockedUsersIds = (
      await this.userService.getBlockedUsers(userId)
    ).map((user) => user.id);

    return await this.prisma.message.findMany({
      where: {
        roomId: roomId,
        roomUser: {
          userId: {
            notIn: _blockedUsersIds,
          },
        },
      },
      include: {
        roomUser: {
          include: {
            user: includeUser,
          },
        },
        room: includeRoom,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Utility: Deletes all messages of room.
   * IMPORTANT: No checks are made. Use with caution.
   * @param roomId room id
   */
  private async deleteAllMessagesInRoom(roomId: string) {
    await this.prisma.message.deleteMany({
      where: {
        roomId: roomId,
      },
    });
  }

  /**
   * Formats Message object to be returned to client.
   * @param message Message object
   * @returns Formatted Message object
   */
  private formatMessage(message: any): any {
    return {
      id: message.id,
      message: message.message,
      createdAt: message.createdAt,
      roomId: message.roomId,
      roomName: message.room.name,
      user: {
        id: message.roomUser.user.id,
        username: message.roomUser.user.username,
        avatar: message.roomUser.user.avatar,
      },
    };
  }

  /**
   * Utility: Wraps @getMessagesByRoomId() and formats the result.
   * @param userId User excuting the action
   * @param roomId room id
   * @returns list of Formatted Message objects or throws error
   */
  async getMessagesByRoomIdFormatted(userId: string, roomId: string) {
    const _messages = await this.getMessagesByRoomId(
      userId,
      roomId,
      true,
      true,
    );
    const _formattedMessages = _messages.map((message) => {
      return this.formatMessage(message);
    });
    return _formattedMessages;
  }

  /**
   * Gets last message in room, from non-blocked user.
   * @param userId User excuting the action
   * @param roomId room id
   * @param includeRoomUser should roomUser object be included in the result
   * @param includeRoom should room object be included in the result
   * @returns Message object or null
   */
  private async getLastMessageByRoomId(
    userId: string,
    roomId: string,
    includeRoomUser = false,
    includeRoom = false,
  ): Promise<any> {
    const blockedUsersIds = (
      await this.userService.getBlockedUsers(userId)
    ).map((user) => user.id);

    return await this.prisma.message.findFirst({
      where: {
        roomId: roomId,
        roomUser: {
          userId: {
            notIn: blockedUsersIds,
          },
        },
      },
      include: {
        roomUser: includeRoomUser,
        room: includeRoom,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
