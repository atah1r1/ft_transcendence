import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UserService, private jwt: JwtService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const bearerToken =
      context.switchToWs().getClient().handshake.headers.token ?? '';

    try {
      const decoded = this.jwt.verifyAsync(bearerToken, {
        secret: process.env.JWT_SECRET,
      }) as any;

      return new Promise(async (resolve) => {
        const user = await this.userService.getUserById(decoded.id, decoded.id);
        if (user) {
          context.switchToWs().getData().id = user.id;
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } catch (err) {
      return Promise.resolve(false);
    }
  }
}
