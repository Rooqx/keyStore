import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const auth = new AuthController();

//Signup Route
authRouter.post("/signup", auth.register);

//Signin Route
authRouter.post("/signin", auth.login);

//Logout Route
authRouter.post("/logout", auth.logout);

export default authRouter;
