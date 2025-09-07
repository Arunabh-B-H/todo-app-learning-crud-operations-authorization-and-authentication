const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user-model");
const todoModel = require("./models/todo-model");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// In-memory session store (less secure and not persistent)
const sessions = {};

const dbUri = "mongodb://127.0.0.1:27017/basic_todo_app";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
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
    if (user) {
      todos = await todoModel.find({ user: user._id }).sort({ createdAt: -1 });
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

app.get("/logout", (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    delete sessions[sessionId];
  }

  // Force the browser to clear the cookie by setting an empty value with a past expiration date.
  res.cookie("sessionId", "", { expires: new Date(0), path: "/" });

  console.log("User logged out and session deleted from the server.");
  res.redirect("/login");
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(409).send("Username or email already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const sessionId = Math.random().toString(36).substring(2, 15);
    sessions[sessionId] = newUser;
    res.cookie("sessionId", sessionId, { httpOnly: true });

    res.redirect("/");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Server Error during registration.");
  }
});

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await userModel.findOne({ email, password });
    if (!user) {
      return res.send("Invalid email or password");
    }
    const isMatch = bcrypt.compare(password, user.password);
    console.log(password);
    if (!isMatch) {
      res.send("Invalid password");
    }
    const sessionId = Math.random().toString(36).substring(2, 15);
    sessions[sessionId] = user;
    res.cookie("sessionId", sessionId, { httpOnly: true });
    res.redirect("/");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Server Error during login.");
  }
});

app.post("/create", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  try {
    const { title, description } = req.body;
    const newTodo = new todoModel({ title, description, user: req.user._id });
    await newTodo.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/delete/:id", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  try {
    const todoId = req.params.id;
    await todoModel.findByIdAndDelete(todoId);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("Server Error");
  }
});

app.get("/edit/:id", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  try {
    const todo = await todoModel.findById(req.params.id);
    if (!todo) {
      return res.status(404).send("Todo not found");
    }
    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to edit this todo.");
    }
    res.render("edit", { todo, user: req.user });
  } catch (err) {
    console.error("Error fetching todo for edit:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/edit/:id", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  try {
    const { title, description } = req.body;
    const todoId = req.params.id;
    const todo = await todoModel.findById(todoId);
    if (!todo) {
      return res.status(404).send("Todo not found");
    }
    if (todo.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send("You are not authorized to update this todo.");
    }
    await todoModel.findByIdAndUpdate(todoId, { title, description });
    res.redirect("/");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
