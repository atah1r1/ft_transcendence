import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) {}
    @Get('login')
    getUsers(): string {
        return this.AuthService.Login();
    }

}
