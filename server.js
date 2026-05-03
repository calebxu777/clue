import http from "node:http";
import { Server } from "socket.io";
import { buildDeck, createBoard, createSolution, getReachableDestinations, assignStartingPosition, nodeKey, randomInt } from "./shared/game-logic.js";
import { ROOM_BLUEPRINTS, SUSPECTS, WEAPONS } from "./shared/game-data.js";

const PORT = 3001;
const rooms = new Map();

const httpServer = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Clue Mansion socket server is running.");
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("room:create", ({ name, seed }, callback) => {
    const roomCode = createRoomCode();
    const room = createRoom(roomCode, Number(seed) || null);
    rooms.set(roomCode, room);
    const player = addPlayerToRoom(room, socket, name || "Host");
    socket.join(roomCode);
    emitRoom(room);
    callback?.({ ok: true, roomCode, playerId: player.id });
  });

  socket.on("room:join", ({ roomCode, name }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    if (!room) {
      callback?.({ ok: false, error: "Room not found." });
      return;
    }
    if (room.status !== "lobby") {
      callback?.({ ok: false, error: "Game already started." });
      return;
    }
    if (room.players.length >= 6) {
      callback?.({ ok: false, error: "Room is full." });
      return;
    }
    if (room.players.some((player) => player.name.toLowerCase() === String(name || "").trim().toLowerCase())) {
      callback?.({ ok: false, error: "Name already in use in this room." });
      return;
    }
    const player = addPlayerToRoom(room, socket, name || `Player ${room.players.length + 1}`);
    socket.join(room.code);
    emitRoom(room);
    callback?.({ ok: true, roomCode: room.code, playerId: player.id });
  });

  socket.on("room:start", ({ roomCode, playerId, seed }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const player = findPlayer(room, playerId);
    if (!room || !player || room.hostId !== player.id) {
      callback?.({ ok: false, error: "Only the host can start." });
      return;
    }
    if (room.players.length < 2) {
      callback?.({ ok: false, error: "At least 2 players are required." });
      return;
    }
    startMatch(room, Number(seed) || room.seed || Date.now());
    emitRoom(room);
    callback?.({ ok: true });
  });

  socket.on("room:sync", ({ roomCode, playerId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const player = findPlayer(room, playerId);
    if (!room || !player) {
      callback?.({ ok: false, error: "Unable to sync room session." });
      return;
    }
    player.socketId = socket.id;
    player.connected = true;
    socket.join(room.code);
    emitRoom(room);
    callback?.({ ok: true, state: buildClientState(room, playerId) });
  });

  socket.on("action:roll", ({ roomCode, playerId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const result = withCurrentPlayer(room, playerId, () => {
      if (room.pendingDisproof || room.match.winnerId) {
        return { ok: false, error: "Action unavailable." };
      }
      if (room.match.rollValue !== null) {
        return { ok: false, error: "Already rolled." };
      }
      const dieA = randomInt(Math.random, 1, 6);
      const total = dieA;
      room.match.diceFaces = [dieA];
      room.match.rollValue = total;
      room.match.movementRemaining = total;
      room.match.reachable = getReachableDestinations(room.match, currentPlayer(room), total);
      logEvent(room, `${currentPlayer(room).name} rolled ${total}.`);
      if (!room.match.reachable.length) {
        room.match.statusMessage = "No legal movement spaces from the current position.";
      } else {
        room.match.statusMessage = "Choose a glowing hallway or room destination.";
      }
      return { ok: true };
    });
    emitRoom(room);
    callback?.(result);
  });

  socket.on("action:move", ({ roomCode, playerId, destinationKey }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const result = withCurrentPlayer(room, playerId, () => {
      const destination = room.match.reachable.find((item) => nodeKey(item) === destinationKey);
      if (!destination) {
        return { ok: false, error: "Invalid destination." };
      }
      const player = currentPlayer(room);
      if (destination.kind === "room") {
        player.position = { type: "room", roomId: destination.roomId };
        room.match.statusMessage = `${player.name} entered ${room.match.board.rooms[destination.roomId].name}.`;
      } else {
        player.position = { type: "tile", x: destination.x, y: destination.y };
        room.match.statusMessage = `${player.name} moved ${destination.steps} steps.`;
      }
      room.match.movementRemaining = Math.max(0, room.match.rollValue - destination.steps);
      room.match.hasMovedThisTurn = true;
      room.match.reachable = [];
      logEvent(room, describePositionMove(room, player));
      return { ok: true };
    });
    emitRoom(room);
    callback?.(result);
  });

  socket.on("action:tunnel", ({ roomCode, playerId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const result = withCurrentPlayer(room, playerId, () => {
      const player = currentPlayer(room);
      if (player.position.type !== "room") {
        return { ok: false, error: "Not in a room." };
      }
      const roomState = room.match.board.rooms[player.position.roomId];
      if (!roomState.tunnelTo) {
        return { ok: false, error: "No tunnel here." };
      }
      player.position = { type: "room", roomId: roomState.tunnelTo };
      room.match.hasMovedThisTurn = true;
      room.match.rollValue = room.match.rollValue ?? 0;
      room.match.movementRemaining = 0;
      room.match.reachable = [];
      room.match.statusMessage = `${player.name} used a secret tunnel.`;
      logEvent(room, `${player.name} uses the secret tunnel from ${roomState.name} to ${room.match.board.rooms[roomState.tunnelTo].name}.`);
      return { ok: true };
    });
    emitRoom(room);
    callback?.(result);
  });

  socket.on("action:suggest", ({ roomCode, playerId, suspectId, weaponId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const result = withCurrentPlayer(room, playerId, () => {
      const player = currentPlayer(room);
      if (player.position.type !== "room") {
        return { ok: false, error: "You must be in a room." };
      }
      if (room.pendingDisproof) {
        return { ok: false, error: "Waiting for disproval." };
      }

      const roomId = player.position.roomId;
      const roomState = room.match.board.rooms[roomId];
      room.match.hasSuggestedThisTurn = true;
      room.match.roomWeapons[roomId] = weaponId;
      const namedPlayer = room.players.find((candidate) => candidate.suspectId === suspectId);
      if (namedPlayer) {
        namedPlayer.position = { type: "room", roomId };
      }
      logEvent(room, `${player.name} suggests ${findName(SUSPECTS, suspectId)} with the ${findName(room.match.weapons, weaponId)} in the ${roomState.name}.`);
      room.pendingDisproof = prepareDisproval(room, player.id, suspectId, weaponId, roomId);
      if (room.pendingDisproof) {
        room.match.statusMessage = `${room.pendingDisproof.playerName} may disprove the theory.`;
      } else {
        room.match.statusMessage = "Nobody could disprove that theory.";
        logEvent(room, "Nobody could disprove the theory.");
      }
      return { ok: true };
    });
    emitRoom(room);
    callback?.(result);
  });

  socket.on("action:disprove", ({ roomCode, playerId, cardId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    if (!room || !room.pendingDisproof || room.pendingDisproof.playerId !== playerId) {
      callback?.({ ok: false, error: "No disproval pending for you." });
      return;
    }
    const chosen = room.pendingDisproof.options.find((card) => card.id === cardId);
    if (!chosen) {
      callback?.({ ok: false, error: "Invalid card choice." });
      return;
    }
    room.match.lastReveal = {
      suggesterId: room.pendingDisproof.suggesterId,
      disproverId: playerId,
      disproverName: room.pendingDisproof.playerName,
      card: chosen,
    };
    const suggester = findPlayer(room, room.pendingDisproof.suggesterId);
    if (suggester) {
      suggester.note = `${room.pendingDisproof.playerName} showed you ${chosen.name}.`;
    }
    logEvent(room, `${room.pendingDisproof.playerName} disproved the theory.`);
    room.match.statusMessage = `${room.pendingDisproof.playerName} disproved the theory.`;
    room.pendingDisproof = null;
    emitRoom(room);
    callback?.({ ok: true });
  });

  socket.on("action:accuse", ({ roomCode, playerId, suspectId, weaponId, roomId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const result = withCurrentPlayer(room, playerId, () => {
      const player = currentPlayer(room);
      logEvent(room, `${player.name} accuses ${findName(SUSPECTS, suspectId)} with the ${findName(room.match.weapons, weaponId)} in the ${findName(ROOM_BLUEPRINTS, roomId)}.`);
      if (
        suspectId === room.match.solution.suspect &&
        weaponId === room.match.solution.weapon &&
        roomId === room.match.solution.room
      ) {
        room.match.winnerId = player.id;
        room.match.statusMessage = `${player.name} solved the mystery.`;
        logEvent(room, `${player.name} wins the match.`);
      } else {
        player.eliminated = true;
        room.match.statusMessage = `${player.name} made the wrong accusation and is out.`;
        logEvent(room, `${player.name} is eliminated but may still disprove suggestions.`);
        const remaining = room.players.filter((candidate) => !candidate.eliminated);
        if (remaining.length === 0) {
          room.match.winnerId = "nobody";
          room.match.statusMessage = "Every detective has been eliminated. Nobody wins.";
          logEvent(room, "Every detective has been eliminated.");
        } else if (remaining.length === 1) {
          room.match.winnerId = remaining[0].id;
          room.match.statusMessage = `${remaining[0].name} wins — the last detective standing!`;
          logEvent(room, `${remaining[0].name} wins the match as the last detective standing.`);
        } else {
          advanceTurn(room);
        }
      }
      return { ok: true };
    });
    emitRoom(room);
    callback?.(result);
  });

  socket.on("action:endTurn", ({ roomCode, playerId }, callback) => {
    const room = rooms.get(normalizeRoomCode(roomCode));
    const result = withCurrentPlayer(room, playerId, () => {
      advanceTurn(room);
      return { ok: true };
    });
    emitRoom(room);
    callback?.(result);
  });

  socket.on("disconnect", () => {
    for (const room of rooms.values()) {
      const player = room.players.find((candidate) => candidate.socketId === socket.id);
      if (!player) {
        continue;
      }
      player.connected = false;
      emitRoom(room);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});

function createRoom(code, seed) {
  return {
    code,
    seed,
    hostId: null,
    players: [],
    status: "lobby",
    pendingDisproof: null,
    match: null,
  };
}

function addPlayerToRoom(room, socket, name) {
  const suspect = SUSPECTS[room.players.length];
  const player = {
    id: socket.id,
    socketId: socket.id,
    name,
    suspectId: suspect.id,
    hand: [],
    eliminated: false,
    connected: true,
    position: null,
    note: "",
  };
  room.players.push(player);
  if (!room.hostId) {
    room.hostId = player.id;
  }
  return player;
}

function startMatch(room, seed) {
  const board = createBoard(seed);
  const solution = createSolution(seed);
  const deck = buildDeck(solution, seed);

  room.players.forEach((player) => {
    player.hand = [];
    player.eliminated = false;
    player.note = "";
    assignStartingPosition(player, board);
  });

  deck.forEach((card, index) => {
    room.players[index % room.players.length].hand.push(card);
  });

  room.match = {
    seed,
    board,
    solution,
    weapons: WEAPONS,
    players: room.players,
    turnIndex: 0,
    rollValue: null,
    movementRemaining: 0,
    reachable: [],
    hasMovedThisTurn: false,
    hasSuggestedThisTurn: false,
    winnerId: null,
    roomWeapons: {},
    lastReveal: null,
    diceFaces: [1, 1],
    statusMessage: "Throw the dice to start the turn.",
    log: [],
  };
  room.pendingDisproof = null;
  room.status = "active";
  logEvent(room, `Case opened with seed ${seed}.`);
  room.players.forEach((player) => {
    logEvent(room, `${player.name} takes the role of ${findName(SUSPECTS, player.suspectId)}.`);
  });
}

function advanceTurn(room) {
  if (!room.match || room.match.winnerId) {
    return;
  }
  let nextIndex = room.match.turnIndex;
  for (let tries = 0; tries < room.players.length; tries += 1) {
    nextIndex = (nextIndex + 1) % room.players.length;
    if (!room.players[nextIndex].eliminated) {
      break;
    }
  }
  room.match.turnIndex = nextIndex;
  room.match.rollValue = null;
  room.match.movementRemaining = 0;
  room.match.reachable = [];
  room.match.hasMovedThisTurn = false;
  room.match.hasSuggestedThisTurn = false;
  room.match.lastReveal = null;
  room.pendingDisproof = null;
  room.players.forEach((player, index) => {
    if (index !== nextIndex) {
      player.note = "";
    }
  });
  room.match.statusMessage = "Throw the dice to begin the next turn.";
}

function withCurrentPlayer(room, playerId, fn) {
  if (!room || room.status !== "active" || !room.match) {
    return { ok: false, error: "No active match." };
  }
  if (currentPlayer(room)?.id !== playerId) {
    return { ok: false, error: "Not your turn." };
  }
  return fn();
}

function currentPlayer(room) {
  return room?.players?.[room.match.turnIndex] ?? null;
}

function prepareDisproval(room, suggesterId, suspectId, weaponId, roomId) {
  const playerIndex = room.players.findIndex((player) => player.id === suggesterId);
  const candidateIds = new Set([suspectId, weaponId, roomId]);
  for (let step = 1; step < room.players.length; step += 1) {
    const player = room.players[(playerIndex + step) % room.players.length];
    const options = player.hand.filter((card) => candidateIds.has(card.id));
    if (options.length) {
      return {
        suggesterId,
        playerId: player.id,
        playerName: player.name,
        options,
      };
    }
  }
  return null;
}

function emitRoom(room) {
  if (!room) {
    return;
  }
  room.players.forEach((player) => {
    io.to(player.socketId).emit("state:update", buildClientState(room, player.id));
  });
}

function buildClientState(room, playerId) {
  const self = findPlayer(room, playerId);
  const publicPlayers = room.players.map((player, index) => ({
    id: player.id,
    name: player.name,
    suspectId: player.suspectId,
    eliminated: player.eliminated,
    connected: player.connected,
    position: player.position,
    isCurrentTurn: room.match ? index === room.match.turnIndex : false,
  }));

  return {
    roomCode: room.code,
    roomStatus: room.status,
    hostId: room.hostId,
    self: self ? {
      id: self.id,
      name: self.name,
      suspectId: self.suspectId,
      hand: self.hand,
      note: self.note,
      eliminated: self.eliminated,
      connected: self.connected,
      position: self.position,
    } : null,
    lobby: room.status === "lobby" ? {
      players: publicPlayers,
      canStart: room.players.length >= 2,
    } : null,
    match: room.match ? {
      seed: room.match.seed,
      board: room.match.board,
      players: publicPlayers,
      turnIndex: room.match.turnIndex,
      currentPlayerId: currentPlayer(room)?.id ?? null,
      rollValue: room.match.rollValue,
      movementRemaining: room.match.movementRemaining,
      reachable: currentPlayer(room)?.id === playerId ? room.match.reachable : [],
      hasSuggestedThisTurn: room.match.hasSuggestedThisTurn,
      winnerId: room.match.winnerId,
      roomWeapons: room.match.roomWeapons,
      lastReveal: room.match.lastReveal && room.match.lastReveal.suggesterId === playerId ? room.match.lastReveal : null,
      diceFaces: room.match.diceFaces,
      statusMessage: room.match.statusMessage,
      log: room.match.log,
    } : null,
    pendingDisproof: room.pendingDisproof ? {
      isForSelf: room.pendingDisproof.playerId === playerId,
      options: room.pendingDisproof.playerId === playerId ? room.pendingDisproof.options : [],
      playerName: room.pendingDisproof.playerName,
    } : null,
  };
}

function findPlayer(room, playerId) {
  return room?.players?.find((player) => player.id === playerId) ?? null;
}

function findName(items, id) {
  return items.find((item) => item.id === id)?.name ?? id;
}

function describePositionMove(room, player) {
  if (player.position.type === "room") {
    return `${player.name} entered ${room.match.board.rooms[player.position.roomId].name}.`;
  }
  return `${player.name} moved to hallway ${player.position.x}, ${player.position.y}.`;
}

function logEvent(room, text) {
  room.match?.log.push(text);
}

function createRoomCode() {
  let code = "";
  do {
    code = Math.random().toString(36).slice(2, 6).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function normalizeRoomCode(code) {
  return String(code || "").trim().toUpperCase();
}
