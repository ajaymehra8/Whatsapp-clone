import { NextFunction, Response } from "express";
import { MyRequest } from "../types/local";
import catchAsync from "../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/appError";
import User, { IUser } from "../model/userModel";
import Chat, { IChat } from "../model/chatModel";
import mongoose from "mongoose";
import Message, { IMessage } from "../model/messageModel";

// CREATE CHAT
export const createChat = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const userId: JwtPayload | undefined = req.user;
    if (!userId) {
      next(new AppError(401, "User is not authorized"));
      return;
    }
    const { selectedUserId } = req.body;
    if (!selectedUserId) {
      next(new AppError(422, "Select a user"));
      return;
    }
    const selectedUser: IUser | null = await User.findById(selectedUserId);
    if (!selectedUser) {
      next(new AppError(422, "No user selected"));
      return;
    }
    const chat: IChat | null = await Chat.create({
      users: [selectedUserId, userId],
    });
    res.status(201).json({
      success: true,
      chat,
    });
  }
);

// GET CHATS
export const getAllChats = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req.user;
    if (!user) {
      next(new AppError(401, "User is not authorized"));
      return;
    }
    const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      user.id
    );
    const chats: IChat[] = await Chat.find({ users: userId })
      .populate([
        {
          path: "users",
        },
        { path: "topMessage", select: "content createdAt sender" },
      ])
      .sort({ updatedAt: -1 });
    if (!chats) {
      res.status(200).json({
        success: true,
        message: "No chat",
        chats: [],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      chats,
    });
  }
);

// GET SINGLE CHAT
export const getChat = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req?.user;
    const { selectedUserId } = req.params;

    // Convert both `selectedUserId` and `user?.id` to `mongoose.Types.ObjectId`
    const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      user?.id
    );

    const selectedUserObjectId: mongoose.Types.ObjectId =
      new mongoose.Types.ObjectId(selectedUserId);

    const chat: IChat | null = await Chat.findById(selectedUserObjectId)
      .populate([
        { path: "users", select: "name email image lastSeen" },
        { path: "topMessage" },
      ])
      .sort({ updatedAt: -1 });

    const chatToSend: {
      name: string | undefined;
      image?: string | undefined;
      messages: IMessage[];
      _id: mongoose.Types.ObjectId | undefined;
      userId?: mongoose.Types.ObjectId | undefined;
      lastSeen?:Date|string;
      count?:number;
    } = {
      name: "",
      image: "",
      messages: [],
      _id: undefined,

    };

    if (!chat) {
      const newChat: IUser | null = await User.findById(selectedUserId);
      chatToSend.name = newChat?.name;
      chatToSend.image = newChat?.image;
      chatToSend._id=newChat?._id;
      chatToSend.messages = [];
      chatToSend.lastSeen=newChat?.lastSeen||"";
      res.status(200).json({
        success: true,
        chat: chatToSend,
      });
      return;
    }

    if (!chat.isGroupedChat) {
      await Chat.findByIdAndUpdate(chat._id,{count:0});
      const users = chat.users as IUser[]; // Assert that users are populated
      const otherUser = users[0]._id.equals(userId) ? users[1] : users[0];
      chatToSend.name = otherUser.name;
      chatToSend.image = otherUser.image;
      // chat.name = otherUser?.name;
      chatToSend.userId = otherUser._id;
      chatToSend._id = chat._id;
      chatToSend.lastSeen=otherUser.lastSeen||"work";
      chatToSend.count=0;
    }
    const messages: IMessage[] = await Message.find({
      chat: chat?._id,
    }).populate({
      path: "sender",
    });
    chatToSend.messages = messages;

    res.status(200).json({
      success: true,
      chat: chatToSend,
    });
  }
);

// Increase notification chat count
export const notifyUser=catchAsync(async(req:MyRequest,res:Response,next:NextFunction)=>{
  const {chatId}:{chatId:string|undefined}=req.body;
  
  const id=new mongoose.Types.ObjectId(chatId);
 let chat:IChat|null= await Chat.findById(id);
if(!chat){
  next(new AppError(400,"Not found any chat"));
  return;
}

const newCount=chat.count+1;
chat=await Chat.findByIdAndUpdate(id,{count:newCount},{new:true})      
.populate([
  { path: "users", select: "name email image lastSeen" },
  { path: "topMessage" },
]);





  res.status(200).json({
    success:true,
    message:"Increase chat successfully",
    
  })
})
