import { Router } from "express";
import { KeyController } from "../controllers/key.controller";
import { getMailchimpListId } from "../middlewares/getListId.middleware";

const keyRouter = Router();
const newKey = new KeyController();
keyRouter.post("/getresponse", newKey.addGetResponseKey);
keyRouter.post("/mailchimp", newKey.addMailchimpKey);
keyRouter.get(
  "/mailchimp/:id/lists",
  getMailchimpListId,
  newKey.getMailchimpAudiences
);
keyRouter.get("/getresponse/:id/lists", newKey.getResponseAudiences);
keyRouter.get("/", (_req, res) => {
  res.send("get all user Keys");
});
//Gett all the audiences from all the saved esp
keyRouter.get("/esp/lists", newKey.getAllAudiences);

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
