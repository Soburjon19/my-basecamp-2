const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("db/database.db");
const Router = require("express");
const router = Router();
const multer = require("multer");
const upload = multer({ dest: "public/uploads/images/" });

router.get("/addPoject/", (req, res) => {
  res.render("newProject");
});

router.post("/addPoject/", (req, res) => {
  const { name, description } = req.body;
  if (name == "" && description == "") {
    res.send("all inputs are required");
  } else {
    db.run(`
      insert into projects (name, description, user)
      values ('${name}', '${description}', '${req.cookies.username}')
    `);
    res.redirect("/auth/login");
  }
});

router.get("/getAllProjects", (req, res) => {
  db.all("select * from projects", (err, rows) => {
    res.json(rows);
  });
});

router.get("/deleteProject/:delId", (req, res) => {
  db.all(
    `select * from projects where id = ${req.params.delId}`,
    (err, rows) => {
      rows[0].user == req.cookies.username
        ? (db.run(`DELETE FROM projects where id = ${req.params.delId}`),
          res.redirect("/auth/login"))
        : res.send("You can't delete this project!");
    }
  );
});

router.get("/projectSettings/:id", (req, res) => {
  // res.send(req.params.id);
  const { username } = req.cookies;
  username
    ? db.all(
        `select * from users where username = '${username}'`,
        (err, rows) => {
          if (rows[0].username === username) {
            let members = "";
            db.all(
              `select * from member where projectId = '${req.params.id}'`,
              (err, rows) => {
                members = rows;
              }
            );
            db.all(
              `select * from projects where id = ${req.params.id}`,
              (err, data) => {
                res.render("projectSettings", { data, members });
                // res.json({ data, members });
              }
            );
          } else {
            res.send("You can't access this project settings");
          }
        }
      )
    : res.redirect("/auth/login");
});

router.get("/allProjects", (req, res) => {
  const { username } = req.cookies;
  db.all(`select * from users`, (err, rows) => {
    db.all(`select * from projects order by id desc`, (err, projects) => {
      res.render("allProjects", { rows, projects, username });
    });
  });
});

router.get("/projectOverview/:id", (req, res) => {
  const { id } = req.params;
  db.all(`select * from projects where id = ${id}`, (err, projects) => {
    db.all(`select * from member where projectId = ${id}`, (err, members) => {
      db.all(`select * from topics where projectId = ${id}`, (err, topics) => {
        db.all(`select * from tasks where projectId = ${id}`, (err, tasks) => {
          db.all(
            `select * from attachments where projectId = ${id}`,
            (err, attachments) => {
              res.render("projectOverview", {
                projects,
                members,
                topics,
                tasks,
                attachments,
              });
              
            }
          );
        });
      });
    });
  });
});

router.post("/addMember", (req, res) => {
  db.run(
    `insert into member (projectId, username) values ('${req.body.projectId}', '${req.body.username}')`,
    (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect(`/project/projectSettings/${req.body.projectId}`);
    }
  );
});

router.post("/overView/:action/:id", (req, res) => {
  switch (req.params.action) {
    case "addTopic":
      db.run(
        `insert into topics (username, projectId, topic) 
        values ('${req.cookies.username}', '${req.params.id}', '${req.body.topic}')`,
        (err) => {
          if (err) {
            console.log(err);
          }
          res.redirect(`/project/projectOverview/${req.params.id}`);
          // res.json(req.body)
        }
      );
      break;
    case "addTask":
      db.run(
        `insert into tasks (username, projectId, task) 
          values ('${req.cookies.username}', '${req.params.id}', '${req.body.task}')`,
        (err) => {
          if (err) {
            console.log(err);
          }
          res.redirect(`/project/projectOverview/${req.params.id}`);
        }
      );
      break;

    default:
      res.redirect(`/project/projectOverview/${req.params.id}`);
      break;
  }
});

router.post("/addAttachment/:id", upload.single("file"), (req, res) => {
  db.run(
    `insert into attachments (username, projectId, file) values ('${req.cookies.username}', '${req.params.id}', '${req.file.filename}')`
  );
  res.redirect(`/project/projectOverview/${req.params.id}`);
});

router.post("/updateProject", (req, res) => {
  db.run(
    `UPDATE projects
  SET name = '${req.body.name}', description = '${req.body.description}'
  WHERE id = ${req.body.id}`,
    (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/auth/login");
    }
  );
});

module.exports = router;
