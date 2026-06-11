import { Router, type IRouter } from "express";
import {
  getPaddleWebhookStatus,
  handlePaddleWebhook,
} from "../../controllers/webhooks/paddle.controller.js";

const router: IRouter = Router();

router.get("/", getPaddleWebhookStatus);
router.post("/", handlePaddleWebhook);

export default router;
