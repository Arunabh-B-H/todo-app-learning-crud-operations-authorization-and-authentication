const mongoose = require("mongoose");

// Define the schema for a single todo item
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add a user field to link the todo to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Create the 'Todo' model from the schema
const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
