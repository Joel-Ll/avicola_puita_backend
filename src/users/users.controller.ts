import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserDocument } from './schemas/user.schema';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@Auth(ValidRoles.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId', ParseMongoIdPipe) userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  updateState(@Param('id', ParseMongoIdPipe) id: string ) {
    return this.usersService.updateState(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.usersService.remove(id);
  }

  // ADMIN
  @Patch('admin/username')
  updateAdminUsername(
    @GetUser() admin: UserDocument,
    @Body() updateUsernameDto :UpdateUsernameDto 
  ) {
    return this.usersService.updateAdminUsername(admin, updateUsernameDto);
  }

  @Patch('admin/password')
  updateAdminPassword(
    @GetUser() user: UserDocument,
    @Body() updatePasswordDto :UpdatePasswordDto 
  ) {
    return this.usersService.updateAdminPassword(user, updatePasswordDto);
  }
}
