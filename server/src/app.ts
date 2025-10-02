import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import { ENV, PORT } from "./configs/env.configs";
import { connectToMongo } from "./db/mongo";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import keyRouter from "./routers/key.router";
import { KeyController } from "./controllers/key.controller";
import { getMailchimpListId } from "./middlewares/getListId.middleware";
import { ar } from "zod/locales";
import arcjetMiddleware from "./middlewares/arcjet.middleware";
const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // to parse cookies from requests
app.use(cors());
app.use(errorHandler);
app.use(arcjetMiddleware); // Apply Arcjet middleware globally
app.get("/", (_req, res) => {
  console.log("server hit");
  res.send("Hello from Server (Express + TS) 👋");
});
const test = new KeyController();
//test.getMailchimpAudiences();
//API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/integrations", keyRouter);

app.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  await connectToMongo();
  console.log(`Environment:${ENV}`);
});
