const express = require("express");
const app = express();
const userModel = require("./models/user-model");

app.get("/", (req, res) => {
  res.send("hello");
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

app.listen(5000);
