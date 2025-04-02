import { CustomerDocument } from '../schemas/customer.schema';

export { Request } from 'express';

export interface ReqCustomer extends Request {
  customer: CustomerDocument
}
