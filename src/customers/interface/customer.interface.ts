export { Request } from 'express';
import { CustomerDocument } from '../schemas/customer.schema';

export interface ReqCustomer extends Request {
  customer: CustomerDocument
}
