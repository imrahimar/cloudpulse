import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'abdul@cloudpulse.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Abdul' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Rahim' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'StrongPass@123' })
  @IsString()
  @MinLength(8)
  password: string;
}