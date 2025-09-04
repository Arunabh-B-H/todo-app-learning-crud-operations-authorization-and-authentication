const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/basic_todo_app")
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));
const userModel = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  posts: {
    type: Array,
  },
});
module.exports = mongoose.model("user", userModel);
