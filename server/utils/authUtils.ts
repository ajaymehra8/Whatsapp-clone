import JWT, { JwtPayload as JWTDefaultPayload } from "jsonwebtoken";
import { NextFunction, Response } from "express";
import AppError from "./appError";
import { MyRequest } from "../types/local";
import { IUser } from "../model/userModel";
import mongoose from "mongoose";
// Define a custom JwtPayload interface extending the default one
export interface JwtPayload extends JWTDefaultPayload {
  id: mongoose.Types.ObjectId; // Add the 'id' field that you include in the token
  email:string;
  name:string;
}

export const createJWT = async (
  res: Response,
  user:IUser
): Promise<string | undefined> => {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not defined in the environment variables."
      );
    }

    // Generate the token
    const payload:JwtPayload={id:user._id,email:user.email,name:user.name};
    const token = JWT.sign(payload, secret, { expiresIn: "5d" });

    return token;
  } catch (error) {
    console.error("Error creating JWT:", error);

    // Send an error response to the client
    res.status(500).json({
      success: false,
      message: "Failed to create JWT",
    });

    // Return undefined since token creation failed
    return undefined;
  }
};

export const protectRoute = (
  req: MyRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError(401, "No token provided or invalid format"));
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    // Ensure the secret is available
    if (!secret) {
      return next(new AppError(500, "JWT secret is not configured"));
    }

    // Verify the token
    const decoded = JWT.verify(token, secret) as JwtPayload;

    // Attach user data to request
    req.user = decoded;
    next();
  } catch (err) {
    // Handle token errors
    if (err instanceof JWT.TokenExpiredError) {
      return next(new AppError(401, "Token has expired"));
    } else if (err instanceof JWT.JsonWebTokenError) {
      return next(new AppError(401, "Invalid token"));
    } else {
      return next(new AppError(500, "Internal Server Error"));
    }
  }
};
