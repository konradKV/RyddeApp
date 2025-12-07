//  const clickSound = document.getElementById("clickSound");
//  const hoverSound = document.getElementById("hoverSound");

//   document.querySelectorAll("button").forEach((btn) => {
//       btn.addEventListener("mouseenter", () => {
//           hoverSound.currentTime = 0;
//           hoverSound.play();
//       });
//
//       btn.addEventListener("click", () => {
//           clickSound.currentTime = 0;
//          clickSound.play();
//       });
//    });

const buttons = document.querySelectorAll(".buttonslayout button");
const pages = document.querySelectorAll(".page");

function showPage(id, index) {
  // Hide all pages
  pages.forEach(
    (p) => (p.style.display = "none"),
    console.log("Removed class"),
  );
  // Show requested page
  document.getElementById(id).style.display = "block";
  // If index is null → skip updating bottom buttons
  if (index === null) return;

  // Update selected bottom button
  buttons.forEach((b) => b.classList.remove("selected"));
  buttons[index].classList.add("selected");
}

// Bottom navigation buttons
buttons[0].addEventListener("click", () => showPage("page-leaderboard", 0));
buttons[1].addEventListener("click", () => showPage("page-tasks", 1));
buttons[2].addEventListener(
  "click",
  () => showPage("page-home", 2),
  displayComletedTasks(),
  displayPoints(),
);

// Internal “+ Oppgave” button
document
  .getElementById("btn-create")
  .addEventListener("click", () => showPage("page-create", null));

//internal til "active-task" path
function WorkingPage() {}

// When "Lag oppgave" inside the form is submitted → go to default page
document.getElementById("skjema").addEventListener("submit", (event) => {
  event.preventDefault(); // prevents page reload

  // Go back to default page
  showPage("page-tasks", 1);
});

//default page
showPage("page-tasks", 1);

let currentName = "";

async function displayUsers() {
  const userDropdown = document.getElementById("user-selection");
  const getUsers = await fetch("/getUsers");
  const userData = await getUsers.json();
  console.log(userData);

  userData.forEach((item) => {
    const userOption = document.createElement("option");
    userOption.value = item.id;
    userOption.textContent = item.username;
    userDropdown.appendChild(userOption);
  });
  currentName = nameSelect.options[nameSelect.selectedIndex].text;
}
displayUsers();

const utskrift = document.getElementById("utskrift");
async function displayTasks() {
  console.log("displayTasks er kjørt");
  utskrift.innerHTML = "";
  const response = await fetch("/getTasks");
  const tasks = await response.json();
  console.log(tasks);
  for (let task of tasks) {
    const div = document.createElement("div");
    div.dataset.taskid = task.id;
    div.setAttribute("id", task.id);
    div.classList.add("ISAK_HEAD"); // tuff klasse navn ivan - brun

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("task-name");
    nameSpan.textContent = task.name;

    const difficultySpan = document.createElement("span");
    difficultySpan.classList.add("task-difficulty");
    difficultySpan.textContent = "Vanskelighetsgrad " + task.difficulty;

    const descrSpan = document.createElement("span");
    descrSpan.classList.add("task-description");
    descrSpan.textContent = task.description;

    const creatorSpan = document.createElement("span");
    creatorSpan.classList.add("creator-name");
    creatorSpan.textContent = "Laget av: " + task.creatorUser;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "✖";
    deleteBtn.dataset.taskid = task.id;

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      slettOppgave(e);
    });

    const finishBtn = document.createElement("button");
    finishBtn.classList.add("finish-btn");
    finishBtn.textContent = "✓";
    finishBtn.dataset.taskid = task.id;

    finishBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      completeTask(e);
    });
    div.appendChild(finishBtn);
    div.appendChild(deleteBtn);
    div.appendChild(nameSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(creatorSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(descrSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(difficultySpan);
    utskrift.appendChild(div);
  }
}

async function displayPoints() {
  const response = await fetch("/getUserPoints");
  const kuledata = await response.json();
  for (let data of kuledata) {
    const dataDiv = document.createElement("div");
    const rankSpan = document.createElement("span");
    const pointSpan = document.createElement("span");

    rankSpan.textContent = "Rank: " + data.rank;
    pointSpan.textContent = "Poeng: " + data.points;
    dataDiv.appendChild(rankSpan);
    dataDiv.appendChild(pointSpan);
    pointsUtskrift.appendChild(dataDiv);
  }
}

// viser oppgavene som er ferdig
async function displayComletedTasks() {
  completedUtskrift.innerHTML = "";
  const response = await fetch("/getCompletedTasks");
  const tasks = await response.json();
  for (let task of tasks) {
    const div = document.createElement("div");
    div.dataset.taskid = task.id;
    div.setAttribute("id", task.id);

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("task-name");
    nameSpan.textContent = task.name;

    const difficultySpan = document.createElement("span");
    difficultySpan.classList.add("task-difficulty");
    difficultySpan.textContent = "Vanskelighetsgrad " + task.difficulty;

    const descrSpan = document.createElement("span");
    descrSpan.classList.add("task-description");
    descrSpan.textContent = task.description;

    const creatorSpan = document.createElement("span");
    creatorSpan.classList.add("creator-name");
    creatorSpan.textContent = "Laget av: " + task.creatorUser;

    div.appendChild(nameSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(creatorSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(descrSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(difficultySpan);
    completedUtskrift.appendChild(div);
  }
}

const skjema = document.getElementById("skjema");
const taskNameEl = document.getElementById("taskName");
const taskDescriptionEl = document.getElementById("taskDescription");

const nameSelect = document.getElementById("user-selection");
nameSelect.addEventListener("change", () => {
  return (currentName = nameSelect.options[nameSelect.selectedIndex].text);
});

skjema.addEventListener("submit", addTask);
let taskDifficulty = "1";
const difficultySelect = document.getElementById("difficultySelect");
difficultySelect.addEventListener("change", () => {
  return (taskDifficulty =
    difficultySelect.options[difficultySelect.selectedIndex].text);
});

async function addTask(e) {
  e.preventDefault();
  const taskName = taskNameEl.value.trim();
  const taskDescription = taskDescriptionEl.value.trim();
  console.log(currentName);
  console.log(taskDifficulty);
  const res = await fetch("/addTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskName,
      currentName,
      taskDescription,
      taskDifficulty,
    }),
  });
  displayTasks();
}

async function completeTask(e) {
  e.preventDefault();
  console.log("jeg har gjort denne oppgaven!");

  const completeTask = await fetch("/completeTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: e.target.dataset.taskid }),
  });
  displayTasks();
  addPoints();
}

//Sletter oppgave
async function slettOppgave(e) {
  console.log("sletter oppgave");
  const deleteTask = await fetch("/deleteTask", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: e.target.dataset.taskid }),
  });
  displayTasks();
}

async function addPoints(e) {
  console.log("legger til poeng");
  const username = currentName;
  console.log("brukernavn er", username);
  const addPoints = await fetch("/addPoints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskDifficulty, username }),
  });
}
displayTasks();
document.querySelectorAll(".ISAK_HEAD").forEach((el) => {
  el.addEventListener(
    "click",
    () => showPage("page-doing", 3),
    console.log("Task listened"),
  );
  console.log("applied listener");
});

// Tuff Ivan shit (No molestation or touching allowed)
const finished = document.getElementById("finished");
