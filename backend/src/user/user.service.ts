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
        // console.log(otpauthUrl);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { two_factor_auth: true, two_factor_auth_uri: otpauthUrl },
        });
        // console.log(otpauthUrl);
        return { two_factor_auth_uri: otpauthUrl };
    }

    async deactivate2fa(user: any) {
        await this.prisma.user.update({
            where: { id: user.id },
            data: { two_factor_auth: false, two_factor_auth_uri: null },
        });
        return { message: '2FA deactivated' };
    }

    async verify2fa(user: any, code: string) {
        const isValid = authenticator.verify({ token: code, secret: user.two_factor_auth_key });
        if (isValid) {
            return true;
        }
        return false;
    }
}
