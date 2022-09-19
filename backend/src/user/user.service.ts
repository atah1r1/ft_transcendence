import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    getUsers(): object {
        return {"data": ["data1", "data1", "data1", "data1", "data1", "data1"]};
    }
}
