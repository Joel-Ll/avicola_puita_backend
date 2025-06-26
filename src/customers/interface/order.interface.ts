import { OrderDocument } from '../schemas/order.schema';

export {Request} from 'express';

export interface ReqOrder extends Request {
  order: OrderDocument
}
