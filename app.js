const path = require("path");
const express = require("express");
const app = express();
app.listen(6767);
const sqlite3 = require("sqlite3").verbose();
let sql;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const db = new sqlite3.Database("./ryddeApp", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});

app.get("/getTasks", (req, res) => {
  sql = "SELECT * FROM task";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.json(rows);
  });
});
