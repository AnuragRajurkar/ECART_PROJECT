import express from "express"
import authUser from "../middlewares/authUser.js";
import { getCart, updateCart } from "../controllers/cartController.js";


const cartRouter = express.Router();

cartRouter.post('/update', authUser, updateCart)
cartRouter.get('/get', authUser, getCart);


export default cartRouter;