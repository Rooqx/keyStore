import type { Request, Response, NextFunction } from "express";
import aj from "../configs/arcjet.config";
/*
    Arcjet middleware to protect routes
*/
const arcjetMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //
    const decision = await aj.protect(req as any, { requested: 2 });
    // console.log("Arcjet Decision:", decision); // Debugging

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: `Rate limit exceeded` });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({ error: `Bot Detected` });
      }
      return res.status(403).json({ error: `Access denied` });
    }
    next();
  } catch (err) {
    console.error(`Arcjet Middleware Error: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default arcjetMiddleware;
