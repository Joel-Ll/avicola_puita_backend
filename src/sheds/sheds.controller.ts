import { Controller, Get, Post, Body, Patch, Delete, Req, Param } from '@nestjs/common';

import { EggsRegisterService } from './services/eggs-register.service';
import { EggsService } from './services/eggs.service';
import { HealthManagementService } from './services/health-management.service';
import { LowsService } from './services/lows.service';
import { RecoveredService } from './services/recovered.service';
import { ShedsService } from './sheds.service';
import { SicksService } from './services/sicks.service';
import { VaccioneControlService } from './services/vaccione-control.service';

import { ChangeEventStateDto } from './dto/events/change-event-state.dto';
import { CreateEventDto } from './dto/events/create-event.dto';
import { CreateLowDto } from './dto/lows/create-low.dto';
import { CreateRecoveredDto } from './dto/recovered/create-recovered.dto';
import { CreateShedDto, UpdateShedDto } from './dto';
import { CreateSickDto } from './dto/sicks/create-sick.dto';
import { CreateVaccineControlDto } from './dto/vaccine-control/create-vaccine-control.dto';
import { GetRateDto } from './dto/sheds/get-rate.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { RegisterEggProductionDto } from './dto/egg-production/register-egg-production.dto';
import { RegisterWeightDto } from './dto/sheds/register-weight.dto';
import { ReportShedDto } from './dto/sheds/report-shed.dto';
import { RescheduleEventsDto } from './dto/events/reschedule-events.dto';
import { SelectShedDto } from './dto/sheds/select-shed.dto';
import { UpdateEggDto } from './dto/eggs/update-egg.dto';
import { UpdateEggProductionDto } from './dto/egg-production/update-egg-production.dto';
import { UpdateEventDto } from './dto/events/update-event.dto';
import { UpdateVaccineControlDto } from './dto/vaccine-control/update-vaccine-control.dto';

import { ReqShed } from './interfaces/req-shed.interface';

@Controller('sheds')
export class ShedsController {
  constructor(
    private readonly eggsRegisterService: EggsRegisterService,
    private readonly eggsService: EggsService,
    private readonly healthManagementService: HealthManagementService, 
    private readonly lowService: LowsService,
    private readonly recoveredService: RecoveredService,
    private readonly shedsService: ShedsService,
    private readonly sickService: SicksService,
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

  @Patch('vaccine-control/:vaccineControlId/event/:eventId')
  updateEvent(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string,
    @Param('eventId', ParseMongoIdPipe) eventId: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.vaccioneControlService.updateEvent(vaccineControlId, eventId, updateEventDto)
  }

  @Post('vaccine-control/:vaccineControlId/events/reschedule')
  reschedule(
    @Param('vaccineControlId', ParseMongoIdPipe) vaccineControlId: string,
    @Body() rescheduleEventsDto: RescheduleEventsDto
  ) {
    return this.vaccioneControlService.rescheduleEvents(vaccineControlId, rescheduleEventsDto)
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

  // Health Management
  @Post(':shedId/health-management')
  createHealthManagement(
    @Req() reqShed: ReqShed
  ) {
    return this.healthManagementService.createHealthManagement(reqShed.shed);
  }

  @Get('health-management/all')
  getAllHealthManagement() {
    return this.healthManagementService.getAllHealthManagement();
  }

  @Get('health-management/:trackingId/one')
  getOneHealthManagement(
    @Param('trackingId', ParseMongoIdPipe) trackingId: string,
  ) {
    return this.healthManagementService.getOneHealthManagement(trackingId);
  }

  @Post('health-management/:trackingId/rates')
  getRates(
    @Param('trackingId', ParseMongoIdPipe) trackingId: string,
    @Body() getRateDto: GetRateDto
  ) {
    return this.healthManagementService.getRates(trackingId, getRateDto)
  }

  @Post('health-management/:trackingId/growth')
  registerWeight(
    @Param('trackingId', ParseMongoIdPipe) trackingId: string,
    @Body() registerWeightDto: RegisterWeightDto
  ) {
    return this.healthManagementService.registerWeight(trackingId, registerWeightDto)
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
  getEggsProduction() {
    return this.eggsRegisterService.getEggsProduction();
  }

  @Get('eggs/production/eggs/:registerEggId')
  getEggProduction(
    @Param('registerEggId', ParseMongoIdPipe) registerEggId: string
  ) {
    return this.eggsRegisterService.getEggProduction(registerEggId)
  }

  @Patch('eggs/production/eggs/:registerEggId')
  updateEggProduction(
    @Param('registerEggId', ParseMongoIdPipe) registerEggId: string,
    @Body() updateEggProductionDto: UpdateEggProductionDto
  ) {
    return this.eggsRegisterService.updateEggProduction(registerEggId, updateEggProductionDto)
  }

  @Delete('eggs/production/eggs/:registerEggId')
  deleteEggProduction(
    @Param('registerEggId', ParseMongoIdPipe) registerEggId: string,
  ) {
    return this.eggsRegisterService.deleteEggProduction(registerEggId);
  }
}
