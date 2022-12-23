import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
  async fortyTwoAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    console.log(req.user['_json'].image?.link);
    const { username, name, _json } = req.user;
    const image = _json?.image?.link;
    const jwt = await this.AuthService.Login(username, name, image);
    res.cookie('jwt', jwt);
    return res.redirect('http://localhost:3000/profile');
  }

  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    await this.AuthService.logoutService(req.user);
    res.clearCookie('jwt');
    return res.redirect('http://localhost:3000/');
  }
}
