import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import { ENV, PORT } from "./configs/env.configs";
import { connectToMongo } from "./db/mongo";
import Job from "./services/job.service";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import keyRouter from "./routers/key.router";
const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Hello from Server (Express + TS) 👋");
});

//API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/keys", keyRouter);

Job.getRemoteOkJobs();
app.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  await connectToMongo();
  console.log(`Environment:${ENV}`);
});
