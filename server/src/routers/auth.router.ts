import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const auth = new AuthController();

authRouter.post("/signup", auth.register);
authRouter.post("/signin", auth.login);
authRouter.post("/logout", auth.logout);

export default authRouter;
