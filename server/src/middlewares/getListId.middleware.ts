import type { NextFunction, Request, Response } from "express";
import axios from "axios";
import { AppError } from "./error.middleware";
import Key from "../models/key.model";

declare global {
  namespace Express {
    interface Request {
      list_id?: string; // or whatever type the list ID is
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
    const keyId = req.params.id;

    const key = await Key.findById(keyId);

    if (!key) {
      throw new AppError("Key not found", 404);
    }
    console.log("key:", key);
    const keyValue = key.key as string;
    //console.log(keyValue);
    const response = await axios.get(
      "https://us19.api.mailchimp.com/3.0/lists",
      {
        headers: {
          Authorization: `Bearer ${keyValue}`,
        },
      }
    );
    //  console.log(response.data.lists[0].id);
    req.list_id = response.data.lists[0].id;
    req.key = keyValue;
    next();
  } catch (error) {
    next(error);
  }
};
