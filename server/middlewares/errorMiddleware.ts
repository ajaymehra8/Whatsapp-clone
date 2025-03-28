import { NextFunction, Request, Response } from "express";
interface CustomError extends Error {
  code?: number; // Optional code property
  isOperational?: boolean;
}

export default (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let code: number;
  console.log(err);
  if (err.isOperational) {
    code = err.code || 500;
  } else {
    code = err.code||500;
  }
  res.status(code).json({
    success: false,
    message: err.message,
  });
  next();
};
