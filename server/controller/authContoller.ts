import User, { IUser } from "../model/userModel";
import catchAsync from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { createJWT } from "../utils/authUtils";

interface SignupBody {
  name: string;
  email: string;
  password: string;
}
interface LoginBody {
  email: string;
  password: string;
}

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as SignupBody;
    if (!name || !email || !password) {
      next(new AppError(422, "Please provide all required fields"));
      return;
    }
    const existingUser: IUser | undefined | null = await User.findOne({
      email,
    });
    if (existingUser) {
      next(new AppError(409, "User with this email already exists"));
      return;
    }

    const newUser: IUser = await User.create({ name, email, password });
    const jwt:string|undefined=await createJWT(res,newUser);
    if(!jwt){
      next(new AppError(500, "Problem in creation of jwt"));
      return;
    }
    res.status(201).json({
      success: true,
      message: "User created successfully",
      jwt,
      user: newUser,
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginBody;
    if (!email || !password) {
      next(new AppError(422, "Provide all required fields"));
      return;
    }
    const user: IUser | null = await User.findOne({ email }).select("+password");
    if (!user) {
      next(new AppError(422, "No user with this email"));
      return;
    }
    const validate = await user.comparePassword(password);
    if (!validate) {
      next(new AppError(401, "Password is incorrect"));
      return;
    }
    const jwt: string | undefined = await createJWT(res, user);
    if (!jwt) {
      next(new AppError(500, "Problem in creation of jwt"));
      return;
    }
    user.password=undefined;
    console.log(user);
    res.status(200).json({
      success: true,
      jwt,
      user,
    });
  }
);


