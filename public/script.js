const socket = io("https://backend2-941b.onrender.com");

let nickname = "";
let currentLobbyId = "";

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
  gameArea.innerHTML = "<h2>Lobi: " + lobby.name + "</h2><p>Oyuncular:</p><ul>" +
    players.map(p => "<li>" + p.nickname + "</li>").join("") +
    "</ul><p>Lobi kodu: " + lobby.id + "</p>";
});