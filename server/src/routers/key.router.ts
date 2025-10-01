import { Router } from "express";
import { KeyController } from "../controllers/key.controller";

const keyRouter = Router();
const newKey = new KeyController();
keyRouter.post("/getresponse", newKey.addGetResponseKey);
keyRouter.post("/mailchimp", newKey.addMailchimpKey);
keyRouter.get("/", (_req, res) => {
  res.send("get all user Keys");
});
keyRouter.get("/getresponse", (_req, res) => {
  res.send("get all user Keys");
});
keyRouter.get("/mailchimp", (_req, res) => {
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
