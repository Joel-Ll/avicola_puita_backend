import { Response } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('assets')
@Auth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe ) id: string, 
    @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Get('report/assets')
  async getReportAsset(@Res() response: Response) {
    const pdfDoc = await this.assetsService.getReportAsset();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(response);
    pdfDoc.end() 
  } 
}
