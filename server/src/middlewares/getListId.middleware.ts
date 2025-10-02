/**
 * This is to get the List_id and the Key
 * @returns req.key req.list_id
 */

import type { NextFunction, Request, Response } from "express";
import axios from "axios";
import { AppError } from "./error.middleware";
import Key from "../models/key.model";

//This to to extend the req so i can add req.list_id and req.key
declare global {
  namespace Express {
    interface Request {
      list_id?: string;
      key?: string;
    }
  }
}

export const getMailchimpListId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Get the key id from the endpoint
    const keyId = req.params.id;

    //Find key by id
    const key = await Key.findById(keyId);
    if (!key) {
      //Check if the key exist or not
      throw new AppError("Key not found", 404); //My custom error handler
    }
    // console.log("key:", key);
    const keyValue = key.key as string; //Stored the key value

    //To get the list_id
    const response = await axios.get(
      "https://us19.api.mailchimp.com/3.0/lists",
      {
        headers: {
          Authorization: `Bearer ${keyValue}`,
        },
      }
    );

    req.list_id = response.data.lists[0].id;
    req.key = keyValue;
    next(); // passing it to the next function
  } catch (error) {
    next(error);
  }
};
