import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'abdul@cloudpulse.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Abdul' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Rahim' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.MEMBER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}