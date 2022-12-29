const Router = require("express");
const router = Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.db");

router.get("/:user", (req, res) => {
  const { username } = req.cookies;
  if (req.params.user == username) {
    db.all(
      `select * from users where username = '${username}'`,
      (err, rows) => {
        db.all(
          `select * from projects where user = '${username}'`,
          (err, projects) => {
            if (rows[0].admin == "true") {
              res.redirect(`/admins/${username}`);
            } else {
              res.render("user", { rows, projects });
            }
          }
        );
      }
    );
  } else {
    db.all(
      `select id, username, email from users where username = '${req.params.user}'`,
      (err, user) => {
        db.all(
          `select * from projects where user = '${req.params.user}'`,
          (err, projects) => {
            res.render("guest", { user, projects });
          }
        );
      }
    );
  }
});

module.exports = router;
