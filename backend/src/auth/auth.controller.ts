import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) {}
    @Get('login')
    @UseGuards(AuthGuard('42'))
    async fortyTwoAuth(@Req() req) {}

    @Get('redirect')
    @UseGuards(AuthGuard('42'))
    async fortyTwoAuthRedirect(@Req() req) {
        return this.AuthService.Login();
    }

}
