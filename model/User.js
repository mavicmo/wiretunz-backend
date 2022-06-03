require("dotenv").config();
const mongoose = require("../db/connection");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    likedSongs: { type: [String], default: [] },
    playlists: { type: [String], default: [] },
    token: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWTPRIVATEKEY,
    { expireIn: "1d" }
  );
  return token;
};

// const validate = (user) => {
//   const schema = Joi.object({
//     firstName: Joi.string().min(5).max(10).required(),
//     lastName: Joi.string().min(5).max(10).required(),
//     email: Joi.string().email().required(),
//     password: passwordComplexity().required(),
//   });
//   return schema.validate(user);
// };

module.exports = User;
