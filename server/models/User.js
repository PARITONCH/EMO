const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("User", userSchema)