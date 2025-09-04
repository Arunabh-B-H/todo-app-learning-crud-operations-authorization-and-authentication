const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/basic_todo_app")
//   .then(() => {
//     console.log("Connected to MongoDB successfully!");
//     console.log("Attempting to drop the 'users' collection...");

//     // Drop the 'users' collection directly from the database
//     return mongoose.connection.dropCollection('users');
//   })
//   .then(() => {
//     console.log("Collection 'users' dropped successfully!");
//     console.log("You can now restart your server and try the registration again.");
//     process.exit(0); // Exit the script on success
//   })
//   .catch(err => {
//     console.error("Failed to connect or drop the collection:", err);
//     process.exit(1); // Exit the script on error
//   });
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
