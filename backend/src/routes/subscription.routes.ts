import { Router, type IRouter } from "express";
import {
  cancelSubscription,
  getSubscription,
} from "../controllers/subscription.controller.js";

const router: IRouter = Router();

router.get("/", getSubscription);
router.post("/cancel", cancelSubscription);

export default router;
