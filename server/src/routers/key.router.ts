import { Router } from "express";
import { KeyController } from "../controllers/key.controller";
import { getMailchimpListId } from "../middlewares/getListId.middleware";
import authMiddleware from "../middlewares/auth.middleware";

//Key routes
const keyRouter = Router();
const newKey = new KeyController();

//Route to add getresponse api key
keyRouter.post(
  "/getresponse",
  authMiddleware, // To check if the user is authenticated before adding a key
  newKey.addGetResponseKey //Add controller
);

//Route to add mailchimp api key
keyRouter.post(
  "/mailchimp",
  authMiddleware, // To check if the user is authenticated before adding a key
  newKey.addMailchimpKey
);

//Route to get to get all the audiences of user mailchimp account
keyRouter.get(
  "/mailchimp/:id/lists",
  authMiddleware, // To check if the user is authenticated before adding a key
  getMailchimpListId, // Middleware to check the get the user list_id and also api from the db using id
  newKey.getMailchimpAudiences
);

//Route to get to get all the audiences of user getresponse account
keyRouter.get(
  "/getresponse/:id/lists",
  authMiddleware, // To check if the user is authenticated before adding a key
  newKey.getResponseAudiences
);
//GET all keys
keyRouter.get("/", authMiddleware, newKey.getAllKeys);

//Get all the audiences from all the saved esp; (Both mailchimp and getresponse)
keyRouter.get(
  "/esp/lists",
  authMiddleware, // To check if the user is authenticated before adding a key
  newKey.getAllAudiences
);

//Route to get all user keys
keyRouter.get(
  "/",
  authMiddleware, // To check if the user is authenticated before adding a key
  (_req, res) => {
    res.send("get all user Keys");
  }
);

export default keyRouter;
