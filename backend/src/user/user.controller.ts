import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
  BadRequestException,
  Patch,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyCodeDto } from './dto/verify2fa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { User } from '@prisma/client';
import { use } from 'passport';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private cloudinary: CloudinaryService,
  ) {}
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
        fieldSize: 1024 * 1024 * 1,
      },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype == 'image/png' ||
          file.mimetype == 'image/jpg' ||
          file.mimetype == 'image/jpeg'
        ) {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(
            new BadRequestException(
              'Only .png, .jpg and .jpeg format allowed!',
            ),
            false,
          );
        }
      },
    }),
  )
  @Post('upload')
  async uploadedImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    try {
      const { secure_url } = await this.cloudinary.uploadImage(file);
      const user = await this.prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: secure_url },
      });
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
  @Get('friends')
  async getFriends(@Req() req: any): Promise<User[]> {
    try {
      const friends = await this.userService.getFriends(req.user.id);
      if (friends) {
        return friends;
      }
      return [];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // get blocked users
  @Get('blocked')
  async getBlockedUsers(@Req() req: any): Promise<User[]> {
    try {
      const bUsers = await this.userService.getBlockedUsers(req.user.id);
      if (bUsers) {
        return bUsers;
      }
      return [];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // get All users
  @Get('all')
  async getAllUsers(@Req() req: any): Promise<User[]> {
    try {
      const users = await this.userService.getAllUsers(req.user.id);
      if (users) {
        return users;
      }
      return [];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // search user by username
  @Get('search')
  async searchUser(
    @Req() req: any,
    @Query('q') keyword: string,
  ): Promise<User[]> {
    if (!keyword || keyword.length === 0) {
      return [];
    }
    const users = await this.userService.searchUser(req.user.id, keyword);
    if (users) {
      return users;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  // get user by id ``` keep this the last route ```
  @Get('/:id')
  async getUser(@Req() req: any, @Param('id') id: string): Promise<User> {
    try {
      const user = await this.userService.getUserById(req.user.id, id);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
