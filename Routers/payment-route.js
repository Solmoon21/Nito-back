import { Router } from "express";
import * as control from '../Controllers/payment-controller.js';

export const paymentRouter = Router();

paymentRouter.post('/fiat', control.payByFiat);
paymentRouter.post('/crypto', control.payByCrypto);