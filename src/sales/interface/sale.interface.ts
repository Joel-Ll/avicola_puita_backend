export { Request } from 'express';
import { SaleDocument } from '../schemas/sale.schema';

export interface ReqSale extends Request {
  sale: SaleDocument
}
