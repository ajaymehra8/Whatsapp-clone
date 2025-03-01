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

    let chats: IChat[] = await Chat.find({
      users: userId,
      deletedFor: { $nin: userId }, // Ensure userId is not inside deletedFor array
    })
      .populate([
        {
          path: "users",
        },
        { path: "topMessage", select: "content createdAt sender" },
      ]);
    if (!chats) {
      res.status(200).json({
        success: true,
        message: "No chat",
        chats: [],
      });
      return;
    }

    chats = chats.map((chat) => {
      if (chat.deletedFor?.some((entry) => entry === userId)) {
        return { ...chat.toObject(), topMessage: "" }; // Convert to plain object before modifying
      }
      return chat;
    });
    chats.sort((a, b) => {
      const aPinned = a.pinnedBy?.includes(userId) ?? false; // Ensuring a boolean value
      const bPinned = b.pinnedBy?.includes(userId) ?? false; // Ensuring a boolean value
    
      if (aPinned && !bPinned) return -1; // 'a' comes first if only 'a' is pinned
      if (!aPinned && bPinned) return 1;  // 'b' comes first if only 'b' is pinned
    
      return 0; // Maintain original order if both are pinned or both are not
    });
    chats = chats.map((chat) => {
      if (chat.pinnedBy?.includes(userId)) {
        return { ...chat.toObject(), isPinned:true }; // Convert to plain object before modifying
      }
      return chat;
    });
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
      image?: { name: string; link: string };
      messages: IMessage[];
      _id: mongoose.Types.ObjectId | undefined;
      userId?: mongoose.Types.ObjectId | undefined;
      lastSeen?: Date | string;
      count?: number;
    } = {
      name: "",
      messages: [],
      _id: undefined,
    };

    if (!chat) {
      const newChat: IUser | null = await User.findById(selectedUserId);
      chatToSend.name = newChat?.name;
      chatToSend.image = newChat?.image;
      chatToSend._id = newChat?._id;
      chatToSend.userId = newChat?._id;
      chatToSend.messages = [];
      chatToSend.lastSeen = newChat?.lastSeen || "";
      res.status(200).json({
        success: true,
        chat: chatToSend,
      });
      return;
    }

    if (!chat.isGroupedChat) {
      await Chat.findByIdAndUpdate(chat._id, { count: 0 });
      const users = chat.users as IUser[]; // Assert that users are populated
      const otherUser = users[0]._id.equals(userId) ? users[1] : users[0];
      chatToSend.name = otherUser.name;
      chatToSend.image = otherUser.image;
      // chat.name = otherUser?.name;
      chatToSend.userId = otherUser._id;
      chatToSend._id = chat._id;
      chatToSend.lastSeen = otherUser.lastSeen || "";
      chatToSend.count = 0;
    }
    const messages: IMessage[] = await Message.find({
      chat: chat?._id,
      deletedFor:{$nin:[userId]}
    });
    const isChatDeleted = await Chat.exists({
      _id: chat._id,
      "deletedFor.userId": userId,
    });
    if (!isChatDeleted) {
      chatToSend.messages = messages;
    } else {
      chatToSend.messages = [];
    }

    res.status(200).json({
      success: true,
      chat: chatToSend,
    });
  }
);

// Increase notification chat count
export const notifyUser = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const { chatId }: { chatId: string | undefined } = req.body;

    const id = new mongoose.Types.ObjectId(chatId);
    let chat: IChat | null = await Chat.findById(id);
    if (!chat) {
      res.json("");
      return;
    }

    const newCount = chat.count + 1;
    chat = await Chat.findByIdAndUpdate(
      id,
      { count: newCount },
      { new: true }
    ).populate([
      { path: "users", select: "name email image lastSeen" },
      { path: "topMessage" },
    ]);

    res.status(200).json({
      success: true,
      message: "Increase chat successfully",
    });
  }
);

// DELETE CHAT FOR USER
export const deleteChat = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "User is not authorized"));
      return;
    }
    let userId: string | mongoose.Types.ObjectId = req.user.id;
    let chatId: string | mongoose.Types.ObjectId = req.body.chatId;
    userId = new mongoose.Types.ObjectId(userId);
    chatId = new mongoose.Types.ObjectId(chatId);
    console.log(userId, chatId);

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { deletedFor:  userId },$pull:{pinnedBy:userId} },
      { new: true }
    );
    if (!updatedChat) {
      next(new AppError(400, "No chat found to delete"));
      return;
    }
    await Message.updateMany(
      {chat:updatedChat._id},
      { $push: { deletedFor:  userId  } },
      { new: true }
    );
    
    console.log(updatedChat);
    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  }
);

// PIN CHAT
export const pinChat=catchAsync(async(req:MyRequest,res:Response,next:NextFunction)=>{
  let userId=req.user?.id;
  let chatId=req.body?.chatId;
  if(!chatId){
    next(new AppError(400,"No chat provided."));
    return;
  }
  userId=new mongoose.Types.ObjectId(userId);
chatId=new mongoose.Types.ObjectId(chatId);
const chat:IChat|null=await Chat.findByIdAndUpdate(chatId,{$push:{pinnedBy:userId}},{new:true});
if(!chat){
next(new AppError(404,"No chat found"));
return;
}
res.status(200).json({
  success:true,
  message:"Chat pinned",
  chat
});
});

// UNPIN CHAT
export const unpinChat=catchAsync(async(req:MyRequest,res:Response,next:NextFunction)=>{
  let userId=req.user?.id;
  let chatId=req.body?.chatId;
  if(!chatId){
    next(new AppError(400,"No chat provided."));
    return;
  }
  userId=new mongoose.Types.ObjectId(userId);
chatId=new mongoose.Types.ObjectId(chatId);
const chat:IChat|null=await Chat.findByIdAndUpdate(chatId,{$pull:{pinnedBy:userId}},{new:true});
console.log(chat,"unpinned");
if(!chat){
next(new AppError(404,"No chat found"));
return;
}
res.status(200).json({
  success:true,
  message:"Chat unpinned",
  chat
});
})