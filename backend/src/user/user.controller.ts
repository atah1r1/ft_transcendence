import { Controller, Get, Post, Req, UseGuards, Res, Body, UseInterceptors, ClassSerializerInterceptor, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyCodeDto } from './dto/verify2fa.dto';
import { UserEntity } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private prisma: PrismaService, private UserService: UserService, private cloudinary: CloudinaryService) { }
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('me')
    async me(@Req() req: any): Promise<UserEntity> {
        return new UserEntity(req.user);
    }

    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                fileSize: 1024 * 1024 * 1,
                fieldSize: 1024 * 1024 * 1,
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                    cb(null, true);
                } else {
                    cb(null, false);
                    return cb(new BadRequestException('Only .png, .jpg and .jpeg format allowed!'), false);
                }
            }
        }),
    )
    @Post('upload')
    async uploadedImage(@UploadedFile() file: Express.Multer.File) {
        return await this.cloudinary.uploadImage(file).catch(() => {
            throw new BadRequestException('Invalid file type.');
        });
    }

    @Post('2fa/activate')
    async activate2fa(@Req() req: any) {
        return await this.UserService.activate2fa(req.user);
    }

    @Post('2fa/deactivate')
    async deactivate2fa(@Req() req: any) {
        return await this.UserService.deactivate2fa(req.user);
    }

    @Post('2fa/verify')
    async verify2fa(@Req() req: any, @Res() res: any, @Body() body: VerifyCodeDto) {
        const { code } = body;
        const user = await this.UserService.verify2fa(req.user, code);
        if (user) {
            return res.json({ success: true });
        }
        return res.json({ success: false });
    }
}
