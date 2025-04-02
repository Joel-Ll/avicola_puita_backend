import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomerMiddleware } from './middleware/customer.middleware';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ])
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomerMiddleware)
      .forRoutes(
        { path: 'customers/:idCustomer', method: RequestMethod.ALL }
      )
  }
}
