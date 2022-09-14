import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { PrismaService } from 'src/prisma/prisma.service';

config();

const cookieExtractor = (req: any) => {
    var token = null;
    if (req && req.cookie) {
        token = req.cookie['jwt'];
    }
    console.log(req.headers.cookie.split('=')[1]);
    return req.headers.cookie.split('=')[1];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any, done: any) {
        const user = await this.prisma.user.findUnique({
            where: {id: payload.id},
        });
        return user;
    }
}