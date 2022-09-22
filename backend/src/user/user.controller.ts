import { Controller, Get, Post, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { toFileStream } from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private prisma: PrismaService, private UserService: UserService) { }
    @Get('me')
    async me(@Req() req: any) {
        return req.user;
    }

    @Post('2fa/activate')
    async activate2fa(@Req() req: any, @Res() res: any) {
        return toFileStream(res, await this.UserService.activate2fa(req.user));
    }
}
