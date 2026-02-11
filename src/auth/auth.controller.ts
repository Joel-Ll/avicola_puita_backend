import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { UserDocument } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('login')
  signIn(
    @Body() signInDto: SignInDto
  ) {
    return this.authService.signIn(signInDto)
  }

  @Auth()
  @Get('user')
  getUser(
    @GetUser() user: UserDocument
  ) {
    return this.authService.user(user)
  }
}
