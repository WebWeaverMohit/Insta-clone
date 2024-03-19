const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  caption: String, 
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment'
    }
  ],
  caption: String,
  date: {
    type: Date,
    default: Date.now
  },
  shares:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  picture: String
})

module.exports = mongoose.model("post", postSchema)