import type { Request, Response, NextFunction } from 'express';
import { BadRequestException, Injectable, InternalServerErrorException, NestMiddleware, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class OrderMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const { idOrder } = req.params;
    if(!isValidObjectId(idOrder))
      throw new BadRequestException('ID no válido');

    const order = await this.orderModel.findById(idOrder);
    if(!order)
      throw new NotFoundException('Orden no encontrada');

    try {
      req['order'] = order as OrderDocument
      next();
    } catch (error) {
      throw new InternalServerErrorException('Hubo un error');
    }
  }
}
