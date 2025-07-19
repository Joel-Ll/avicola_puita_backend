import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomerMiddleware } from './middleware/customer.middleware';
import { OrderMiddleware } from './middleware/order.middleware';

import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Item, ItemSchema } from './schemas/item.schema';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Egg, EggSchema } from 'src/sheds/schemas/egg.schema';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';
import { PrinterModule } from 'src/printer/printer.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Egg.name, schema: EggSchema },
      { name: Payment.name, schema: PaymentSchema }
    ]),
    PrinterModule
  ],
  controllers: [CustomersController, OrdersController, PaymentsController],
  providers: [CustomersService, OrdersService, PaymentsService],
})
export class CustomersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomerMiddleware)
      .forRoutes(
        { path: 'customers/:idCustomer', method: RequestMethod.ALL },
      )
    consumer
      .apply(OrderMiddleware)
      .forRoutes(
        { path: 'orders/:idOrder', method: RequestMethod.GET },
        { path: 'orders/:idOrder/finalized', method: RequestMethod.POST },
        { path: 'orders/:idOrder/delivery-date', method: RequestMethod.POST },
        { path: 'orders/:idOrder', method: RequestMethod.POST },
        { path: 'orders/:idOrder', method: RequestMethod.DELETE },
        { path: 'orders/:idOrder/items', method: RequestMethod.POST },
        { path: 'orders/:idOrder/items/:idItem', method: RequestMethod.DELETE },
      )
  }
}
