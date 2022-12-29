const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.db");
const cookieParser = require("cookie-parser");
const PORT = 8080;
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const authRouter = require("./routes/auth");
const projectRouter = require("./routes/project");
const userRouter = require("./routes/user");
const main = require("./routes/main");

app.use((req, res, next) => {
  let logged = "";
  if (req.cookies.username) {
    logged = req.cookies.username;
  } else {
    logged = "not logged";
  }
  db.run(`
    insert into logs (path, user)
    values ("${req.hostname}:${PORT}${req.url}", "${logged}") 
  `);
  next();
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", main);
app.use("/auth/", authRouter);
app.use("/project/", projectRouter);
app.use("/user/", userRouter);




app.listen( process.env.PORT || PORT, console.log(`http://localhost:${PORT}`));
