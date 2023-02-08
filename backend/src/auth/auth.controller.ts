/* eslint-disable @typescript-eslint/no-empty-function */
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
import { FtAuthGuard } from './guards/fortyTwo.guard';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) { }
  @UseGuards(FtAuthGuard)
  @Get('login')
  async fortyTwoAuth(@Req() req: any) { }

  @Get('redirect')
  @UseGuards(FtAuthGuard)
  async fortyTwoAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    if (!req.user) return res.redirect(`${process.env.HOST_FRONT}/`);
    const { username, name, _json } = req.user;
    const image = _json?.image?.link;
    const jwt = await this.AuthService.login(username, name, image);
    res.cookie('jwt', jwt);
    return res.redirect(`${process.env.HOST_FRONT}/profile`);
  }

  @Get('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    res.clearCookie('jwt');
    return res.redirect(process.env.HOST_FRONT);
  }
}
