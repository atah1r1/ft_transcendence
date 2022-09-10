import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private UserService: UserService) {}
    @Get()
    getUsers(): object {
        return this.UserService.getUsers();
    }
}
