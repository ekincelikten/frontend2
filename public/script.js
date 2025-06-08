let nickname = "";

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

// Diğer tüm socket.io ve oyun etkileşim kodları buraya eklenir...