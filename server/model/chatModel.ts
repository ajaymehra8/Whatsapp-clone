import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./userModel";
// Define an interface for the user document
export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  groupName?: string;
  image?: string;
  isGroupedChat?: boolean;
  groupAdmin?: mongoose.Types.ObjectId;
  topMessage?: string;
  users: (mongoose.Types.ObjectId | IUser)[]; // Allow both ObjectId & User document
  count:number;
}

const chatSchema: Schema<IChat> = new mongoose.Schema<IChat>(
  {
    groupName: {
      type: String,
    },
    isGroupedChat: {
      type: Boolean,
      default: false,
    },
    groupAdmin: {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
    },
    image: {
      type: String,
    },
    topMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Message"
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    count:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

const chatModel: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default chatModel;
