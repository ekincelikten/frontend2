let nickname = "";
const socket = io("https://hortlakli-koy-backend.onrender.com"); // doğru backend adresi

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



let currentLobbyCode = "";
let myPlayerId = "";
let myRole = "";
let selectedTargetId = "";

// Lobiye katılınca bilgileri al
socket.on("lobbyJoined", ({ lobbyCode, player }) => {
  currentLobbyCode = lobbyCode;
  myPlayerId = player.id;
});

// Oyun başlayınca roller geliyor
socket.on("roleAssigned", (role) => {
  myRole = role;
  console.log("Rolünüz:", role);
});

// Gündüz fazı başlangıcı
socket.on("phaseChanged", ({ phase }) => {
  if (phase === "day") {
    console.log("Gündüz başladı");
    enableVoting();
  } else if (phase === "night") {
    console.log("Gece başladı");
  }
});

// Oylama (avatar tıklamasıyla)
function enableVoting() {
  const avatars = document.querySelectorAll(".avatar");
  avatars.forEach((avatar) => {
    avatar.onclick = () => {
      const targetId = avatar.dataset.playerId;
      if (!targetId || targetId === myPlayerId) return;
      socket.emit("vote", { lobbyCode: currentLobbyCode, targetId });
    };
  });
}

// Savunma fazı başladıysa hedef oyuncuya 10 saniye savunma süresi tanınır
socket.on("defensePhase", ({ targetId }) => {
  selectedTargetId = targetId;
  if (myPlayerId === targetId) {
    alert("Savunma yapma süren başladı!");
  }
  setTimeout(() => {
    const isGuilty = confirm("Bu oyuncuyu suçlu buluyor musun?");
    socket.emit("finalVote", {
      lobbyCode: currentLobbyCode,
      targetId: selectedTargetId,
      vote: isGuilty,
    });
  }, 10000);
});

// Gece Gulyabani seçim ekranı
socket.on("chooseVictim", (players) => {
  if (myRole !== "Gulyabani") return;
  players.forEach((p) => {
    const avatarEl = document.querySelector(`.avatar[data-player-id='${p.id}']`);
    if (avatarEl) {
      avatarEl.onclick = () => {
        socket.emit("attack", { lobbyCode: currentLobbyCode, targetId: p.id });
      };
    }
  });
});

// Oyuncu öldü: avatarı değiştir
socket.on("playerDied", ({ avatar }) => {
  const avatarEl = document.querySelector(`img[src$='${avatar}']`);
  if (avatarEl) {
    avatarEl.src = "Dead.png";
  }
});

// Öldürüldü ekranı
socket.on("killed", ({ reason }) => {
  alert(reason);
});

// Oyun bitti
socket.on("gameOver", ({ winner }) => {
  alert(winner + " kazandı!");
});



// Savunma ekranı oyuncu bilgisiyle
socket.on("defensePhase", ({ targetId, nickname, avatar }) => {
  selectedTargetId = targetId;

  const container = document.getElementById("defenseInfo");
  if (container) {
    container.innerHTML = `
      <h2>Şüpheli Oyuncu: ${nickname}</h2>
      <img src="/avatars/${avatar}" alt="avatar" style="width:150px;border:3px solid red;border-radius:20px">
      <p>10 saniye içinde savunmasını yapıyor...</p>
    `;
    container.style.display = "block";
  }

  setTimeout(() => {
    if (!finalVoted) {
      const isGuilty = confirm(`${nickname} suçlu mu?`);
      socket.emit("finalVote", {
        lobbyCode: currentLobbyCode,
        targetId: selectedTargetId,
        vote: isGuilty,
      });
      finalVoted = true;
    }
    if (container) container.style.display = "none";
  }, 10000);
});

// Oyuncu sadece bir kez final oyu verebilir
let finalVoted = false;

// Oyun sonu bildirimi
socket.on("gameOver", ({ winner }) => {
  alert(winner + " oyunu kazandı!");
  const banner = document.createElement("div");
  banner.innerText = winner + " KAZANDI!";
  banner.style = "position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);font-size:3em;background:white;padding:20px;border:4px solid black;";
  document.body.appendChild(banner);
});
