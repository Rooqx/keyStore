import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (_req, res) => {
  res.send("get all user ");
});
userRouter.get("/:id", (_req, res) => {
  res.send("get a user");
});
userRouter.put("/:id", (_req, res) => {
  res.send("update a key");
});
userRouter.delete("/:id", (_req, res) => {
  res.send("delete a key");
});

export default userRouter;
