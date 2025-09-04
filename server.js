const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userModel = require("./models/user-model");
const todomodel = require("./models/todo-model");
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse form bodies

app.set("view engine", "ejs");

const dbUri = "mongodb://127.0.0.1:27017/basic_todo_app";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};
connectDB();

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  let { username, email, password } = req.body;
  let user = await userModel.create({
    username,
    email,
    password,
  });
  res.send(user);
});
app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.send("There is no such user");
  } else return res.send(user);
});
app.post("/create new todo", async (req, res) => {
  let { title, description } = req.body;
  let todo = await todo.create({
    title,
    description,
  });
});

app.listen(5000);
