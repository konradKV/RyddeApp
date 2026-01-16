const path = require("path");
const express = require("express");
const app = express();
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt")
const session = require("express-session")
app.use(express.static(path.join(__dirname, "public"), {  index: false}))
// DB (sync, no callback)
const db = new Database("./ryddeApp");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// middleware: session
app.use(
  session({
    secret: "hemmelig-nok-til-lab",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  })
);


// logger
function logger(req, res, next) {
  console.log(req.method + " " + req.url);
  next();
}
app.use(logger);


// ---------- LOGIN ----------

function getUser(username) {
  const stmt = db.prepare(
    "SELECT id, username, password FROM user WHERE username = ?"
  );
  return stmt.get(username);
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = getUser(username);

  if (!user) {
    return res.status(401).send("Invalid username or password");
  }
  var ok = bcrypt.compareSync(password, user.password);
  if (!ok){
   return res.sendFile(path.join(__dirname, "public", "login.html"))
  }
  req.session.user = { id: user.id, username: user.username }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});



function requireAuth(req, res, next){
  var isLoggedIn = Boolean(req.session?.user)
  if (!isLoggedIn){
    console.log("1")
    return res.sendFile(path.join(__dirname, "public", "login.html"))
  }
  next()
}


app.get("/", requireAuth, (req, res) =>{
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ---------- TASKS ----------

app.post("/addTask", (req, res) => {
  try {
    let { taskName, currentName, taskDescription, taskDifficulty } = req.body;

    taskName = taskName.toString().trim();
    taskDescription = taskDescription.toString().trim();

    db.prepare(
      "INSERT INTO task (name, creatorUser, description, difficulty) VALUES (?, ?, ?, ?)"
    ).run(taskName, currentName, taskDescription, taskDifficulty);

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/completeTask", (req, res) => {
  try {
    const { id, currentName } = req.body;
    const currentTime = new Date().toLocaleString();

    db.prepare(
      "UPDATE task SET completed = ?, completerUser = ? WHERE id = ?"
    ).run(currentTime, currentName, id);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/addPoints", (req, res) => {
  try {
    const { taskDifficulty, username } = req.body;

    db.prepare(
      "UPDATE user SET points = points + ? WHERE username = ?"
    ).run(taskDifficulty, username);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});



// ---------- GET TASKS ----------

app.get("/getTasks", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM task WHERE completed IS NULL")
      .all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/getCompletedTasks", (req, res) => {
  try {
    const { username } = req.body;

    const rows = db
      .prepare(
        "SELECT * FROM task WHERE completed IS NOT NULL AND completerUser = ?"
      )
      .all(username);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/getAllCompletedTasks", (req, res) => {
  try {
    const { username } = req.body;

    const rows = db
      .prepare(`
        SELECT t.*, u.username AS user_username
        FROM task t
        INNER JOIN user u ON t.completerUser = u.username
        WHERE t.completed IS NOT NULL AND u.username = ?
      `)
      .all(username);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ---------- USERS ----------

app.get("/getUsers", requireAuth, (req, res) => {
  try {
    const rows = db
      .prepare("SELECT username, points FROM user ORDER BY points DESC")
      .all();

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/getUserPoints", (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.json({ error: "username missing" });
    }

    const row = db
      .prepare("SELECT rank, points FROM user WHERE username = ?")
      .get(username);

    res.json(row || { rank: 0, points: 0 });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ---------- DELETE ----------

app.delete("/deleteTask", (req, res) => {
  try {
    const { id } = req.body;
    db.prepare("DELETE FROM task WHERE id = ?").run(id);
    res.sendStatus(200);
  } catch (err) {
    console.error("feil ved sletting:", err);
    res.status(500).json({ error: "kunne ikke slette melding" });
  }
});

// ---------- SERVER ----------

const port = 6767;
app.listen(port);
console.log("yo, jeg kjører på http://localhost:" + port);
