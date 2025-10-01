import { Router } from "express";

const keyRouter = Router();

keyRouter.post("/", (req, res) => {
  res.send("signup");
});
keyRouter.get("/", (_req, res) => {
  res.send("get all user Keys");
});
keyRouter.get("/:id", (_req, res) => {
  res.send("get all user Keys");
});
keyRouter.put("/:id", (_req, res) => {
  res.send("update a key");
});
keyRouter.delete("/:id", (_req, res) => {
  res.send("delete a key");
});

export default keyRouter;
