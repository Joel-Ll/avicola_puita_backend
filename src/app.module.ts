import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ShedsModule } from './sheds/sheds.module';
import { CommonModule } from './common/common.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AssetsModule } from './assets/assets.module';
import { PrinterModule } from './printer/printer.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ShedsModule,
    CommonModule,
    ExpensesModule,
    AssetsModule,
    PrinterModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    SalesModule,
    DashboardModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
