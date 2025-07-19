import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([ { name: User.name, schema: UserSchema } ])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
