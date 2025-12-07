const path = require("path");
const express = require("express");
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
  const { id } = req.body;
  db.prepare(
    "UPDATE task SET completed = current_timestamp() WHERE id = ?",
  ).run(id);
  return res.sendStatus(200);
});

// get request for getTasks obviously
app.get("/getTasks", (req, res) => {
  sql = "SELECT * FROM task WHERE completed IS NULL";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.json(rows);
  });
});

app.get("/getCompletedTasks", (req, res) => {
  sql = "SELECT * FROM task WHERE completed IS NOT NULL";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.json(rows);
  });
});

app.get("/getUsers", (req, res) => {
  sql = "SELECT * FROM user";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.json(rows);
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
