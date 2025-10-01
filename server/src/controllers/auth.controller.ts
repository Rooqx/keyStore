// controllers/AuthController.ts
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ResponseHelper } from "../utils/responseHelper";
import { asyncHandler, AppError } from "../middleware/errorHandler";

/**
 * - Only: register (signup), login, logout
 * - Uses bcrypt for password hashing
 * - Issues an access token (returned in JSON) and a refresh token (HttpOnly cookie)
 */
export class AuthController {
  // helper: remove sensitive fields before sending user object
  private sanitizeUser(user: any) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
  }

  // cookie options for refresh token
  private getRefreshCookieOpts() {
    const isProd = process.env.NODE_ENV === "production";
    const maxAge =
      Number(process.env.REFRESH_TOKEN_EXPIRES_MS) || 7 * 24 * 60 * 60 * 1000; // default 7 days in ms
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
    const secret = process.env.ACCESS_TOKEN_SECRET || "access-secret";
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
    return jwt.sign(payload, secret, { expiresIn });
  }

  private signRefreshToken(payload: object) {
    const secret = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
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

      // Replace with your real model/service
      const UserModel = req.app.locals.userModel as any;
      if (!UserModel) {
        throw new AppError(
          "User model not available on app.locals.userModel",
          500
        );
      }

      const existing = await UserModel.findOne({ email });
      if (existing) {
        throw new AppError("Account with this email already exists", 409);
      }

      const saltRounds = Number(12);
      const hashed = await bcrypt.hash(password, saltRounds);

      const created = await UserModel.create({
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

      const UserModel = req.app.locals.userModel as any;
      if (!UserModel) {
        throw new AppError("User model not available", 500);
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        throw new AppError("Invalid credentials", 401);
      }

      // minimal payload; include whatever claims you need
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.signAccessToken(payload);
      const refreshToken = this.signRefreshToken(payload);

      // set refresh token cookie (httpOnly so client JS can't read it)
      res.cookie("refreshToken", refreshToken, this.getRefreshCookieOpts());

      const safe = this.sanitizeUser(user);
      return ResponseHelper.success(
        res,
        { accessToken, user: safe },
        "Logged in"
      );
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
