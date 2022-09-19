import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private UserService: UserService) {}
    @Get('me')
    async me(@Req() req: any) {
        return req.user;
    }

    @Get('haha')
    async haha(@Req() req: any) {
        return req.user;
    }
}
