// server.js güncel - defensePhase eklendi

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let lobbies = {};

io.on("connection", (socket) => {
  socket.on("createLobby", ({ nickname, lobbyName }) => {
    const code = lobbyName;
    lobbies[code] = {
      name: code,
      players: [
        {
          id: socket.id,
          nickname,
          avatar: `Avatar${Math.floor(Math.random() * 20 + 1)}.png`,
          role: null,
          isAlive: true
        }
      ],
      phase: "day"
    };
    socket.join(code);
    io.to(socket.id).emit("lobbyJoined", { lobby: lobbies[code], players: lobbies[code].players });
  });

  socket.on("joinLobby", ({ nickname, lobbyCode }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return;
    if (lobby.players.length >= 20) return;
    const avatarNumbers = lobby.players.map(p => p.avatar.match(/\d+/)[0]);
    let avatarNum;
    for (let i = 1; i <= 20; i++) {
      if (!avatarNumbers.includes(i.toString())) {
        avatarNum = i;
        break;
      }
    }
    const player = {
      id: socket.id,
      nickname,
      avatar: avatarNum ? `Avatar${avatarNum}.png` : "Avatar1.png",
      role: null,
      isAlive: true
    };
    lobby.players.push(player);
    socket.join(lobbyCode);
    io.to(socket.id).emit("lobbyJoined", { lobby, players: lobby.players });
    io.to(lobbyCode).emit("playerJoined", lobby.players);
  });

  socket.on("startGame", ({ lobbyCode }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return;
    const shuffled = [...lobby.players].sort(() => Math.random() - 0.5);
    shuffled[0].role = "Gulyabani";
    for (let i = 1; i < shuffled.length; i++) {
      shuffled[i].role = "Vatandaş";
    }
    io.to(lobbyCode).emit("gameStarted", shuffled);
  });

  socket.on("startNight", ({ lobbyCode }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return;
    const targets = lobby.players.filter(p => p.role !== "Gulyabani" && p.isAlive);
    io.to(socket.id).emit("chooseVictim", targets);
  });

  socket.on("attack", ({ lobbyCode, targetId }) => {
    const lobby = lobbies[lobbyCode];
    const target = lobby.players.find(p => p.id === targetId);
    if (!target || !target.isAlive) return;
    target.isAlive = false;
    io.to(lobbyCode).emit("playerDied", { playerId: targetId });

    const villagersAlive = lobby.players.filter(p => p.role === "Vatandaş" && p.isAlive);
    const gulyabaniAlive = lobby.players.filter(p => p.role === "Gulyabani" && p.isAlive);
    if (villagersAlive.length === 0) {
      io.to(lobbyCode).emit("gameOver", { winner: "Hortlaklar Kazandı!" });
    } else if (gulyabaniAlive.length === 0) {
      io.to(lobbyCode).emit("gameOver", { winner: "Köylüler Kazandı!" });
    }
  });

  socket.on("changePhase", ({ lobbyCode, phase }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return;
    lobby.phase = phase;
    io.to(lobbyCode).emit("phaseChanged", { phase });
  });

  socket.on("finalVote", ({ lobbyCode, accusedId, vote }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby.finalVotes) lobby.finalVotes = {};
    if (!lobby.voteCount) lobby.voteCount = 0;
    if (!lobby.accusedId) lobby.accusedId = accusedId;
    lobby.finalVotes[socket.id] = vote;
    lobby.voteCount++;
    if (lobby.voteCount >= lobby.players.filter(p => p.isAlive).length) {
      const results = Object.values(lobby.finalVotes);
      const guiltyCount = results.filter(r => r === "guilty").length;
      const innocentCount = results.filter(r => r === "innocent").length;
      const result = guiltyCount > innocentCount ? "guilty" : "innocent";
      if (result === "guilty") {
        const target = lobby.players.find(p => p.id === lobby.accusedId);
        if (target) target.isAlive = false;
        io.to(lobbyCode).emit("playerDied", { playerId: lobby.accusedId });
      }
      io.to(lobbyCode).emit("finalVoteResult", { accusedId: lobby.accusedId, result });
      delete lobby.finalVotes;
      delete lobby.voteCount;
      delete lobby.accusedId;
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Sunucu çalışıyor");
});
