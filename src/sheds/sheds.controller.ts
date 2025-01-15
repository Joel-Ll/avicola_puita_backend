import { Controller, Get, Post, Body, Patch, Delete, Req, Param } from '@nestjs/common';
import { ShedsService } from './sheds.service';
import { LowsService } from './services/lows.service';
import { RecoveredService } from './services/recovered.service';
import { SicksService } from './services/sicks.service';

import { CreateShedDto, UpdateShedDto } from './dto';
import { CreateRecoveredDto } from './dto/recovered/create-recovered.dto';
import { CreateSickDto } from './dto/sicks/create-sick.dto';
import { CreateLowDto } from './dto/lows/create-low.dto';
import { ReportShedDto } from './dto/sheds/report-shed.dto';
import { SelectShedDto } from './dto/sheds/select-shed.dto';
import { ReqShed } from './interfaces/req-shed.interface';
import { EggsService } from './services/eggs.service';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { UpdateEggDto } from './dto/eggs/update-egg.dto';
import { RegisterEggProductionDto } from './dto/egg-production/register-egg-production.dto';
import { EggsRegisterService } from './services/eggs-register.service';
import { VaccioneControlService } from './services/vaccione-control.service';
import { CreateVaccineControlDto } from './dto/vaccine-control/create-vaccine-control.dto';
import { CreateEventDto } from './dto/events/create-event.dto';
import { ChangeEventStateDto } from './dto/events/change-event-state.dto';
import { UpdateEventDto } from './dto/events/update-event.dto';
import { UpdateVaccineControlDto } from './dto/vaccine-control/update-vaccine-control.dto';

@Controller('sheds')
export class ShedsController {
  constructor(
    private readonly shedsService: ShedsService,
    private readonly recoveredService: RecoveredService,
    private readonly lowService: LowsService,
    private readonly sickService: SicksService,
    private readonly eggsService: EggsService,
    private readonly eggsRegisterService: EggsRegisterService,
    private readonly vaccioneControlService: VaccioneControlService,
  ) { }

  @Post()
  create(@Body() createShedDto: CreateShedDto) {
    return this.shedsService.create(createShedDto);
  }

  @Get()
  findAll() {
    return this.shedsService.findAll();
  }

  @Get(':shedId')
  findOne(
    @Req() reqShed: ReqShed
  ) {
    return this.shedsService.findOne(reqShed.shed);
  }

  @Patch(':shedId')
  update(
    @Req() reqShed: ReqShed,
    @Body() updateShedDto: UpdateShedDto
  ) {
    return this.shedsService.update(reqShed.shed, updateShedDto);
  }

  @Patch(':shedId/reset')
  reset(
    @Req() reqShed: ReqShed
  ) {
    return this.shedsService.resetShed(reqShed.shed);
  }

  @Delete()
  remove(@Body() ids: string[]) {
    return this.shedsService.removeMany(ids);
  }

  @Post('reports/sheds')
  getReport(@Body() reportShedDto: ReportShedDto) {
    return this.shedsService.getReport(reportShedDto);
  }

  @Post('select/report')
  getSelect(@Body() selectShedDto: SelectShedDto) {
    return this.shedsService.getSelect(selectShedDto);
  }

  // Lows
  @Post(':shedId/lows')
  registerLow(
    @Req() reqShed: ReqShed,
    @Body() createLowDto: CreateLowDto
  ) {
    return this.lowService.registerLow(reqShed.shed, createLowDto);
  }

  // Sicks
  @Post(':shedId/sicks')
  registerSick(
    @Req() reqShed: ReqShed,
    @Body() createSickDto: CreateSickDto
  ) {
    return this.sickService.registerSick(reqShed.shed, createSickDto);
  }

  // Recovereds
  @Post(':shedId/recovered')
  registerRecovered(
    @Req() reqShed: ReqShed,
    @Body() createRecoveredDto: CreateRecoveredDto
  ) {
    return this.recoveredService.registerRecovered(reqShed.shed, createRecoveredDto);
  }
  
