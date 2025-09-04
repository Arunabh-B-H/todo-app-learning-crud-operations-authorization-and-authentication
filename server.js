const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/register",(req,res)=>{
  
})

app.listen(5000);
