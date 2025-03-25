import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { PrinterModule } from 'src/printer/printer.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Asset.name, schema: AssetSchema }
  ]), PrinterModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule { }
