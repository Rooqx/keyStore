// middlewares/auth.middleware.ts
import type { JwtPayload, Secret } from "jsonwebtoken";
import type { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware";
import { ACCESS_TOKEN_SECRET } from "../configs/env.configs";

// Extend the Request type to include a user property
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string; // support string if you ever use jwt.sign with string payload
}

const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  // Extract token from httpOnly cookie named "session"
  const token = req.cookies?.session;

  if (!token) {
    return next(new AppError("Unauthorized - No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as Secret);

    // attach decoded payload to req.user for downstream controllers
    req.user = decoded as JwtPayload;

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return next(new AppError("Unauthorized - Invalid or expired token", 401));
  }
};

export default authMiddleware;
