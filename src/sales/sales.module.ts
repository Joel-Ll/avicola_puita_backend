import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { SaleItem, SaleItemSchema } from './schemas/sale-item.schema';
import { SaleMiddleware } from './middleware/sale.middleware';
import { Egg, EggSchema } from 'src/sheds/schemas/egg.schema';
import { ProductSold, ProductSoldSchema } from './schemas/product-sold';
import { PrinterModule } from 'src/printer/printer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
      { name: ProductSold.name, schema: ProductSoldSchema },
      { name: Egg.name, schema: EggSchema }
    ]),
    PrinterModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SaleMiddleware)
      .forRoutes(
        { path: 'sales/:idSale', method: RequestMethod.ALL },
        { path: 'sales/:idSale/items', method: RequestMethod.POST },
        { path: 'sales/:idSale/guide', method: RequestMethod.POST },
        { path: 'sales/:idSale/confirm-sending', method: RequestMethod.POST },
        { path: 'sales/:idSale/finalize-sale', method: RequestMethod.POST },
        { path: 'sales/:idSale/sold-products', method: RequestMethod.POST },
        { path: 'sales/:idSale/return-products', method: RequestMethod.POST },
        { path: 'sales/:idSale/items/:idItem', method: RequestMethod.DELETE },
      )
  }
}
