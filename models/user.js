const mongoose = require("mongoose");
const crypto = require("crypto");
//import { v1 as uuidv1 } from "uuid";
//const uuidv1=require("uuid/v1")
const { v1: uuidv1 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastName: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    userInfo: {
      type: String,
      trim: true,
    },
    encry_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
  })
  .get();

userSchema.methods = {
  authenticate: function (plainpwd) {
    return this.securePassword(plainpwd) === this.encry_password ? true : false;
  },

  securePassword: function (plainpwd) {
    if (!plainpwd) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpwd)
        .digest("hex");
    } catch (error) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
