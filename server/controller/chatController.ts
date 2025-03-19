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
    const { unread, group } = req.query;

    if (!user) {
      next(new AppError(401, "User is not authorized"));
      return;
    }
    const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      user.id
    );
    interface Query {
      users: mongoose.Types.ObjectId;
      deletedFor: { $nin: mongoose.Types.ObjectId };
      count?: { $gt: number } | undefined;
      isGroupedChat?: boolean | undefined;
    }

    const query: Query = {
      users: userId,
      deletedFor: { $nin: userId },
    };

    if (unread) {
      query.count = { $gt: 0 };
    }

    if (group) {
      query.isGroupedChat = true;
    }

    let chats: IChat[] = await Chat.find(query).populate([
      {
        path: "users",
      },
      { path: "topMessage", select: "content createdAt sender" },
    ]);
    console.log(chats);
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
      if (!aPinned && bPinned) return 1; // 'b' comes first if only 'b' is pinned

      return 0; // Maintain original order if both are pinned or both are not
    });
    chats = chats.map((chat) => {
      if (chat.pinnedBy?.includes(userId)) {
        return { ...chat.toObject(), isPinned: true }; // Convert to plain object before modifying
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
    if (!user) {
      next(new AppError(404, "You are not authorized"));
      return;
    }
    const { selectedUserId } = req.params;

    // Convert both `selectedUserId` and `user?.id` to `mongoose.Types.ObjectId`
    const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      user?.id
    );

    const selectedUserObjectId: mongoose.Types.ObjectId =
      new mongoose.Types.ObjectId(selectedUserId);

    let chat: IChat | null = await Chat.findById(selectedUserObjectId).populate(
      [
        { path: "users", select: "name email image lastSeen" },
        { path: "topMessage" },
      ]
    );
    if (!chat) {
      chat = await Chat.findOne({
        isGroupedChat: false,
        users: { $all: [userId, selectedUserId] },
      }).populate([
        { path: "users", select: "name email image lastSeen" },
        { path: "topMessage" },
      ]);
    }

    const chatToSend: {
      name: string | undefined;
      image?: { name?: string; link: string };
      messages: IMessage[];
      _id: mongoose.Types.ObjectId | undefined;
      userId?: mongoose.Types.ObjectId | undefined;
      users?: IUser[];
      lastSeen?: { time: Date; visibility?: boolean } | undefined | string;
      count?: number;
      isGroupedChat?: boolean;
      groupAdmin?: string;
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
      chatToSend.isGroupedChat = false;

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
      chatToSend.groupAdmin = chat.groupAdmin?.toString();
      // chat.name = otherUser?.name;
      chatToSend.userId = otherUser._id;
      chatToSend._id = chat._id;
      chatToSend.lastSeen = otherUser.lastSeen || "";
      chatToSend.count = 0;
      chatToSend.users = chat.users as IUser[];
      chatToSend.isGroupedChat = chat?.isGroupedChat;
    } else {
      await Chat.findByIdAndUpdate(chat._id, { count: 0 });
      chatToSend.name = chat.groupName;
      chatToSend._id = chat._id;
      chatToSend.count = 0;
      chatToSend.image = chat.image;
      chatToSend.users = chat.users as IUser[];
      chatToSend.isGroupedChat = chat?.isGroupedChat;
      chatToSend.groupAdmin = chat?.groupAdmin?.toString();
    }
    const messages: IMessage[] = await Message.find({
      chat: chat?._id,
      deletedFor: { $nin: [userId] },
    }).populate("sender");
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
    if (!chatId) {
      next(new AppError(400, "No chat provided"));
      return;
    }
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

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { deletedFor: userId }, $pull: { pinnedBy: userId } },
      { new: true }
    );
    if (!updatedChat) {
      next(new AppError(400, "No chat found to delete"));
      return;
    }
    await Message.updateMany(
      { chat: updatedChat._id },
      { $push: { deletedFor: userId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  }
);

// PIN CHAT
export const pinChat = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    let userId = req.user?.id;
    let chatId = req.body?.chatId;
    if (!chatId) {
      next(new AppError(400, "No chat provided."));
      return;
    }
    userId = new mongoose.Types.ObjectId(userId);
    chatId = new mongoose.Types.ObjectId(chatId);
    const chat: IChat | null = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { pinnedBy: userId } },
      { new: true }
    );
    if (!chat) {
      next(new AppError(404, "No chat found"));
      return;
    }
    res.status(200).json({
      success: true,
      message: "Chat pinned",
      chat,
    });
  }
);

