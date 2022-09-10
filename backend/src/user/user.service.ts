import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    getUsers(): object {
        return {"error": 'object'};
    }
}
