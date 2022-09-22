import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';

config;

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }
    async activate2fa(user: any) {
        const otpauthUrl = authenticator.keyuri(user.id, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, user.two_factor_auth_key);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { two_factor_auth: true },
        });
        return otpauthUrl;
    }
}
