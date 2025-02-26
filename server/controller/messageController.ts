import { NextFunction, Response } from "express";
import { MyRequest } from "../types/local";
import AppError from "../utils/appError";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import Message, { IMessage } from "../model/messageModel";
import Chat, { IChat } from "../model/chatModel";
import User, { IUser } from "../model/userModel";
import mongoose from "mongoose";

export const doMessage = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req.user;
    const { chatId, content } = req.body;
    if (!chatId || !content) {
      res.status(401).json({
        success: false,
        message: "Provide all required fields",
      });
      return;
    }

    if (!user) {
      next(new AppError(401, "User is not authorized"));
      return;
    }
    let chat: IChat | null = await Chat.findById(chatId);
    let otherUser: IUser | null;

    // if no user find
    const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      user.id
    );
    let newChat: boolean = false;
    const chatToSend: {
      name?: string | undefined;
      image?: string | undefined;
      messages?: IMessage[];
      _id?: mongoose.Types.ObjectId | undefined;
      userId?: mongoose.Types.ObjectId | undefined;
      lastSeen?: Date | string;
      count?: number;
      users?: (mongoose.Types.ObjectId | IUser)[]; // Allow both ObjectId & User document
      
    } = {};
    if (!chat) {
      otherUser = await User.findById(chatId);
      if (!otherUser) {
        next(new AppError(400, "No user or chat selected"));
        return;
      }
      chat = await Chat.create({ users: [userId, otherUser._id] });
      newChat = true;
      chatToSend.name = otherUser?.name;
      chatToSend.image = otherUser?.image?.link;
      chatToSend._id = chat?._id;
      chatToSend.lastSeen = otherUser?.lastSeen || "";
      chatToSend.userId = otherUser._id;

      chatToSend.users = chat?.users;
    }

    let message: IMessage | null = await Message.create({
      sender: userId,
      chat: chat._id,
      content,
    });

    message = await Message.findById(message._id).populate("chat");
    if (newChat) {
      if (message) {
        chatToSend.messages = [message];
        chatToSend.count=0;
      }
      else {
        chatToSend.messages = [];
      }
    }
    chat = await Chat.findByIdAndUpdate(
      chat._id,
      { topMessage: message?._id},
      { new: true }
    );
    res.status(201).json({
      success: true,
      message: "Message send",
      newMessage: message,
      newChat,
      chat: chatToSend,
    });
  }
);

export const getAllMessage = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const { chatId } = req.body;
    if (!chatId) {
      next(new AppError(401, "Please provide all required fields"));
      return;
    }
    const allMessage = await Message.find({ chat: chatId });
    res.status(200).json({
      success: true,
      message: "All messages fetched",
      allMessage,
    });
  }
);
