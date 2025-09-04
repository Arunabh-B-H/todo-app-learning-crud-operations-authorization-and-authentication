const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userModel = require("./models/user-model");
const todoModel = require("./models/todo-model");
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
app.get("/", async (req, res) => {
  try {
    const todos = await todoModel.find({});
    res.render("home", { todos: todos }); // Pass the todos array to the EJS file
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).send("Server error.");
  }
});

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
  } else return res.redirect("/");
});
app.post("/create", async (req, res) => {
  let { title, description } = req.body;
  let todo = await todoModel.create({
    title,
    description,
  });
  res.redirect("/");
});
app.post("/delete/:id", async (req, res) => {
  let todoId = req.params.id;
  await todoModel.findByIdAndDelete(todoId);
  res.redirect("/");
});
app.get("/edit/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const todo = await todoModel.findById(todoId);
    if (!todo) {
      return res.send("Todo not found.");
    }
    res.render("edit", { todo: todo });
  } catch (error) {
    console.error("Error fetching todo for edit:", error);
    res.send("Server error.");
  }
});

app.post("/edit/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const { title, description } = req.body; 
    await todoModel.findByIdAndUpdate(todoId, { title, description });
    res.redirect("/");
  } catch (error) {
    res.send("Server error." + error);
  }
});

app.listen(5000);
