import type {Request, Response, NextFunction} from 'express';
import { BadRequestException, Injectable, InternalServerErrorException, NestMiddleware, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Sale, SaleDocument } from '../schemas/sale.schema';

@Injectable()
export class SaleMiddleware implements NestMiddleware {

  constructor(
    @InjectModel(Sale.name)
    private readonly saleModel: Model<Sale>
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const {idSale} = req.params;

    if(!isValidObjectId(idSale))
      throw new BadRequestException('ID no válido');

    const sale = await this.saleModel.findById(idSale);
    
    if(!sale)
      throw new NotFoundException('Venta no encontrada');

    try {
      req['sale'] = sale as SaleDocument
      next();
    } catch (error) {
      throw new InternalServerErrorException('Hubo un error'); 
    }
  }
}
