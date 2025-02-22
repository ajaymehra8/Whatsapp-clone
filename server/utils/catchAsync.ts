import { Request,Response,NextFunction} from "express";
import { MyRequest } from "../types/local";

export default (fn:(req:MyRequest,res:Response,next:NextFunction)=>Promise<void>) =>{
    return (req:Request,res:Response,next:NextFunction)=>{
        fn(req,res,next).catch(err=>{
            next(err);
        });
    }
}