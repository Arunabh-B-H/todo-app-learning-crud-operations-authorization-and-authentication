const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userModel = require("./models/user-model");
const todoModel = require("./models/todo-model");
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse form bodies

app.set("view engine", "ejs");

const sessions = {};

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

function checkSession(req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessions[sessionId]) {
    req.user = sessions[sessionId];
  } else {
    req.user = null;
  }
  next();
}

app.use(checkSession);

app.get("/", async (req, res) => {
  try {
    let todos = [];
    let user = req.user;
    if (req.user) {
      todos = await todoModel.find({}).sort({ createdAt: -1 });
    }
    res.render("home", { todos, user });
  } catch (err) {
    console.log("Error fetching todos:", err);
    res.status(500).send("Server Error");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new userModel({ username, email, password });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Server Error during registration.");
  }
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
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).send("Todo not found");
    }
    res.render("edit", { todo, user: req.user });
  } catch (err) {
    console.error("Error fetching todo for edit:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/edit/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    await Todo.findByIdAndUpdate(req.params.id, { title, description });
    res.redirect("/");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Server Error");
  }
});

app.listen(5000);
