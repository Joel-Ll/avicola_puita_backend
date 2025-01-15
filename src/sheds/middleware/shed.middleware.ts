import { Request, Response, NextFunction } from 'express';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  NotFoundException
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { Shed, ShedDocument } from '../schemas/shed.schema';

@Injectable()
export class ShedMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Shed.name)
    private readonly shedModel: Model<Shed>
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const { shedId } = req.params;
    if (!isValidObjectId(shedId))
      throw new BadRequestException('ID de galpón no válido');

    const shed = await this.shedModel.findById(shedId)
    if (!shed)
      throw new NotFoundException('Galpón no encontrado');

    try {
      req['shed'] = shed as ShedDocument
      next();
    } catch (error) {
      throw new InternalServerErrorException('Hubo un error');
    }
  }
}
