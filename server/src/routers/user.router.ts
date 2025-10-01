import { Router } from "express";

const userRouter = Router();

userRouter.post("/", (req, res) => {
  res.send("signup");
});
userRouter.get("/", (_req, res) => {
  res.send("get all user Keys");
});
userRouter.get("/:id", (_req, res) => {
  res.send("get all user Keys");
});
userRouter.put("/:id", (_req, res) => {
  res.send("update a key");
});
userRouter.delete("/:id", (_req, res) => {
  res.send("delete a key");
});

export default userRouter;
