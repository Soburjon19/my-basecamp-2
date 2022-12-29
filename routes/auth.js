const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("db/database.db");
// db/database.db

const Router = require("express");
const router = Router();

router.get("/:action", (req, res) => {
  if (req.params.action == "login") {
    if (req.cookies.username) {
      res.redirect("/user/" + req.cookies.username);
    } else {
      res.render("auth", { action: "login" });
    }
  } else if (req.params.action == "signup") {
    if (req.cookies.username) {
      res.redirect("/user/" + req.cookies.username);
    } else {
      res.render("auth", { action: "signup" });
    }
  } else if (req.params.action == "logout") {
    res.clearCookie("username");
    res.redirect("/auth/login");
  } else {
    res.redirect("/auth/login");
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username == "" && password == "") {
    res.send("username or password is empty");
  } else {
    db.all(
      `select * from users where username = '${username}'`,
      (err, rows) => {
        if (rows.length == 0) {
          res.send("username or password incorrect");
        } else {
          if (username === rows[0].username && password === rows[0].password) {
            res.cookie("username", `${username}`);
            res.redirect(`/user/${username}`);
          } else {
            res.send("username or password incorrect");
          }
        }
      }
    );
  }
});

router.post("/signup", (req, res) => {
  const { email, password, username } = req.body;
  if (email == "" && username == "" && password == "") {
    res.send("all inputs are required");
  } else {
    if (password[0] === password[1]) {
      db.all(
        `select * from users where username = '${username}'`,
        (err, usernames) => {
          if (usernames.length == 0) {
            db.all(
              `select * from users where email = '${email}'`,
              (err, emails) => {
                if (emails.length == 0) {
                  db.run(
                    `insert into users (email, password, username) values ('${email}', '${password[0]}', '${username}')`
                  );
                  res.redirect("/auth/login");
                } else {
                  res.send("this email already exist");
                }
              }
            );
          } else {
            res.send("this username already exist");
          }
        }
      );
    } else {
      res.send("password 1  not equal to password 2");
    }
  }
});

module.exports = router;