  // Last Five Reports 
  @Get('summary/register')
  summaryLatest() {
    return this.shedsService.summaryRegister()
  }

  @Delete('summary/:shedId/:registerId/restore')
  deleteRegister(
    @Req() reqShed: ReqShed,
    @Param('registerId', ParseMongoIdPipe) registerId: string,
  ) {
    return this.shedsService.deleteRegister(registerId, reqShed.shed);
  }

  // Plan de Vacunas (vaccineControl)
  @Post(':shedId/vaccine-control')
  createVaccineControl(
    @Req() reqShe: ReqShed,
    @Body() createVaccioneControlDto: CreateVaccineControlDto
  ) {
    return this.vaccioneControlService.createVaccineControl(reqShe.shed, createVaccioneControlDto);
  }

  @Patch('vaccine-control/:vaccineControlId')
  updateVaccineControl(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string,
    @Body() updateVaccineControlDto: UpdateVaccineControlDto
  ) {
    return this.vaccioneControlService.updateVaccineControl(vaccineControlId, updateVaccineControlDto);
  }

  @Get('vaccine-control/:vaccineControlId/one')
  getVaccineControl(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string
  ) {
    return this.vaccioneControlService.getVaccineControl(vaccineControlId);
  }

  @Get('vaccine-control/all')
  getAllVaccineControl() {
    return this.vaccioneControlService.getAllVaccineControl();
  }

  @Delete('vaccine-control/:vaccineControlId') 
  removeVaccineControl(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string,
  ) {
    return this.vaccioneControlService.removeVaccineControl(vaccineControlId);
  }

  // VaccineControl Events
  @Post('vaccine-control/:vaccineControlId/event')
  createEvent(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string,
    @Body() createEventDto: CreateEventDto
  ) {
    return this.vaccioneControlService.addEvent(vaccineControlId, createEventDto);
  }

  @Patch('vaccine-control/event/:eventId') 
  updateEvent(
    @Param('eventId', ParseMongoIdPipe) eventId: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.vaccioneControlService.updateEvent(eventId, updateEventDto)
  }

  @Post('vaccine-control/event/:eventId')
  changeEventState(
    @Param('eventId', ParseMongoIdPipe) eventId: string,
    @Body() changeEventStateDto: ChangeEventStateDto,
  ) {
    return this.vaccioneControlService.changeEventState(eventId, changeEventStateDto);
  }

  @Get('vaccine-control/events/:eventId/one')
  getEvent(
    @Param('eventId', ParseMongoIdPipe) eventId: string
  ) {
    return this.vaccioneControlService.getOneEvent(eventId);
  }

  @Delete('vaccine-control/:vaccineControlId/event/:eventId')
  deleteEvent(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string,
    @Param('eventId', ParseMongoIdPipe) eventId: string,
  ) {
    return this.vaccioneControlService.deleteEvent(vaccineControlId, eventId);
  }

  // Eggs
  @Get('eggs/register')
  getEggs() {
    return this.eggsService.getEggs()
  }

  @Get('eggs/:eggId')
  getOne(@Param('eggId', ParseMongoIdPipe) eggId: string) {
    return this.eggsService.getOneEgg(eggId);
  }

  @Patch('eggs/edit/:eggId')
  editEgg(
    @Param('eggId', ParseMongoIdPipe) eggId: string,
    @Body() updateEggDto: UpdateEggDto
  ) {
    return this.eggsService.editEgg(eggId, updateEggDto);
  }

  // Egg-Register
  @Post('eggs/production')
  registerEgg(@Body() registerEggProductionDto: RegisterEggProductionDto) {
    return this.eggsRegisterService.registerEgg(registerEggProductionDto);
  }

  @Get('eggs/production/eggs')
  getEggProduction() {
    return this.eggsRegisterService.getEggProduction();
  }
}
