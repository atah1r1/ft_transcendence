import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { config } from 'dotenv';

config();

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {}
    async Login(username: string, name: object, photos: object): Promise<String> {
        const user = await this.prisma.user.findUnique({
            where: {username: username},
        });
        if (user?.username === username) {
            return this.SignToken(user.id);
        }
        const user_created = await this.prisma.user.create({
            data: {
                username: username,
                first_name: name['givenName'],
                last_name: name['familyName'],
                avatar: photos[0]['value']
            },
        });
        return this.SignToken(user_created.id);
    }

    async SignToken(id: String): Promise<string> {
        const payload = {id: id};
        return this.jwt.signAsync(payload, {
            expiresIn: '3d',
            secret: process.env.JWT_SECRET,
        });
    }
}
