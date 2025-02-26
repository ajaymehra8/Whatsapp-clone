import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

// Define an interface for the user document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string | undefined;
  image?: { link: string; name: string };
  lastSeen?: Date;
  about?: string;
  // Add the method to the interface
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create a schema for the user
const userSchema: Schema<IUser> = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: [20, "Your name is too long, Please make it short."],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [7, "Password must contain 7 characters"],
      select: false,
    },
    image: {
      name: {
        type: String,
      },
      link: {
        type: String,
        default:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s",
      },
    },
    lastSeen: {
      type: Date,
    },
    about: {
      type: String,
    },
  },
  { timestamps: true }
);

// ENCRYPTION OF PASSWORD
userSchema.pre("save", async function (this) {
  try {
    const salt = await bcrypt.genSalt(12);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
  } catch (err) {
    console.log(err);
  }
});
// COMPARING PASSWORD
// Define an instance method for comparing passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password); // `this.password` is the hashed password from the document
};
// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
