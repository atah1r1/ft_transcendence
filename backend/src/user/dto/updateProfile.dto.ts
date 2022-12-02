import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class UpdateProfileDto {
    @IsNotEmpty()
    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    @ApiProperty()
    @MaxLength(50)
    @Transform(({ value }: TransformFnParams) => value?.trim())
    first_name: string;

    @IsNotEmpty()
    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    @ApiProperty()
    @MaxLength(50)
    @Transform(({ value }: TransformFnParams) => value?.trim())
    last_name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    @Length(4, 50)
    @Transform(({ value }: TransformFnParams) => value?.trim())
    username: string;
}