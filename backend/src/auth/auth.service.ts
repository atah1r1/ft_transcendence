import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}
    async Login(username: string, name: object, photos: object): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {username: username},
        });
        if (user.username === username) {
            return user;
        }
        return await this.prisma.user.create({
            data: {
                username: username,
                first_name: name['givenName'],
                last_name: name['familyName'],
                avatar: photos[0]['value'],
            },
        });
    }
}
