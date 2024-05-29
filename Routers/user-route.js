import { Router } from "express";

import * as control from '../Controllers/user-controller.js';

export const userRouter = Router();

userRouter.post('/register', control.register);
userRouter.post('/login', control.verifyUser, control.login);
userRouter.post('/resetPassword', control.verifyUser, control.resetPassword);
userRouter.get('/:id/container', control.getContainer);
userRouter.get('/getUser/:email', control.getUser);
userRouter.post('/addremoveproduct',control.addRemoveProduct);
userRouter.post('/submitreview', control.submitReview);
userRouter.post('/subscribe', control.subscribeNews);
userRouter.post('/clearCart', control.clearCart);