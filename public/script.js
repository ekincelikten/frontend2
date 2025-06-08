const socket = io();

// Nickname girişinden sonra...
function continueToLobbyOptions() {
  document.getElementById("nicknameInput").style.display = "none";
  document.getElementById("lobbyOptions").style.display = "block";
}

// 'yourRole' eventini yakala ve oyuncuya rolünü göster
socket.on("yourRole", ({ role }) => {
  const roleDisplay = document.createElement("div");
  roleDisplay.innerText = `Rolünüz: ${role}`;
  roleDisplay.style.position = "absolute";
  roleDisplay.style.top = "10px";
  roleDisplay.style.right = "10px";
  roleDisplay.style.backgroundColor = "#fff";
  roleDisplay.style.padding = "10px";
  roleDisplay.style.border = "1px solid black";
  document.body.appendChild(roleDisplay);
});
