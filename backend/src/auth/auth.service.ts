import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    Login(user: object): object {
        // const { id, username, name, photos } = user;
        return user;
    }
}
