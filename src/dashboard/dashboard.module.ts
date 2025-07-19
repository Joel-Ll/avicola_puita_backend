import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/customers/schemas/customer.schema';
import { Order, OrderSchema } from 'src/customers/schemas/order.schema';
import { Payment, PaymentSchema } from 'src/customers/schemas/payment.schema';
import { Expense, ExpenseSchema } from 'src/expenses/schemas/expense.schema';
import { ProductSold, ProductSoldSchema } from 'src/sales/schemas/product-sold';
import { Sale, SaleSchema } from 'src/sales/schemas/sale.schema';
import { EggRegister, EggRegisterSchema } from 'src/sheds/schemas/egg-register.schema';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ProductSold.name, schema: ProductSoldSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: EggRegister.name, schema: EggRegisterSchema }
    ])
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule { }
