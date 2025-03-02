import mongoose, { Schema, Document, Model } from "mongoose";
// Define an interface for the user document
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
  content:string;
  deletedFor?:mongoose.Types.ObjectId[];
  deletedForEveryone?:boolean
};

const messageSchema:Schema<IMessage>=new mongoose.Schema<IMessage>({
sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
chat:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Chat",
    required:true,
},
content:{
    type:String,
    required:[true,"Message can't be empty"],
},
deletedFor:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
],
deletedForEveryone:{
    type:Boolean,
    default:false
}
},{timestamps:true});
const messageModel:Model<IMessage>=mongoose.model<IMessage>("Message",messageSchema);
export default messageModel;