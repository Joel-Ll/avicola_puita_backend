import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ShedsModule } from './sheds/sheds.module';
import { CommonModule } from './common/common.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AssetsModule } from './assets/assets.module';
import { PrinterModule } from './printer/printer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ShedsModule,
    CommonModule,
    ExpensesModule,
    AssetsModule,
    PrinterModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
