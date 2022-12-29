const Router = require("express");
const router = Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.db");



router.get("/editProfile", (req, res) => {
  const { username } = req.cookies;
  if (!req.cookies.username) {
    res.redirect("/auth/login");
  } else {
    db.all(
      `select * from users where username = '${username}'`,
      (err, rows) => {
        res.render("editProfile", { rows });
      }
    );
  }
});

router.post("/editProfile", (req, res) => {
  const { username, email, password } = req.body;
  db.all(
    `select * from users where username = '${username}'`,
    (err, usernames) => {
      if (usernames.length == 0) {
        db.all(
          `select * from users where email = '${email}'`,
          (err, emails) => {
            if (emails.length == 0) {
              if (password.length < 4) {
                res.send("password length is minimal 4");
              } else {
                db.run(`
                  update users set username = "${username}",
                  email = "${email}",
                  password = "${password}" where username = "${req.cookies.username}"
                `);
                res.cookie("username", username);
                res.redirect(`/user/${req.cookies.username}`);
              }
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
});

router.get("/serarchUser", (req, res) => {
  db.all(
    `select id, username, email from users where username = '${req.query.uName}'`,
    (err, user) => {
      db.all(
        `select * from projects where user = '${req.query.uName}'`,
        (err, projects) => {
          res.render("guest", { user, projects });
        }
      );
    }
  );
});

router.get("/comments/:id", (req, res) => {
  db.all(
    `select * from comments where projectId = "${req.params.id}" ORDER BY ID DESC`,
    (err, comments) => {
      let id = req.params.id;
      res.render("comments", { comments, id });
    }
  );
});

router.post("/addComment/:id", (req, res) => {
  const { username } = req.cookies;
  if (!username) {
    res.send(
      "<h2>you are not logged <br> pleace <a href='/auth/login'> Login </a></h2>"
    );
  } else {
    db.run(
      `insert into comments (user, comment, projectId) values ('${username}', '${req.body.comment}', '${req.params.id}')`
    );
    res.redirect(`/comments/${req.params.id}`);
  }
});

module.exports = router