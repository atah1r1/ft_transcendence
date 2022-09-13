import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) {}
    @UseGuards(AuthGuard('42'))
    @Get('login')
    async fortyTwoAuth(@Req() req: any) {}

    @Get('redirect')
    @UseGuards(AuthGuard('42'))
    async fortyTwoAuthRedirect(@Req() req: any) {
        const { username, name, photos} = req.user;
        return this.AuthService.Login(username, name, photos);
    }

}
