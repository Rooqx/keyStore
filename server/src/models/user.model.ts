import mongoose from "mongoose";
import Key from "./key.model";

/**
 * User schema for MongoDB
 *
 * This model represents a user record in the database.
 * Each user record has a username, email, and password.

 */

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      default: "new user",
    }, // added index for fast queries
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
