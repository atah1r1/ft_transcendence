import { BadRequestException, Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) { }
    @UseGuards(AuthGuard('42'))
    @Get('login')
    async fortyTwoAuth(@Req() req: any) { }

    @Get('redirect')
    @UseGuards(AuthGuard('42'))
    async fortyTwoAuthRedirect(@Req() req: any, @Res({ passthrough: true }) res: any) {
        const { username, name, photos } = req.user;
        // if (await this.AuthService.checkUserTwoFactor(username)) {
        //     throw new BadRequestException('Two factor authentication is enabled');
        // }
        const jwt = await this.AuthService.Login(username, name, photos);
        res.cookie('jwt', jwt);
        return res.redirect('http://localhost:3000/settings/profile');
    }

    @Get('logout')
    async logout(@Res({ passthrough: true }) res: any) {
        res.clearCookie('jwt');
        return { message: 'Logged out' };
    }
}
