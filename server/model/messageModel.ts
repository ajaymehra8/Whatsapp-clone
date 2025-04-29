import mongoose, { Schema } from "mongoose";
import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chat: Types.ObjectId;
  content: string;
  deletedFor: Types.ObjectId[];
  deletedForEveryone: boolean;
  notification?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message can't be empty"],
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
export default MessageModel;
