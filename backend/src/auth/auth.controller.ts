import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
    async fortyTwoAuthRedirect(@Req() req: any, @Res({passthrough: true}) res: any) {
        const { username, name, photos} = req.user;
        const jwt = await this.AuthService.Login(username, name, photos);
        // return jwt;
        res.cookie('jwt', jwt);
        console.log(res);
        return {jwt};
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async me(@Req() req: any) {
        return req.user;
    }

}
