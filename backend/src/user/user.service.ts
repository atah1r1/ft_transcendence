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
    // console.log(otpauthUrl);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { two_factor_auth: true, two_factor_auth_uri: otpauthUrl },
    });
    // console.log(otpauthUrl);
    return { two_factor_auth_uri: otpauthUrl };
  }

  async deactivate2fa(user: any) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { two_factor_auth: false, two_factor_auth_uri: null },
    });
    return { message: '2FA deactivated' };
  }

  async verify2fa(user: any, code: string) {
    const isValid = authenticator.verify({
      token: code,
      secret: user.two_factor_auth_key,
    });
    if (isValid) {
      return true;
    }
    return false;
  }

  async checkIfUsernameExists(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    console.log(user);
    if (user) {
      return true;
    }
    return false;
  }

  async updateProfile(user: any, body: any) {
    const { first_name, last_name, username } = body;
    const data = { first_name, last_name, username };
    if (await this.checkIfUsernameExists(username)) {
      return { message: 'Username already exists' };
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

  async getFriends(id: string) {
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
    return friends;
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
    return blockedUser;
  }

  async addFriend(userId: string, friendId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const friend = await this.prisma.user.findUnique({
      where: { id: friendId },
    });

    if (user && friend) {
      const isFriend = await this.getFriends(userId).then((friends) => {
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const friend = await this.prisma.user.findUnique({
      where: { id: friendId },
    });

    if (user && friend) {
      const isFriend = await this.getFriends(userId).then((friends) => {
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const blockedUser = await this.prisma.user.findUnique({
      where: { id: blockedUserId },
    });

    if (user && blockedUser) {
      const isBlocked = await this.getBlockedUsers(userId).then((bUsers) => {
        return bUsers.some((friend) => friend.id === blockedUserId);
      });
      if (isBlocked) throw new Error('User is already blocked');

      const isFriend = await this.getFriends(userId).then((friends) => {
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
    return users;
  }

  // Get all users, except the current user, blocked users.
  async getAllUsers(id: string) {
    const blockedUsersIds = (await this.getBlockedUsers(id)).map((bu) => bu.id);
    // Add the user itself to this list so he doesn't see himself in the list
    blockedUsersIds.push(id);
    const friendsIds = (await this.getFriends(id)).map((f) => f.id);
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: blockedUsersIds,
        },
      },
    });
    const usersList = users.map((user) => {
      delete user.two_factor_auth_key;
      return {
        ...user,
        isFriend: friendsIds.includes(user.id),
      };
    });
    // sort the list to show friends first.
    usersList.sort((a, b) => {
      if (a.isFriend && !b.isFriend) return -1;
      if (!a.isFriend && b.isFriend) return 1;
      return 0;
    });
    return usersList;
  }
}
