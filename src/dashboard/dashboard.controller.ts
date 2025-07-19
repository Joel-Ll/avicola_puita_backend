import { Body, Controller, Get, Post } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SummaryEggRegistersDto } from './dto/summary-egg-registers';
import { SummaryFinancialDto } from './dto/summary-financial.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('dashboard')
@Auth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService
  ) {}
  
  @Get()
  getGeneralSummary() {
    return this.dashboardService.getGeneralSummary();
  }

  @Post('summary-egg-registers')
  getSummaryEggRegisters(
    @Body() summaryRegistersEggsDto: SummaryEggRegistersDto
  ) {
    return this.dashboardService.getSummaryEggRegisters(summaryRegistersEggsDto);
  }

  @Post('summary-financial')
  getSummaryFinancial(
    @Body() summaryFinancialDto: SummaryFinancialDto
  ) {
    return this.dashboardService.getSummaryFinancial(summaryFinancialDto);
  }
}
