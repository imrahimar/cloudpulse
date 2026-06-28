import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));