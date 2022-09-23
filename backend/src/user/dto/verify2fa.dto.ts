import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    code: string;
}
