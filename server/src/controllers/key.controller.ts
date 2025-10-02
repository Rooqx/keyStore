import { AppError, asyncHandler } from "../middlewares/error.middleware";
import type { NextFunction, Request, Response } from "express";
import Key from "../models/key.model";
import { ResponseHelper } from "../utils/responseHelper";
import axios from "axios";
export class KeyController {
  public addMailchimpKey = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, key } = req.body;
      if (!key) throw new AppError("Key field empty", 400);
      try {
        const response = await axios.get(
          "https://us19.api.mailchimp.com/3.0/lists",
          {
            headers: {
              Authorization: `Bearer ${key}`,
            },
            validateStatus: () => true,
          }
        );
        console.log(response.statusText);
        if (response.status !== 200) {
          throw new AppError("The key you added is invalid", 400);
        }
        const newKey = await Key.create({
          name,
          key,
          provider: "mailchimp",
          // userId: req.user?._id,
        });

        return ResponseHelper.created(res, { key: newKey }, "Key added");
      } catch (err: any) {
        next(err);
      }
    }
  );
  public addGetResponseKey = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, key } = req.body;
      if (!key) throw new AppError("Key field empty", 400);
      try {
        const response = await axios.get(
          "https://api.getresponse.com/v3/contacts",
          {
            headers: {
              "X-Auth-Token": `api-key ${key}`,
            },
            validateStatus: () => true,
          }
        );
        console.log(response.statusText);
        if (response.status !== 200) {
          throw new AppError("The key you added is invalid", 400);
        }
        const newKey = await Key.create({
          name,
          key,
          provider: "getresponse",
          // userId: req.user?._id,
        });

        return ResponseHelper.created(res, { key: newKey }, "Key added");
      } catch (err: any) {
        next(err);
      }
    }
  );
  //get mailchimp audiences
  public getMailchimpAudiences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const list_id = req.list_id;
        const key = req.key;
        // console.log("list_id:", list_id);

        const response = await axios.get(
          `https://us19.api.mailchimp.com/3.0/lists/${list_id}/members`,
          {
            headers: {
              Authorization: `Bearer ${key}`,
            },
            validateStatus: () => true,
          }
        );
        //console.log(response.data);
        if (response.status !== 200) {
          throw new AppError("The key you added is invalid", 400);
        }
        const members = response.data.members.map((m: any) => ({
          id: m.id,
          email_address: m.email_address,
          unique_email_id: m.unique_email_id,
          full_name: m.full_name,
        }));
        // const audiences = response.data;
        return ResponseHelper.success(
          res,
          { audiences: members },
          "Audiences fetched"
        );
      } catch (err: any) {
        next(err);
      }
    }
  );
  //get mailchimp audiences
  public getResponseAudiences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const keyId = req.params.id;

        const key = await Key.findById(keyId);

        if (!key) {
          throw new AppError("Key not found", 404);
        }
        console.log("key:", key);
        const keyValue = key.key as string;
        const response = await axios.get(
          "https://api.getresponse.com/v3/contacts",
          {
            headers: {
              "X-Auth-Token": `api-key ${keyValue}`,
            },
            validateStatus: () => true,
          }
        );
        console.log(response.data);
        if (response.status !== 200) {
          throw new AppError("The key you added is invalid", 400);
        }

        // const audiences = response.data;
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
  public getAllAudiences = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const keys = await Key.find();
        if (!keys || keys.length === 0) {
          throw new AppError("No keys found", 404);
        }

        console.log(
          "Found keys:",
          keys.map((k) => ({ id: k._id, provider: k.provider }))
        );

        const results = await Promise.all(
          keys.map(async (keyDoc: any) => {
            const provider = String(keyDoc.provider || "").toLowerCase();
            const apiKey = String(keyDoc.key || "");

            if (!apiKey) {
              console.warn("Key missing for keyDoc:", keyDoc._id);
              return [];
            }

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

                    const members = membersRes.data.members || [];
                    console.log(
                      `list ${list.id} members count:`,
                      members.length
                    );
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

                return membersArrays.flat();
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
