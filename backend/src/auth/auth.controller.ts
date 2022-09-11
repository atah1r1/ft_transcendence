import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FortyTwoStrategy } from './42.strategy';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) {}
    @Get('login')
    // @UseGuards(AuthGuard('FortyTwoStrategy'))
    async fortyTwoAuth(@Req() req) {}

}
