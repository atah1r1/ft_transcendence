import { Controller, Get, Post, Req, UseGuards, Res, Body, UseInterceptors, ClassSerializerInterceptor, UploadedFile, BadRequestException, Patch, HttpException, HttpStatus, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyCodeDto } from './dto/verify2fa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { User } from '@prisma/client';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private prisma: PrismaService, private userService: UserService, private cloudinary: CloudinaryService) { }
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('me')
    async me(@Req() req: any): Promise<User> {
        delete req.user.two_factor_auth_key;
        return req.user;
    }

    // update user profile
    @Patch('profile')
    async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
        return await this.userService.updateProfile(req.user, body);
    }

    // upload avatar
    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                fileSize: 1024 * 1024 * 1,
                fieldSize: 1024 * 1024 * 1
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
    async uploadedImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        try {
            const { secure_url } = await this.cloudinary.uploadImage(file);
            const user = await this.prisma.user.update({
                where: { id: req.user.id },
                data: { avatar: secure_url }
            })
            return { avatar: user.avatar };
        } catch {
            throw new BadRequestException('Error uploading image');
        }
    }

    // activate 2fa
    @Post('2fa/activate')
    async activate2fa(@Req() req: any) {
        return await this.userService.activate2fa(req.user);
    }

    // desactivate 2fa
    @Post('2fa/deactivate')
    async deactivate2fa(@Req() req: any) {
        return await this.userService.deactivate2fa(req.user);
    }


    // verify 2fa code
    @Post('2fa/verify')
    async verify2fa(@Req() req: any, @Body() body: VerifyCodeDto) {
        const { code } = body;
        const user = await this.userService.verify2fa(req.user, code);
        if (user) {
            throw new HttpException('2FA code correct', HttpStatus.OK);
        }
        throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
    }

    // get friends by id
    @Get('/friends')
    async getFriends(@Req() req: any): Promise<User[]> {
        try {
            console.log(req.user);
            const friends = await this.userService.getFriends(req.user.id);
            if (friends) {
                return friends;
            }
        } catch (error) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
    }

    // get user by id
    @Get('/:id')
    async getUser(@Param('id') id: string): Promise<User> {
        const user = await this.userService.getUserById(id);
        if (user) {
            return user;
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

}
