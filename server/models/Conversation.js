const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  role: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
})

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Conversation", conversationSchema)