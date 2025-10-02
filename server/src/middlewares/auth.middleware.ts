// middlewares/auth.middleware.ts
import type { JwtPayload, Secret } from "jsonwebtoken";
import type { NextFunction, Response, Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { AppError } from "./error.middleware";
import { ACCESS_TOKEN_SECRET } from "../configs/env.configs";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

// (optional) remove global duplicate if you prefer one approach
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  // Prefer access token from cookie, fall back to Authorization header
  //console.log("Auth middleware hit");
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined);

  if (!token) {
    return next(new AppError("Unauthorized - No token provided", 401));
  }
  //console.log("Verifying token:", token);
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as Secret);
    req.user = decoded as JwtPayload;
    return next();
  } catch (err) {
    // optional: handle expired token separately
    if (err instanceof TokenExpiredError) {
      console.error("Access token expired:", err);
      return next(new AppError("Unauthorized - Token expired", 401));
    }
    console.error("Error verifying token:", err);
    return next(new AppError("Unauthorized - Invalid token", 401));
  }
};

export default authMiddleware;
