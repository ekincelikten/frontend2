let nickname = "";
const socket = io("https://hortlakli-koy-backend.onrender.com");

function continueToLobbyOptions() {
  const nicknameInput = document.getElementById("nickname").value;
  if (!nicknameInput) {
    alert("Lütfen bir nick girin.");
    return;
  }
  nickname = nicknameInput;
  document.getElementById("login").style.display = "none";
  document.getElementById("lobbyOptions").style.display = "block";
}

function createLobby() {
  const lobbyName = document.getElementById("lobbyName").value;
  if (!lobbyName) {
    alert("Lobi ismi girmelisin!");
    return;
  }

  socket.emit("createLobby", {
    lobbyName,
    nickname
  });
}

function fetchLobbies() {
  socket.emit("getLobbies");
}

socket.on("lobbyList", (lobbies) => {
  const container = document.getElementById("lobbyListContainer");
  container.innerHTML = "";
  lobbies.forEach((lobby) => {
    const card = document.createElement("div");
    card.className = "lobby-card";
    card.innerText = lobby.name;
    card.onclick = () => {
      socket.emit("joinLobby", {
        lobbyId: lobby.id,
        nickname
      });
    };
    container.appendChild(card);
  });
});

socket.on("lobbyJoined", ({ lobby, players }) => {
  document.getElementById("lobbyOptions").style.display = "none";
  document.getElementById("lobbyRoom").style.display = "block";
  document.getElementById("lobbyTitle").innerText = `Lobi: ${lobby.name}`;

  const playerContainer = document.getElementById("players");
  playerContainer.innerHTML = "";
  players.forEach((player, index) => {
    const img = document.createElement("img");
    if (player.empty) {
      img.src = "avatars/Empty.png";
    } else {
      img.src = "avatars/" + player.avatar;
      img.title = player.nickname;
    }
    img.className = "avatar";
    playerContainer.appendChild(img);
  });
});