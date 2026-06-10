import express, { type Application } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { env } from "./config/env";

const app: Application = express();

app.use(cors({ origin: env.corsOrigins }));

// Paddle webhook signature verification needs the raw request body,
// so this route is parsed before the global json/urlencoded parsers.
app.use("/api/webhooks/paddle", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
