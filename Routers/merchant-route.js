import { Router } from "express";
import * as control from './../Controllers/merchant-controller.js';

export const merchantRouter = Router();

merchantRouter.get('/:id/history', control.getHistory);
merchantRouter.get('/:id/storage', control.getStorage);
merchantRouter.post('/:id/addproduct', control.addProduct);
merchantRouter.post('/:id/editstock', control.editInStock);