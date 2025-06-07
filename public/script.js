const socket = io("https://backend2-941b.onrender.com");

let nickname = "";
let currentLobbyId = "";
let mySocketId = "";

socket.on("connect", () => {
  mySocketId = socket.id;
});

function continueToLobbyOptions() {
  nickname = document.getElementById("nickname").value;
  if (!nickname) return;
  document.getElementById("login").style.display = "none";
  document.getElementById("lobbyOptions").style.display = "block";
}

function createLobby() {
  const lobbyName = document.getElementById("lobbyName").value;
  if (!lobbyName) return;
  socket.emit("createLobby", { lobbyName, nickname });
}

function showLobbyList() {
  socket.emit("getLobbies");
}

socket.on("lobbyList", (lobbies) => {
  const list = document.getElementById("lobbyList");
  list.innerHTML = "<h3>Mevcut Lobiler:</h3>";
  lobbies.forEach((lobby) => {
    const btn = document.createElement("button");
    btn.innerText = lobby.name;
    btn.onclick = () => {
      socket.emit("joinLobby", { lobbyId: lobby.id, nickname });
    };
    list.appendChild(btn);
  });
  list.style.display = "block";
});

socket.on("lobbyJoined", ({ lobby, players }) => {
  currentLobbyId = lobby.id;
  document.getElementById("lobbyOptions").style.display = "none";
  document.getElementById("lobbyList").style.display = "none";
  const gameArea = document.getElementById("gameArea");
  gameArea.style.display = "block";

  let html = "<h2>Lobi: " + lobby.name + "</h2><div style='display:flex; flex-wrap:wrap; gap:10px'>";
  players.forEach(p => {
    if (p.empty) {
      html += "<div style='text-align:center'><img src='avatars/Empty.png' width='60'><p>Boş</p></div>";
    } else {
      html += "<div style='text-align:center'><img src='avatars/" + p.avatar + "' width='60'><p>" + p.nickname + "</p></div>";
    }
  });
  html += "</div>";

  if (mySocketId === lobby.ownerId) {
    html += "<br><button onclick='startGame()'>Oyunu Başlat</button>";
  }

  gameArea.innerHTML = html;
});

function startGame() {
  if (!currentLobbyId) return;
  socket.emit("startGame", { lobbyId: currentLobbyId });
}