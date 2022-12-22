import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { config } from 'dotenv';
import { authenticator } from 'otplib';


config();

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }
    async Login(username: string, name: object, photos: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { intra_name: username },
        });
        if (user?.intra_name === username) {
            return this.SignToken(user.id);
        }
        const user_created = await this.prisma.user.create({
            data: {
                intra_name: username,
                username: username,
                first_name: name['givenName'],
                last_name: name['familyName'],
                avatar: photos,
                two_factor_auth_key: authenticator.generateSecret(),
            },
        });
        return this.SignToken(user_created.id);
    }

    async SignToken(id: String): Promise<string> {
        const payload = { id: id };
        return this.jwt.signAsync(payload, {
            expiresIn: '3d',
            secret: process.env.JWT_SECRET,
        });
    }

    async verifyToken(token: string) {
        return this.jwt.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });
    }

    async checkUserTwoFactor(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username: username },
        });
        if (user?.two_factor_auth) {
            return true;
        }
        return false;
    }

    async logoutService(user: any) {
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                code_verified: false,
            }
        })
    }
}
