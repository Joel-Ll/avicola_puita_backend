import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name)

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>,
  ) { }

  public async create(createCustomerDto: CreateCustomerDto) {
    const { phone } = createCustomerDto
    const customerExists = await this.customerModel.findOne({ phone });
    if (customerExists)
      throw new BadRequestException(`El cliente con el #${phone} ya esta registrado`);

    try {
      const customer = new this.customerModel(createCustomerDto);
      await customer.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findAll() {
    const customers = await this.customerModel.find({})
      .sort({ createdAt: -1 });
    return customers;
  }

  public async findOne(customer: CustomerDocument) {
    return customer;
  }

  public async update(customer: CustomerDocument, updateCustomerDto: UpdateCustomerDto) {
    const { phone } = updateCustomerDto;
    if (phone && phone !== customer.phone) {
      const existingCustomer = await this.customerModel.findOne({ phone, _id: { $ne: customer.id } });
      if (existingCustomer)
        throw new BadRequestException('El número de teléfono ya está en uso');
    }
    await customer.updateOne(updateCustomerDto);
    return 'Actualizado correctamente';
  }

  public async remove(customer: CustomerDocument) {
    if (customer.orders.length > 0)
      throw new BadRequestException('Acción no válida. El cliente tiene asociado algunos pedidos');

    await customer.deleteOne();
    return 'Eliminado correctamente';
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
