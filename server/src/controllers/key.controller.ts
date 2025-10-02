import { AppError, asyncHandler } from "../middlewares/error.middleware";
import type { NextFunction, Request, Response } from "express";
import Key from "../models/key.model";
import { ResponseHelper } from "../utils/responseHelper";
import axios from "axios";
/**
 * - addMailchimpKey
 * - addGetResponseKey
 * - getMailchimpAudiences
 * - getResponseAudiences
 * - getAllAudiences
 */
export class KeyController {
  //Get all keys
  //Get all keys from the database
  public getAllKeys = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const keys = await Key.find();
        if (!keys || keys.length === 0) {
          throw new AppError("No keys found", 404);
        }
        return ResponseHelper.success(res, { keys }, "All keys fetched");
      } catch (err: any) {
        next(err);
      }
    }
  );
  //Func to add mailchimpKey only
  public addMailchimpKey = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      //Getting name and key from request body
      const { name, key } = req.body;
      if (!key) throw new AppError("Key field empty", 400);

      //Get User id from the authMiddleware
      const userId = req.user?.sub; //sub is the standard claim for subject (user id)
      if (!userId) {
        throw new AppError("User Id missing", 404);
      }

      //Validate Key before saving
      try {
        //Make a test request to mailchimp to validate the key
        const response = await axios.get(
          "https://us19.api.mailchimp.com/3.0/lists",
          {
            headers: {
              Authorization: `Bearer ${key}`,
            },
            validateStatus: () => true,
          }
        );
        //console.log(response.statusText);
        if (response.status !== 200) {
          throw new AppError("The key you added is invalid", 400);
        }
        //Add key to the data base
        const newKey = await Key.create({
          name,
          key,
          provider: "mailchimp",
          userId: userId,
        });
        //Return response
        return ResponseHelper.created(res, { key: newKey }, "Key added");
      } catch (err: any) {
        next(err);
      }
    }
  );
  //Func to add getresponse key only
  public addGetResponseKey = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, key } = req.body; //Getting name and key from request body
      if (!key) throw new AppError("Key field empty", 400);

      //Get User id from the authMiddleware
      const userId = req.user?.sub; //sub is the standard claim for subject (user id)

      //console.log("userId:", userId);
      if (!userId) {
        throw new AppError("User Id missing", 404);
      }

      //Validate Key before saving
      try {
        //Make a test request to getresponse to validate the key
        //If the key is invalid it will return 401
        //If the key is valid it will return 200 with the contacts data
        //So we can use this to validate the key
        //So we don't have to worry about that case
        //Also we use validateStatus to prevent axios from throwing an error for non-200 status codes
        //So that we can handle it ourselves
        //This is important because getresponse returns 401 for invalid keys which would throw an error in axios
        //And we want to catch that and return our own error message
        //Instead of letting axios throw a generic error
        //This way we can provide a better user experience
        const response = await axios.get(
          "https://api.getresponse.com/v3/contacts",
          {
            headers: {
              "X-Auth-Token": `api-key ${key}`,
            },
            validateStatus: () => true, // prevent axios from auto throwing errors
          }
        );
        console.log(response.statusText);
        //Check the status to know if the key is valid
        if (response.status !== 200) {
          throw new AppError("The key you added is invalid", 400);
        }

        //Add key to the data base
        const newKey = await Key.create({
          name,
          key,
          provider: "getresponse",
          userId: userId,
        });

        return ResponseHelper.created(res, { key: newKey }, "Key added");
      } catch (err: any) {
        next(err);
      }
    }
  );

  //Get all mailchimp audiences "ONLY!"
  public getMailchimpAudiences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //Get list id and key from the prev middleware
        const list_id = req.list_id;
        const key = req.key;
        // console.log("list_id:", list_id);

        //Response to get all members in a list
        const response = await axios.get(
          `https://us19.api.mailchimp.com/3.0/lists/${list_id}/members`,
          {
            headers: {
              Authorization: `Bearer ${key}`,
            },
          }
        );

        //Sanitized the response data to just only (id, email, fullname)
        const members = response.data.members.map((m: any) => ({
          id: m.id,
          email_address: m.email_address,
          unique_email_id: m.unique_email_id,
          full_name: m.full_name,
        }));

        //Return response
        return ResponseHelper.success(
          res,
          { audiences: members },
          "Audiences fetched"
        );
      } catch (err: any) {
        next(err); //calls the err middleware
      }
    }
  );
  //Get all getresponse audiences "ONLY!"
  public getResponseAudiences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //get key id from the params so as to get the  get the key value from the db
        const keyId = req.params.id;
        const key = await Key.findById(keyId);

        //checking if key is present
        if (!key) {
          throw new AppError("Key not found", 404);
        }
        // console.log("key:", key);

        //extract the key value
        const keyValue = key.key as string;
        const response = await axios.get(
          "https://api.getresponse.com/v3/contacts",
          {
            headers: {
              "X-Auth-Token": `api-key ${keyValue}`,
            },
          }
        );

        //Sanitized the response data to just only (id, email, fullname)
        const contacts = response.data.map((c: any) => ({
          id: c.contactId,
          name: c.name,
          email: c.email,
        }));

        return ResponseHelper.success(
          res,
          { audiences: contacts },
          "Audiences fetched"
        );
      } catch (err: any) {
        next(err);
      }
    }
  );

  //This is to get all the audiences all together both mailchimp and getresponse
  public getAllAudiences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //Get all the key
        const keys = await Key.find();
        if (!keys || keys.length === 0) {
          //Validating
          throw new AppError("No keys found", 404);
        }

        /*
        console.log(
          "Found keys:",
          keys.map((k) => ({ id: k._id, provider: k.provider }))
        );*/

        //Fetch audiences from all keys in parallel
        const results = await Promise.all(
          keys.map(async (keyDoc: any) => {
            const provider = String(keyDoc.provider || "").toLowerCase(); // normalize
            const apiKey = String(keyDoc.key || ""); // ensure it's a string

            //Basic validation
            if (!apiKey) {
              console.warn("Key missing for keyDoc:", keyDoc._id);
              return [];
            }

            //Check which provider it is to know the url to use
            if (provider === "mailchimp") {
              try {
                const base = "https://us19.api.mailchimp.com/3.0"; // keep as you use
                const listsRes = await axios.get(`${base}/lists`, {
                  headers: { Authorization: `Bearer ${apiKey}` },
                  validateStatus: () => true,
                });

                console.log(
                  `mailchimp lists status for ${keyDoc._id}:`,
                  listsRes.status
                );
                if (listsRes.status !== 200) {
                  console.error(
                    "Mailchimp lists error:",
                    listsRes.status,
                    listsRes.data
                  );
                  return [];
                }

                const lists = listsRes.data.lists || [];
                if (lists.length === 0) {
                  console.warn("No Mailchimp lists for key:", keyDoc._id);
                  return [];
                }

                // fetch members for every list in parallel (increase count param to get more)
                const membersArrays = await Promise.all(
                  lists.map(async (list: any) => {
                    const membersRes = await axios.get(
                      `${base}/lists/${list.id}/members?count=1000`,
                      {
                        headers: { Authorization: `Bearer ${apiKey}` },
                        validateStatus: () => true,
                      }
                    );

                    console.log(
                      `members fetch for list ${list.id} status:`,
                      membersRes.status
                    );
                    if (membersRes.status !== 200) {
                      console.error(
                        `Failed members fetch for list ${list.id}:`,
                        membersRes.status,
                        membersRes.data
                      );
                      return [];
                    }
                    //Extract only the fields we need
                    const members = membersRes.data.members || [];
                    console.log(
                      `list ${list.id} members count:`,
                      members.length
                    );
                    //Map the members to a simplified format
                    return members.map((m: any) => ({
                      provider: "mailchimp",
                      providerListId: list.id,
                      id: m.id,
                      email: m.email_address,
                      name: m.full_name,
                      status: m.status,
                    }));
                  })
                );

                return membersArrays.flat(); // flatten the array of arrays
              } catch (err: any) {
                console.error(
                  "Mailchimp error for key",
                  keyDoc._id,
                  err.message || err
                );
                return [];
              }
            }

            if (provider === "getresponse") {
              try {
                const resp = await axios.get(
                  "https://api.getresponse.com/v3/contacts",
                  {
                    headers: { "X-Auth-Token": `api-key ${apiKey}` },
                    validateStatus: () => true,
                  }
                );

                console.log(
                  `getresponse status for ${keyDoc._id}:`,
                  resp.status
                );
                if (resp.status !== 200) {
                  console.error("GetResponse error:", resp.status, resp.data);
                  return [];
                }

                console.log(
                  `getresponse contacts count:`,
                  (resp.data || []).length
                );
                return (resp.data || []).map((c: any) => ({
                  provider: "getresponse",
                  id: c.contactId,
                  email: c.email,
                  name: c.name,
                  campaignId: c.campaign?.campaignId,
                }));
              } catch (err: any) {
                console.error(
                  "GetResponse error for key",
                  keyDoc._id,
                  err.message || err
                );
                return [];
              }
            }

            //  console.warn(
            //  "Unsupported provider for key:",
            //  keyDoc._id,
            //  keyDoc.provider
            //);
            return [];
          })
        );

        const allAudiences = results.flat();
        //console.log("Total audiences fetched:", allAudiences.length);

        return ResponseHelper.success(
          res,
          { audiences: allAudiences },
          "All ESP audiences fetched"
        );
      } catch (err: any) {
        next(err);
      }
    }
  );
}
