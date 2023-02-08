import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class FtAuthGuard extends AuthGuard('42') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) return null;
        return user;
    }
}