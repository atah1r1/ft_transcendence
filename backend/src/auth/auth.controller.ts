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
        console.log(req.user["_json"].image?.link);
        const { username, name, _json } = req.user;
        const image  = _json?.image?.link;
        // if (await this.AuthService.checkUserTwoFactor(username)) {
        //     throw new BadRequestException('Two factor authentication is enabled');
        // }
        const jwt = await this.AuthService.Login(username, name, image);
        res.cookie('jwt', jwt);
        return res.redirect('http://localhost:3000/profile');
    }

    @Get('logout')
    async logout(@Res({ passthrough: true }) res: any) {
        res.clearCookie('jwt');
        return res.redirect('http://localhost:3000/');
    }
}
