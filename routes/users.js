const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  dob: String,
  bio: String,
  notifications: [mongoose.Schema.Types.ObjectId],
  picture: {
    type: String,
    default:
      "https://plus.unsplash.com/premium_photo-1738980401922-70995a1b6ade?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVmYXVsdCUyMHByb2ZpbGUlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  followings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story",
    },
  ],
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
