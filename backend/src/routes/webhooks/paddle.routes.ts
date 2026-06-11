import { Router, type IRouter } from "express";
import { handlePaddleWebhook } from "../../controllers/webhooks/paddle.controller.js";

const router: IRouter = Router();

router.post("/", handlePaddleWebhook);

export default router;
