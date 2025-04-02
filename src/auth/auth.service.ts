import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SignInDto } from './dto/signIn.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Hash } from 'src/utils/hash.utils';
import { JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService
  ) { }


  public async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;
    const user = await this.userModel.findOne({ username });
    if (!user)
      throw new BadRequestException('Usuario no encontrado');

    if(!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordCorrect = await Hash.checkPassword(password, user.password);
    if (!isPasswordCorrect)
      throw new UnauthorizedException('Contraseña incorrecta');

    try {
      return this.generateJWT({id: user.id})
    } catch (error) {
      this.handleError(error);
    }
  }

  public user(user: UserDocument) {
    return {
      username: user.username,
      role: user.role
    }
  }

  private generateJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleError(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException('Error - Please check server logs');
  }
}
