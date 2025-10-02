// controllers/AuthController.ts
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { ResponseHelper } from "../utils/responseHelper";
import { asyncHandler, AppError } from "../middlewares/error.middleware";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_MS,
  REFRESH_TOKEN_SECRET,
} from "../configs/env.configs";
import User from "../models/user.model";

/**
 * - Only: register (signup), login, logout
 * - Uses bcrypt for password hashing
 * - Issues an access token (returned in JSON) and a refresh token (HttpOnly co run devokie)
 */
export class AuthController {
  // helper: remove sensitive fields before sending user object
  private sanitizeUser(user: any) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
  }

  // cookie options for access token (short-lived)
  private getAccessCookieOpts() {
    const isProd = process.env.NODE_ENV === "production";
    return {
      httpOnly: true, // JS on frontend cannot access it
      secure: isProd, // only send over HTTPS in production
      sameSite: "lax" as "lax" | "strict" | "none",
      path: "/",
      maxAge: 1000 * 60 * 15, // 15 minutes
    };
  }
  // cookie options for refresh token
  private getRefreshCookieOpts() {
    const isProd = process.env.NODE_ENV === "production";
    const maxAge = Number(REFRESH_TOKEN_EXPIRES_MS); // default 7 days in ms
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as "lax" | "strict" | "none",
      path: "/",
      maxAge,
    };
  }

  // helper: sign JWTs (self-contained so this works in an assessment)
  private signAccessToken(payload: object) {
    const secret = ACCESS_TOKEN_SECRET as Secret;
    const expiresIn = ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];
    return jwt.sign(payload, secret, { expiresIn });
  }

  private signRefreshToken(payload: object) {
    const secret = REFRESH_TOKEN_SECRET as Secret;
    const expiresIn = REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Register (signup)
   * - expects: { email, password, name? }
   * - hashes password and creates user
   * - returns created user (without password)
   */
  public register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, name } = req.body;
      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const existing = await User.findOne({ email });
      if (existing) {
        throw new AppError("Account with this email already exists", 409);
      }

      const saltRounds = Number(12);
      const hashed = await bcrypt.hash(password, saltRounds);

      const created = await User.create({
        email,
        name,
        password: hashed,
      });

      const safe = this.sanitizeUser(created);
      return ResponseHelper.created(res, { user: safe }, "Account created");
    }
  );

  /**
   * Login
   * - expects: { email, password }
   * - verifies credentials, returns access token and sets refresh token cookie
   */
  public login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }
      // console.log("User found:", user);

      // compare password with hashed password
      //  console.log("Comparing passwords");
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        throw new AppError("Invalid credentials", 401);
      }

      // minimal payload; include whatever claims you need
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.signAccessToken(payload);
      const refreshToken = this.signRefreshToken(payload);

      // set access token cookie (short-lived)
      res.cookie("accessToken", accessToken, this.getAccessCookieOpts());

      // set refresh token cookie (httpOnly so client JS can't read it)
      res.cookie("refreshToken", refreshToken, this.getRefreshCookieOpts());

      const safe = this.sanitizeUser(user);
      return ResponseHelper.success(res, { user: safe }, "Logged in");
    }
  );

  /**
   * Logout
   * - tries to revoke refresh token (if tokenService exists)
   * - clears refresh token cookie
   */
  public logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // read refresh token from cookie (most likely) or body/header fallback
      const rt =
        req.cookies?.refreshToken ||
        req.body?.refreshToken ||
        req.get("x-refresh-token");

      // clear cookie on client
      res.clearCookie("refreshToken", this.getRefreshCookieOpts());

      return ResponseHelper.success(res, null, "Logged out");
    }
  );
}

// default export: instance to import easily in route files
export default new AuthController();
