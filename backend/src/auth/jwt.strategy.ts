import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';

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
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        console.log(payload);
        return { id: payload.id };
    }
}