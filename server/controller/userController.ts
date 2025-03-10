import { NextFunction, Response } from "express";
import { MyRequest } from "../types/local";
import catchAsync from "../utils/catchAsync";
import mongoose, { FilterQuery, Types } from "mongoose";
import Chat, { IChat } from "../model/chatModel";
import User, { IUser } from "../model/userModel";
import AppError from "../utils/appError";

export const getUsers = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const { search } = req.query;
    let email;
    if (req.user) email = req.user.email;

    const query: FilterQuery<IUser> = {};
    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: `^${search}`, $options: "i" } }, // Case-insensitive match for name
            { email: { $regex: `^${search}`, $options: "i" } }, // Case-insensitive match for email
          ],
        },
        { email: { $ne: email } },
      ];
    }
    let users: IUser[] = await User.find(query);

    // Get the IDs of matched users
    const matchedUserIds: Types.ObjectId[] = users.map((user) => user._id);
    const userId: Types.ObjectId = new mongoose.Types.ObjectId(req?.user?.id);
    let oneToOneChats: IChat[] = [];
    if (search) {
      oneToOneChats = await Chat.find({
        isGroupedChat: false,
        $and: [
          { users: userId }, // Ensures the logged-in user is in the chat
          { users: { $in: matchedUserIds } }, // Ensures at least one matched user is in the chat
        ],
      })
        .populate([
          {
            path: "users",
            select: "name email image",
          },
          {
            path: "topMessage",
          },
        ])
        .sort({ updatedAt: -1 });
    }
    const oneToOneChatUserIds = oneToOneChats.flatMap((chat) =>
      chat.users.map((user) => user._id.toString())
    );

    // Filter out users who are already in one-to-one chats
    users = users.filter(
      (user) => !oneToOneChatUserIds.includes(user._id.toString())
    );
    oneToOneChats = oneToOneChats.map(chat => {
      
      if (chat.deletedFor?.some(entry => entry.toString() === userId.toString())) {
        console.log("working");
        return { ...chat.toObject(), topMessage: "" }; // Convert to plain object before modifying
      }
      return chat;
    });
    res.status(200).json({
      success: true,
      message: users ? "User fetched" : "No user or contact found.",
      oneToOneChats,
      users,
    });
  }
);



// GET USER
export const getUser=catchAsync(async(req:MyRequest,res:Response,next:NextFunction)=>{
  const {userId}=req.params as {userId:string|undefined};

  if(!userId){
    next(new AppError(400,"No user selected"));
    return;
  }
const id=new mongoose.Types.ObjectId(userId);
const user:IUser|null=await User.findById(id);
res.status(200).json({
  success:true,
  message:"User fetched successfully",
  user
})
});

// UPDATE PROFILE

type updateBody = {
  name?: string;
  about: {content?:string};
  image?: {
    name: string;
    link: string;
  };
};
type reqBody = {
  name?: string;
  about?: string;
  image?: {
    name: string;
    link: string;
  };
};

// UPDATE PROFILE OF USER

export const updateProfile = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const { name, about, image } = req.body as reqBody;
    let userId;
    if (req.user) {
      console.log(req.user);
      userId = req.user.id;
    }
    console.log(userId);

    userId = new mongoose.Types.ObjectId(userId);
    const field: updateBody = {about:{}};
    if (!name && !about && !image) {
      next(new AppError(400, "No value provided for updation"));
      return;
    }
    if (name) {
      field.name = name;
    }
    if (about) {
      
      field.about.content = about;
    }
    if (image) {
      field.image={
        name:image.name,
        link:image.link
      }
    }
    console.log(userId);
    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      userId,
      field,
      { new: true }
    );
    console.log(updatedUser);
    if (!updatedUser) {
      next(new AppError(400, "No user logged in"));
      return;
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  }
);

// change user privacy settings

export const changePrivacy=catchAsync(async(req:MyRequest,res:Response,next:NextFunction)=>{
  const {lastSeen,about,image}=req.body;
  console.log(lastSeen,about,image);
  console.log(req.user);
let userId=req.user?.id;
  if(!lastSeen && !about && !image){
    next(new AppError(400,"No changes"));
    return;
  }
  if(lastSeen){
    let value:boolean;
    console.log("working")
    if(lastSeen==="everyone"){
      value=true;
    }else{
      value=false
    }
    userId=new mongoose.Types.ObjectId(userId);
   const user:IUser|null= await User.findByIdAndUpdate(userId,{
    "lastSeen.visibility":value,
    },{new:true});
    if(!user){
      next(new AppError(404,"No user found"));
      return;
    }
    res.status(200).json({
      success:true,
      message:"LastSeen updated",
    user
    });
    return;
  }
  
  if(about){
    let value:boolean;
    if(about==="everyone"){
      value=true;
    }else{
      value=false
    }
   const user:IUser|null= await User.findByIdAndUpdate(userId,{
    "about.visibility":value,
    },{new:true});
    if(!user){
      next(new AppError(404,"No user found"));
      return;
    }
    res.status(200).json({
      success:true,
      message:"About visibility updated",
      user
    });
    return;
  }

  if(image){
    let value:boolean;
    if(image==="everyone"){
      value=true;
    }else{
      value=false
    }
   const user:IUser|null= await User.findByIdAndUpdate(userId,{
    "image.visibility":value,
    },{new:true});
    if(!user){
      next(new AppError(404,"No user found"));
      return;
    }
    res.status(200).json({
      success:true,
      message:"Image visibility updated",
      user
    });
    return;
  }
})