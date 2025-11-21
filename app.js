const path = require("path");
const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
let sql;

// grooooooooooooooooot
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// database :solbriller emotikon:
const db = new sqlite3.Database("./ryddeApp", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});

// get request for getTasks obviously
app.get("/getTasks", (req, res) => {
  sql = "SELECT * FROM task";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.json(rows);
  });
});

// server listener på port 6767 (http://localhost:6767) - konrad
const port = "6767";
app.listen(6767);
console.log("yo, jeg kjører på http://localhost:" + port);