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
    let chat: IChat | null = await Chat.findById(chatId).populate("users");
    let otherUser: IUser | null;

    // if no user find
    const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      user.id
    );
    let newChat: boolean = false;
    let isDeleted: boolean = false;
    const chatToSend: {
      name?: string | undefined;
      image?: { name: string; link: string };
      messages?: IMessage[];
      topMessage?: IMessage | null;
      _id?: mongoose.Types.ObjectId | undefined;
      userId?: mongoose.Types.ObjectId | undefined;
      lastSeen?: Date | string;
      count?: number;
      users?: (mongoose.Types.ObjectId | IUser)[]; // Allow both ObjectId & User document
    } = {};
    if (!chat) {
      otherUser = await User.findById(chatId);
      const chatAlreadyCreated: IChat | null = await Chat.findOne({
        users: { $all: [userId, otherUser?._id] },
      });
      if (chatAlreadyCreated) {
        next(new AppError(400, "Chat is already created"));
        return;
      }
      if (!otherUser) {
        next(new AppError(400, "No user or chat selected"));
        return;
      }
      chat = await Chat.create({ users: [userId, otherUser._id] });
      if (chat) chat = await Chat.findById(chat._id).populate("users");
      newChat = true;
      console.log("new chat created");
      chatToSend.name = otherUser?.name;
      chatToSend.image = otherUser?.image;
      chatToSend._id = chat?._id;
      chatToSend.lastSeen = otherUser?.lastSeen || "";
      chatToSend.userId = otherUser._id;

      chatToSend.users = chat?.users;
    } else {
      const otherUser =
        chat.users[0]._id.toString() === userId.toString()
          ? (chat.users[1] as IUser)
          : (chat.users[0] as IUser);
      const deletedForOtherUser = chat.deletedFor?.includes(otherUser._id);
      await Chat.findByIdAndUpdate(chat?._id, { deletedFor: [] });

      if (deletedForOtherUser) {
        console.log("working");
        newChat = true;
        isDeleted = true;
        if (chat) chat = await Chat.findById(chat._id).populate("users");
        newChat = true;
        chatToSend.name = otherUser?.name;
        chatToSend.image = otherUser?.image;
        chatToSend._id = chat?._id;
        chatToSend.lastSeen = otherUser?.lastSeen || "";
        chatToSend.userId = otherUser._id;

        chatToSend.users = chat?.users;
      }
    }
    let message: IMessage | null = await Message.create({
      sender: userId,
      chat: chat?._id,
      content,
    });

    message = await Message.findById(message._id).populate("chat");
    if (newChat && isDeleted) {
      const allMessages: IMessage[] = await Message.find({
        chat: chat?._id,
      }).populate("chat");
      chatToSend.messages = allMessages;
      chatToSend.topMessage = message;
      chatToSend.count = 0;
    } else if (newChat) {
      if (message) {
        chatToSend.messages = [message];
        chatToSend.topMessage = message;
        chatToSend.count = 0;
      } else {
        chatToSend.messages = [];
      }
    }
    chat = await Chat.findByIdAndUpdate(
      chat?._id,
      { topMessage: message?._id },
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

// DELETE MESSAGE for me

export const deleteMessageForMe = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const { messageId } = req.body;
    const user = req.user;
    if (!user) {
      next(new AppError(401, "Your are not authorized"));
      return;
    }
    if (!messageId) {
      next(new AppError(400, "No message selected to delete"));
      return;
    }
    const userId = new mongoose.Types.ObjectId(user?.id);
    const id = new mongoose.Types.ObjectId(messageId);
    await Message.findByIdAndUpdate(
      id,
      { $push: { deletedFor: userId } },
      { new: true }
    );
    console.log("deleted");
    res.status(200).json({
      success: true,
      message: "Message Deleted successfully",
    });
  }
);

// DELETE MESSAGE FOR EVERYONE
export const deleteMessageForEveryone = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const { messageId } = req.body;
    const user = req.user;
    if (!user) {
      next(new AppError(401, "Your are not authorized"));
      return;
    }
    if (!messageId) {
      next(new AppError(400, "No message selected to delete"));
      return;
    }
    const id = new mongoose.Types.ObjectId(messageId);
    const userId = new mongoose.Types.ObjectId(user?.id);

    const message = await Message.findById(id);
    if (!message?.sender.equals(userId)) {
      next(new AppError(401, "You are not sender of message"));
      return;
    }
    const newMessage: IMessage | null = await Message.findByIdAndUpdate(
      id,
      { deletedForEveryone: true, content: "Message Deleted" },
      { new: true }
    ).populate({ path: "chat", select: "_id users" });
    if (!newMessage) {
      next(new AppError(404, "No message found"));
      return;
    }
    res.status(200).json({
      success: true,
      message: "Message Deleted successfully",
      newMessage,
    });
  }
);
