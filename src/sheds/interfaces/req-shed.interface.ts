import { Request } from 'express';
import { ShedDocument } from '../schemas/shed.schema';

export interface ReqShed extends Request {
  shed: ShedDocument
}