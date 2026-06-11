import { Router, type IRouter } from "express";
import healthRoutes from "./health.routes";
import subscriptionRoutes from "./subscription.routes.js";

const router: IRouter = Router();

router.use("/health", healthRoutes);
router.use("/subscription", subscriptionRoutes);

export default router;
