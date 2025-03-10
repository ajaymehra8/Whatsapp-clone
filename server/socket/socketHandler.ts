import { Server, Socket } from "socket.io";
import User from "../model/userModel";
import mongoose from "mongoose";

const users: Map<string, string> = new Map();

// types
interface SingleChat {
  _id: string;
}
interface Message {
  _id: string; // Assuming MongoDB ObjectId is a string
  sender: string; // User ID of the sender
  content: string;
  createdAt: string; // ISO Date string
  chat: SingleChat;
  deletedFor?: string[];
}
interface UserType {
  name: string;
  email: string;
  image: {
    name: string;
    link: string;
  };
  lastSeen?: Date;
  _id: string;
};
interface ChatType{
      name?: string | undefined;
      image?: { name: string; link: string };
      messages?: Message[];
      topMessage?:Message|null;
      _id?: mongoose.Types.ObjectId | undefined;
      userId?:string | undefined;
      lastSeen?: Date | string;
      count?: number;
      users?: (UserType)[]; // Allow both ObjectId & User document
    };
const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on("setup", (userData: { _id: string }) => {
      socket.join(userData._id);
      users.set(userData._id, socket.id);

      io.emit("update_users", Array.from(users.keys()));
      socket.emit("connected");
    });

    // Join a chat room
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // Handle new messages
    socket.on(
      "send_message",
      (data: { chat: { users: string[] }; sender:string }) => {

        const { chat, sender } = data;

        if (!chat.users || !Array.isArray(chat.users)) {
          return console.error("chat.users is not defined or not an array");
        }

        chat.users.forEach((userId: string) => {
          if (userId !== sender) {
            const receiverSocketId = users.get(userId);
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("message_received", data);
            }
          }
        });
      }
    );
    // Handle message delete for everyone
    socket.on(
      "message_deleted",
      ({chat,message}:{chat:ChatType,message:Message}) => {

       const sender=message.sender;
       console.log(chat);
        chat.users?.forEach((user: UserType) => {
          if (user?._id !== sender) {
            const receiverSocketId = users.get(user?._id);
            if (receiverSocketId) {
              console.log("emited");
              io.to(receiverSocketId).emit("message_deleted", message);
            }
          }
        });
      }
    );
// HANDLE NEW CHAT
socket.on(
  "new_chat",
  (chat:ChatType) => {
const sender=chat.topMessage?.sender;
console.log(sender);
    if (!chat.users || !Array.isArray(chat.users)) {
      return console.error("chat.users is not defined or not an array");
    }
    const senderUser = chat?.users?.find(user => user._id === sender);
    chat.name=senderUser?.name;
    chat.image=senderUser?.image;
    chat.lastSeen=senderUser?.lastSeen;
    chat.userId=senderUser?._id;
    chat.users.forEach((user: UserType) => {
      if (user._id.toString() !== sender) {
        const receiverSocketId = users.get(user._id.toString());
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_chat", chat);
        }
      }
      
    });
  }
);
    socket.on("typing", (room) => {
      if (room?._id) {
        socket.to(room._id).emit("typing", room);
      }
    });

    socket.on("stop_typing", (room) => {

      if (room?._id) {
        socket.to(room._id).emit("stop_typing", room);
      }
    });

    // Handle user disconnect
    socket.on("disconnect", async () => {
      let userId: string | undefined;
      for (const [key, value] of users) {
        if (value === socket.id) {
          userId = key;
          break;
        }
      }

      if (userId) {
        users.delete(userId);
        io.emit("update_users", Array.from(users.keys())); // Notify all clients
        io.emit("user_status_changed", { userId, lastSeen: new Date() });

        try {
          await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(userId),
            { lastSeen: {time:new Date()} },
            { new: true }
          );
        } catch (error) {
          console.error("Error updating lastSeen:", error);
        }
      }

      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
