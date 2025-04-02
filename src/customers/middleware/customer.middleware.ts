import { Request, Response, NextFunction} from 'express';
import { BadRequestException, Injectable, InternalServerErrorException, NestMiddleware, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { Customer, CustomerDocument } from '../schemas/customer.schema';

@Injectable()
export class CustomerMiddleware implements NestMiddleware {

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { idCustomer } = req.params;
    if(!isValidObjectId(idCustomer)) 
      throw new BadRequestException('ID no válido');

    const customer = await this.customerModel.findById(idCustomer);
    if(!customer) 
      throw new NotFoundException('Cliente no encontrado');

    try {
      req['customer'] = customer as CustomerDocument
      next();
    } catch (error) {
      throw new InternalServerErrorException('Hubo un error');
    }
  }
}