// UNPIN CHAT
export const unpinChat = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    let userId = req.user?.id;
    let chatId = req.body?.chatId;
    if (!chatId) {
      next(new AppError(400, "No chat provided."));
      return;
    }
    userId = new mongoose.Types.ObjectId(userId);
    chatId = new mongoose.Types.ObjectId(chatId);
    const chat: IChat | null = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { pinnedBy: userId } },
      { new: true }
    );
    if (!chat) {
      next(new AppError(404, "No chat found"));
      return;
    }
    res.status(200).json({
      success: true,
      message: "Chat unpinned",
      chat,
    });
  }
);

// CREATE GROUP
export const createGroup = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req.user;
    if (!user) {
      next(new AppError(401, "User is not authorized"));
      return;
    }
    const { name } = req.body;
    const selectedUsers = JSON.parse(req.body.selectedUsers);

    const { groupImage } = req.body;
    if (!name || !selectedUsers) {
      next(new AppError(400, "Please provide all valid fields"));
      return;
    }
    const userId = new mongoose.Types.ObjectId(user.id);
    const fields: {
      groupName: string;
      users: string[];
      isGroupedChat: boolean;
      groupAdmin: mongoose.Types.ObjectId;
      image?: { link: string };
      topMessage?: IMessage;
    } = {
      groupName: name,
      users: selectedUsers,
      isGroupedChat: true,
      groupAdmin: userId,
    };
    if (groupImage) {
      fields.image = { link: groupImage?.link };
    }

    let chat: IChat | null = await Chat.create(fields);
    const message: IMessage | null = await Message.create({
      sender: userId,
      content: `Group created by ${req.user?.name}.`,
      chat: chat?._id,
      notification: userId,
    });
    chat = await Chat.findByIdAndUpdate(chat._id, { topMessage: message?._id })
      .select("-deletedFor -pinnedBy")
      .populate([{ path: "users" }, { path: "topMessage" }]);
    if (chat) {
      chat.topMessage = chat.topMessage as IMessage;
      if (message) chat.topMessage = message;
    }

    res.status(201).json({
      success: true,
      message: "Group created successfuly",
      chat: { ...chat?.toObject(), messages: [message] },
    });
  }
);

// GET GROUP MEMBERS
export const getGroupMembers = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new AppError(401, "You are not authorized"));
      return;
    }
    const groupId = new mongoose.Types.ObjectId(req.params.groupId);
    // const userId=new mongoose.Types.ObjectId(user?._id);
    const chat: IChat | null = await Chat.findOne({
      isGroupedChat: true,
      _id: groupId,
    }).populate({
      path: "users",
      select: "name email about image",
    });
    if (!chat) {
      next(new AppError(404, "No chat found"));
      return;
    }
    const admin = chat.groupAdmin;
    const members = chat.users as IUser[];
    members.sort((a, b) => {
      if (a._id.equals(admin) || b._id.equals(admin))
        return a._id.equals(admin) ? -1 : b._id.equals(admin) ? 1 : 0;
      return a._id.equals(user?.id) ? -1 : b._id.equals(user?.id) ? 1 : 0;
    });
    res.status(200).json({
      success: true,
      message: "Members fetched successfuly",
      members,
    });
  }
);

// LEAVE GROUP
export const leaveGroup = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req.user;
    console.log("leavegroup");
    if (!user) {
      next(new AppError(401, "You are not authorized"));
      return;
    }
    const { chatId }: { chatId: string | undefined } = req.body;
    if (!chatId) {
      next(new AppError(400, "No chat selcted"));
      return;
    }
    const id = new mongoose.Types.ObjectId(chatId);
    let chat: IChat | null = await Chat.findOne({
      isGroupedChat: true,
      _id: id,
    });
    if (!chat) {
      next(new AppError(404, "No chat found"));
      return;
    }
    const userId = new mongoose.Types.ObjectId(user?.id);
    chat = await Chat.findByIdAndUpdate(
      id,
      { $pull: { users: userId } },
      { new: true }
    ).populate([
      {
        path: "users",
        select: "image name about",
      },
      {
        path: "topMessage",
      },
    ]);
    console.log(chat);
    if (!chat) {
      next(new AppError(500, "Problem in updating chat"));
      return;
    }
    res.status(200).json({
      success: true,
      message: "You leaved the group.",
      chat,
    });
  }
);

