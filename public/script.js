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
  socket.on("lobbyJoined", ({ lobby, players }) => {
  console.log("Lobiye katıldın:", lobby);
  // Burada oyuncu listesini ve lobby bilgilerini ekrana bastırabilirsin
  alert(`Lobiye katıldınız: ${lobby.name}`);
});

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
