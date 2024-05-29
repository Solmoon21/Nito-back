import { Router } from "express";
import * as control from './../Controllers/product-controller.js';

export const productRouter = Router();

productRouter.get('/', control.listProducts);
productRouter.post('/recommendations', control.getRecommededProducts);
productRouter.post('/:id', control.getProduct);
productRouter.get('/reviews/:id', control.getReviews);