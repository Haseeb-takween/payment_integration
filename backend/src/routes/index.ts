import { Router, type IRouter } from "express";
import healthRoutes from "./health.routes";
import subscriptionRoutes from "./subscription.routes.js";
import webhookRoutes from "./webhooks/index.js";

const router: IRouter = Router();

router.use("/health", healthRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
