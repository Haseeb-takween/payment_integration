import { Router, type IRouter } from "express";
import paddleRoutes from "./paddle.routes.js";

const router: IRouter = Router();

router.use("/paddle", paddleRoutes);

export default router;
