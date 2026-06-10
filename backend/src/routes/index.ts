import { Router, type IRouter } from "express";
import healthRoutes from "./health.routes";

const router: IRouter = Router();

router.use("/health", healthRoutes);

export default router;
