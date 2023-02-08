import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { config } from 'dotenv';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';

config;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async activate2fa(user: any) {
    const otpauthUrl = authenticator.keyuri(
      user.id,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      user.two_factor_auth_key,
    );
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { two_factor_auth: true, two_factor_auth_uri: otpauthUrl },
    });
    return {
      two_factor_auth_uri: otpauthUrl,
      two_factor_auth: updated.two_factor_auth,
    };
  }

  async deactivate2fa(user: any) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { two_factor_auth: false, two_factor_auth_uri: null },
    });
    return { two_factor_auth: updated.two_factor_auth };
  }

  async verify2fa(user: any, code: string) {
    const isValid = authenticator.verify({
      token: code,
      secret: user.two_factor_auth_key,
    });
    if (isValid) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          code_verified: true,
        },
      });
      return true;
    }
    return false;
  }

  async checkIfUsernameExists(
    currentUserName: string,
    username: string,
  ): Promise<boolean> {
    if (currentUserName === username) return false;
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (user) {
      return true;
    }
    return false;
  }

  async updateProfile(user: any, body: any) {
    const currentUser = await this.getUserById(user.id, user.id);
    const { first_name, last_name, username } = body;
    const data: any = {};
    if (first_name) data.first_name = first_name;
    if (last_name) data.last_name = last_name;
    if (username) data.username = username;

    if (
      username &&
      (await this.checkIfUsernameExists(currentUser.username, username))
    ) {
      throw new HttpException('Username already exists', HttpStatus.NOT_FOUND);
    }
    return await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
  }

  async getUserById(userId: string, id: string): Promise<User> {
    const blockedUsersIds = (await this.getBlockedUsers(userId)).map(
      (user) => user.id,
    );

    if (blockedUsersIds.includes(id)) {
      throw new Error('User is blocked');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      delete user.two_factor_auth_key;
      return user;
    }

    throw new Error('User not found');
  }

  async getFriends(userId: string, id: string) {
    const blockedUsersIds = (await this.getBlockedUsers(userId)).map(
      (user) => user.id,
    );

    if (blockedUsersIds.includes(id)) {
      throw new Error('User is blocked');
    }

    const friends = await this.prisma.user
      .findUnique({
        where: { id },
      })
      .friends()
      .then((fs) => {
        if (fs !== null) {
          fs.map((f) => {
            delete f.two_factor_auth_key;
            return f;
          });
        }
        return fs;
      });
    return friends ?? [];
  }

  async getBlockedUsers(id: string) {
    const blockedUser = await this.prisma.user
      .findUnique({
        where: { id },
      })
      .blockedUsers()
      .then((bUsers) => {
        if (bUsers !== null) {
          bUsers.map((bu) => {
            delete bu.two_factor_auth_key;
            return bu;
          });
        }
        return bUsers;
      });
    return blockedUser ?? [];
  }

  async addFriend(userId: string, friendId: string) {
    const user = await this.getUserById(userId, userId);
    const friend = await this.getUserById(userId, friendId);

    if (userId === friendId) throw new Error('You cannot remove yourself');

    if (user && friend) {
      const isFriend = await this.getFriends(userId, userId).then((friends) => {
        return friends.some((friend) => friend.id === friendId);
      });
      if (isFriend) throw new Error('User is already your friend');

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          friends: {
            connect: {
              id: friendId,
            },
          },
        },
      });
      await this.prisma.user.update({
        where: { id: friendId },
        data: {
          friends: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return { message: 'Friend added' };
    } else {
      throw new Error('User not found');
    }
  }

  async removeFriend(userId: string, friendId: string) {
    const user = await this.getUserById(userId, userId);
    const friend = await this.getUserById(userId, friendId);

    if (userId === friendId) throw new Error('You cannot remove yourself');

    if (user && friend) {
      const isFriend = await this.getFriends(userId, userId).then((friends) => {
        return friends.some((friend) => friend.id === friendId);
      });
      if (!isFriend) throw new Error('User is not your friend');

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          friends: {
            disconnect: {
              id: friendId,
            },
          },
        },
      });
      await this.prisma.user.update({
        where: { id: friendId },
        data: {
          friends: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
      return { message: 'Friend removed' };
    } else {
      throw new Error('User not found');
    }
  }

  async blockUser(userId: string, blockedUserId: string) {
    const user = await this.getUserById(userId, userId);
    const blockedUser = await this.getUserById(userId, blockedUserId);

    if (userId === blockedUserId) throw new Error('You cannot block yourself');

    if (user && blockedUser) {
      const isBlocked = await this.getBlockedUsers(userId).then((bUsers) => {
        return bUsers.some((friend) => friend.id === blockedUserId);
      });
      if (isBlocked) throw new Error('User is already blocked');

      const isFriend = await this.getFriends(userId, userId).then((friends) => {
        return friends.some((friend) => friend.id === blockedUserId);
      });
      if (isFriend) {
        await this.removeFriend(userId, blockedUserId);
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          blockedUsers: {
            connect: {
              id: blockedUserId,
            },
          },
        },
      });
      await this.prisma.user.update({
        where: { id: blockedUserId },
        data: {
          blockedUsers: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } else {
      throw new Error('User not found');
    }
  }

  async searchUser(userId: string, username: string) {
    const blockedUsersIds = (await this.getBlockedUsers(userId)).map(
      (bu) => bu.id,
    );
    blockedUsersIds.push(userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: blockedUsersIds,
        },
        OR: [
          {
            username: {
              contains: username,
              mode: 'insensitive',
            },
          },
          {
            first_name: {
              contains: username,
              mode: 'insensitive',
            },
          },
          {
            last_name: {
              contains: username,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    return users ?? [];
  }

  // Get all users, except the current user, blocked users.
  async getAllUsers(userId: string) {
    const blockedUsersIds = (await this.getBlockedUsers(userId)).map((bu) => bu.id);
    // Add the user itself to this list so he doesn't see himself in the list
    blockedUsersIds.push(userId);
    const friendsIds = (await this.getFriends(userId, userId)).map((f) => f.id);
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: blockedUsersIds,
        },
      },
    });
    const usersList = users?.map((user) => {
      delete user.two_factor_auth_key;
      return {
        ...user,
        isFriend: friendsIds.includes(user.id),
      };
    });
    usersList?.sort((a, b) => {
      if (a.isFriend && !b.isFriend) return -1;
      if (!a.isFriend && b.isFriend) return 1;
      return 0;
    });
    return usersList ?? [];
  }
}
