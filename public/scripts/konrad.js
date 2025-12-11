const buttons = document.querySelectorAll(".buttonslayout button");
const pages = document.querySelectorAll(".page");

let currentName = "";

const nameSelect = document.getElementById("user-selection");
nameSelect.addEventListener("change", () => {
  return (currentName = nameSelect.options[nameSelect.selectedIndex].text);
});

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
buttons[0].addEventListener("click", () => showPage("page-leaderboard", 0),leaderboard());
buttons[1].addEventListener("click", () => showPage("page-tasks", 1));
buttons[2].addEventListener("click", () => {
  showPage("page-home", 2);
  displayComletedTasks();
  displayPoints();
});

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
    div.appendChild(descrSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(creatorSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(difficultySpan);
    utskrift.appendChild(div);
  }
}

async function displayPoints() {
  const response = await fetch("/getUserPoints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: currentName })
  });

  const kuledata = await response.json();

  const dataDiv = document.createElement("div");
  // const rankSpan = document.createElement("span");
  const pointSpan = document.createElement("span");
  // rankSpan.textContent = "Rank: " + kuledata.rank;
  pointSpan.textContent = "Poeng: " + kuledata.points;

  // dataDiv.appendChild(rankSpan);
    pointsUtskrift.innerHTML = "";
  dataDiv.appendChild(pointSpan);
  pointsUtskrift.appendChild(dataDiv);

}


// viser oppgavene som er ferdig
async function displayComletedTasks() {
  completedUtskrift.innerHTML = "";
  console.log("hei, jeg heter displayComletedTasks() og currentName er", currentName)
  const response = await fetch("/getCompletedTasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( { username: currentName } ),
  });

  const tasks = await response.json();
  console.log("comTask", tasks);

  for (let task of tasks) {
    const div = document.createElement("div");
    div.dataset.taskid = task.id;
    div.setAttribute("id", task.id);

    const date = document.createElement("span")
    date.classList.add("taskDate")
    date.textContent = task.completed

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
    div.appendChild(descrSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(creatorSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(difficultySpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(date);
    completedUtskrift.appendChild(div);
  }
}

const skjema = document.getElementById("skjema");
const taskNameEl = document.getElementById("taskName");
const taskDescriptionEl = document.getElementById("taskDescription");

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
    body: JSON.stringify({ id: e.target.dataset.taskid, currentName }),
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
};

displayTasks();


async function leaderboard() {
  const response = await fetch("/getUsers");
  const users = await response.json();
  const leaderboard = document.getElementById("leaderboard");
  for (const user of users) {
    const userPlacement = document.createElement('div');
    userPlacement.classList.add("leaderboard-user");
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("leaderboard-username");
    usernameSpan.textContent = user.username;
    const pointSpan = document.createElement("span");
    pointSpan.classList.add("leaderboard-points");
    pointSpan.textContent = ": " + user.points + " poeng";
    const userCompleted = document.createElement('div');
    userCompleted.classList.add("leaderboard-tasks");
    await displayAllCompletedTasks(userCompleted, user);
    userPlacement.appendChild(usernameSpan);
    userPlacement.appendChild(pointSpan);
    userPlacement.appendChild(userCompleted);
    leaderboard.appendChild(userPlacement);
  }
}
async function displayAllCompletedTasks(userCompleted, user) {
  const username = user.username;
  const response = await fetch("/getAllCompletedTasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const tasks = await response.json();
  tasks.forEach(task => {
    const div = document.createElement("div");
    div.classList.add("leaderboard-task");
    div.dataset.taskid = task.id;
    const nameSpan = document.createElement("span");
    nameSpan.classList.add("leaderboard-task-name");
    nameSpan.textContent = task.name;
    const difficultySpan = document.createElement("span");
    difficultySpan.classList.add("leaderboard-task-difficulty");
    difficultySpan.textContent = "Vanskelighetsgrad " + task.difficulty;
    const descrSpan = document.createElement("span");
    descrSpan.classList.add("leaderboard-task-description");
    descrSpan.textContent = task.description;
    const creatorSpan = document.createElement("span");
    creatorSpan.classList.add("leaderboard-task-creator");
    creatorSpan.textContent = "Laget av: " + task.creatorUser;
    div.appendChild(nameSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(descrSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(creatorSpan);
    div.appendChild(document.createElement("br"));
    div.appendChild(difficultySpan);
    userCompleted.appendChild(div);
  });
}