// REMOVE GROUP MEMBERS
export const removeGroupMembers = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new AppError(401, "You are enot authorized"));
      return;
    }
    const {
      selectedUser,
      group,
    }: { selectedUser: string | undefined; group: string | undefined } =
      req.body;
    if (!selectedUser || !group) {
      next(new AppError(400, "Provide all required credentials."));
      return;
    }
    const userId = new mongoose.Types.ObjectId(user.id);
    const selectedUserId = new mongoose.Types.ObjectId(selectedUser);
    const chatId = new mongoose.Types.ObjectId(group);
    let chat: IChat | null = await Chat.findOne({
      isGroupedChat: true,
      _id: chatId,
      users: { $all: [userId, selectedUserId] },
    });
    if (!chat) {
      next(new AppError(404, "No chat found"));
      return;
    }
    if (!chat?.groupAdmin?.equals(userId)) {
      next(new AppError(401, "You are not the admin of the group"));
      return;
    }
    chat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: selectedUserId } },
      { new: true }
    ).populate([
      {
        path: "users",
        select: "image name about email _id",
      },
      {
        path: "topMessage",
      },
    ]);
    if (!chat) {
      next(new AppError(404, "No chat updated"));
      return;
    }
    if (chat && chat.users) {
      chat.users.sort((a, b) => {
        if (a._id.equals(chat.groupAdmin) || b._id.equals(chat.groupAdmin)) {
          return a._id.equals(chat.groupAdmin) ? -1 : 1;
        }
        return a._id.equals(user?.id) ? -1 : 1;
      });
    }
    res.status(200).json({
      success: true,
      message: "User removed successfully",
      chat,
    });
  }
);

// ADD GROUP MEMBERS
export const addGroupMembers = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req.user;
    console.log("added");
    const { group, selectedUsers } = req.body;
    if (!group || !selectedUsers) {
      next(new AppError(400, "Please provide all required fields"));
      return;
    }
    if (!user) {
      next(new AppError(401, "Your are not authorized"));
      return;
    }
    const userId = new mongoose.Types.ObjectId(user?.id);
    const groupId = new mongoose.Types.ObjectId(group);
    const selectedUsersId = selectedUsers.map(
      (u: string) => new mongoose.Types.ObjectId(u)
    );
    let chat: IChat | null = await Chat.findById(groupId);
    if (!chat) {
      next(new AppError(404, "Chat not found"));
      return;
    }
    if (!chat.groupAdmin?.equals(userId)) {
      next(new AppError(401, "You are not admin of the group"));
      return;
    }
    chat = await Chat.findByIdAndUpdate(
      groupId,
      { $push: { users: { $each: selectedUsersId } } },
      { new: true }
    ).populate([
      {
        path: "users",
        select: "name image email about _id",
      },
      {
        path: "topMessage",
      },
    ]);
    if (chat && chat.users) {
      chat.users.sort((a, b) => {
        if (a._id.equals(chat.groupAdmin) || b._id.equals(chat.groupAdmin)) {
          return a._id.equals(chat.groupAdmin) ? -1 : 1;
        }
        return a._id.equals(user?.id) ? -1 : 1;
      });
    }
    res.status(201).json({
      success: true,
      message: "Members added successfully",
      chat,
    });
  }
);

// UPDATE GROUP
export const updateGroup = catchAsync(
  async (req: MyRequest, res: Response, next: NextFunction) => {
    const user: JwtPayload | undefined = req.user;
    if (!user) {
      next(new AppError(401, "You are not authorized"));
      return;
    }
    const { name, group } = req.body;
    const image = req.body.groupImage;
    if ((!name && !image) || !group) {
      next(new AppError(400, "Must required one field."));
      return;
    }
    const userId = new mongoose.Types.ObjectId(user?.id);
    const groupId = new mongoose.Types.ObjectId(group);
    let chat: IChat | null = await Chat.findById(groupId);
    if (!chat) {
      next(new AppError(404, "Chat not found"));
      return;
    }
    if (!chat.groupAdmin?.equals(userId)) {
      next(new AppError(401, "You are not admin of the group"));
      return;
    }
    chat = await Chat.findByIdAndUpdate(
      groupId,
      { groupName: name, image },
      { new: true }
    ).populate([
      {
        path: "users",
        select: "name image email about _id",
      },
      {
        path: "topMessage",
      },
    ]);
    if (chat && chat.users) {
      chat.users.sort((a, b) => {
        if (a._id.equals(chat.groupAdmin) || b._id.equals(chat.groupAdmin)) {
          return a._id.equals(chat.groupAdmin) ? -1 : 1;
        }
        return a._id.equals(user?.id) ? -1 : 1;
      });
    }
    const messages: IMessage[] = await Message.find({
      chat: chat?._id,
      deletedFor: { $nin: [userId] },
    }).populate("sender");
    const chatToSend = { ...chat?.toObject(), messages };
    console.log(chatToSend);
    res.status(201).json({
      success: true,
      message: "Group updated successsfully",
      chat: chatToSend,
    });
  }
);
