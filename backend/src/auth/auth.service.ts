import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    Login(): string {
        return 'Hello World!';
    }
}
