import { Router, type IRouter } from "express";
import {
  cancelSubscription,
  confirmSubscription,
  getSubscription,
} from "../controllers/subscription.controller.js";

const router: IRouter = Router();

router.get("/", getSubscription);
router.post("/confirm", confirmSubscription);
router.post("/cancel", cancelSubscription);

export default router;
