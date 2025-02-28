import { Server, Socket } from "socket.io";
import User, { IUser } from "../model/userModel";
import mongoose from "mongoose";

const users: Map<string, string> = new Map();

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
// HANDLE NEW CHAT
socket.on(
  "new_chat",
  (chat: {users: IUser[], sender: string  }) => {
const sender=chat.sender;
    if (!chat.users || !Array.isArray(chat.users)) {
      return console.error("chat.users is not defined or not an array");
    }

    chat.users.forEach((user: IUser) => {
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
      console.log("typing back");
      if (room?._id) {
        socket.to(room._id).emit("typing", room);
      }
    });

    socket.on("stop_typing", (room) => {
      console.log("stop typing back");

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
            { lastSeen: new Date() },
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
