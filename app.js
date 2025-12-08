const path = require("path");
const express = require("express");
const { queryObjects } = require("v8");
const app = express();
const sqlite3 = require("sqlite3").verbose();
let sql;
app.use(express.static("public"));
// Legg til body-parsing for skjema JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// grooooooooooooooooot
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// database :solbriller emotikon:
const db = new sqlite3.Database("./ryddeApp", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});

app.post("/addTask", (req, res) => {
  let { taskName, currentName, taskDescription, taskDifficulty } = req.body;
  taskName = taskName.toString().trim();
  taskDescription = taskDescription.toString().trim();

  db.prepare(
    "INSERT INTO task (name, creatorUser, description, difficulty) VALUES (?, ?, ?, ?)",
  ).run(taskName, currentName, taskDescription, taskDifficulty);

  return res.sendStatus(201);
});

app.post("/completeTask", (req, res) => {
  const { id, currentName } = req.body;
  const currentTime = new Date().toLocaleString()
  console.log(currentTime)
  db.prepare("UPDATE task SET completed = ?, completerUser = ? WHERE id = ?").run(currentTime, currentName, id);
  console.log("hei, jeg heter /completeTask og jeg fikk", currentTime, id, currentName);
  return res.sendStatus(200);
});

app.post("/addPoints", (req, res) => {
  const { taskDifficulty, username } = req.body;
  console.log("points");
  db.prepare("UPDATE user SET points = points + ? WHERE username = ?").run(
    taskDifficulty,
    username,
  );
  return res.sendStatus(200);
});

// get request for getTasks obviously
app.get("/getTasks", (req, res) => {
  sql = "SELECT * FROM task WHERE completed IS NULL"
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.json(rows);
  });
});

app.post("/getCompletedTasks", (req, res) => {
  const { username } = req.body
  console.log(username)
  sql = "SELECT * FROM task WHERE completed IS NOT NULL AND completerUser = ?";
  db.all(sql, [username], (err, rows) => {
    if (err) return console.error(err.message)
    res.json(rows)
    console.log("hei. jeg heter /getCompletedTasks og jeg fikk dette:", rows)
  });
});

app.get("/getUsers", (req, res) => {
  sql = "SELECT username FROM user";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message)
    res.json(rows);
  });
});

app.post("/getUserPoints", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.json({ error: "username missing" });
  }
  const sql = "SELECT rank, points FROM user WHERE username = ?";
  db.get(sql, [username], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.json({ error: "database error" });
    }
    res.json(row || { rank: 0, points: 0 });
  });
});

app.delete("/deleteTask", (req, res) => {
  try {
    const { id } = req.body;
    db.prepare("DELETE FROM task WHERE id = ?").run(id);
    return res.sendStatus(200);
  } catch (err) {
    console.log("feil ved sletting av melding:", err);
    return res.status(500).json({ error: "kunne ikke slette melding" });
  }
});

// server listener på port 6767 (http://localhost:6767) - konrad
const port = "6767";
app.listen(6767);
console.log("yo, jeg kjører på http://localhost:" + port);
