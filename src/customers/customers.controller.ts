import { Controller, Get, Post, Body, Patch, Delete, Request } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';
import { ReqCustomer } from './interface/customer.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('customers')
@Auth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  // CLIENTES (Customers)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':idCustomer')
  findOne(
    @Request() req: ReqCustomer
  ) {
    return this.customersService.findOne(req.customer);
  }

  @Patch(':idCustomer')
  update(
    @Request() req: ReqCustomer,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    return this.customersService.update(req.customer, updateCustomerDto);
  }

  @Delete(':idCustomer')
  remove(
    @Request() req: ReqCustomer
  ) {
    return this.customersService.remove(req.customer);
  }
}
