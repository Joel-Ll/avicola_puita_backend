import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";
import { ExtractJwt, Strategy } from "passport-jwt";

import { User, UserDocument } from "src/users/schemas/user.schema";
import { JwtPayload } from "../interfaces/jwt.interface";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    const { id  } = payload;
    const user = await this.userModel.findById(id).select({ username: 1, isActive: 1, role: 1});
    if (!user)
      throw new UnauthorizedException('Acción no válida');

    if (!user.isActive)
      throw new UnauthorizedException('Usuario inactivo');

    return user;
  }
}