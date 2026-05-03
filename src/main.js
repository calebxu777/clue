import { io } from "socket.io-client";
import "./styles.css";
import { ROOM_BLUEPRINTS, SUSPECTS, WEAPONS } from "../shared/game-data.js";
import { nodeKey } from "../shared/game-logic.js";

const socket = io("http://localhost:3001", { autoConnect: true });
const storageKey = "clue-mansion-session";
const savedSession = readSavedSession();

const state = {
  playerId: savedSession.playerId,
  roomCode: new URLSearchParams(window.location.search).get("room")?.toUpperCase() ?? "",
  server: null,
  createName: "Host",
  joinName: "",
  joinCode: new URLSearchParams(window.location.search).get("room")?.toUpperCase() ?? "",
  seed: "",
  notice: "Create a room or join one with a room code.",
  busy: false,
  revealHand: true,
  suggestOpen: false,
  accuseOpen: false,
  clientError: "",
  notebookState: readSavedNotebook(savedSession.roomCode, savedSession.playerId),
  panelOpen: { investigators: true, notes: true },
  showDice: false,
  isRolling: false,
};

const app = document.querySelector("#app");

window.addEventListener("message", handleNotebookMessage);

socket.on("state:update", (payload) => {
  const previousRoomCode = state.roomCode;
  const previousPlayerId = state.playerId;
  const previousMatchSeed = state.server?.match?.seed;
  state.server = payload;
  state.roomCode = payload.roomCode;
  state.joinCode = payload.roomCode;
  if (!state.playerId && payload.self?.id) {
    state.playerId = payload.self.id;
  }
  if (
    payload.self?.id &&
    (payload.roomCode !== previousRoomCode || payload.self.id !== previousPlayerId || payload.match?.seed !== previousMatchSeed)
  ) {
    state.notebookState = readSavedNotebook(payload.roomCode, payload.self.id, payload.match?.seed);
  }
  state.notice = payload.match?.statusMessage || state.notice;
  persistSession();
  history.replaceState(null, "", payload.roomCode ? `?room=${payload.roomCode}` : window.location.pathname);
  render();
});

socket.on("connect", async () => {
  if (state.playerId && state.roomCode) {
    await syncRoomState();
  }
});

socket.on("connect_error", () => {
  state.notice = "Unable to reach the game server. Start `npm run dev` and refresh.";
  render();
});

render();

function render() {
  const showHero = !state.server;
  app.innerHTML = `
    <div class="game-shell">
      <div class="background-fog"></div>
      ${showHero ? `
      <header class="hero-banner">
        <div class="hero-copy">
          <p class="eyebrow">Realtime Multiplayer Mystery</p>
          <h1>Clue Mansion</h1>
          <p class="lead">
            Each browser is now a private player seat. Hidden hands stay hidden, disprovals are chosen by the actual holder, and the server owns the rules.
          </p>
        </div>
        <div class="hero-collage">
          <div class="hero-suspects"></div>
          <div class="hero-weapons"></div>
        </div>
      </header>
      ` : ""}

      ${state.server ? renderSession() : renderEntry()}
    </div>

    ${renderSuggestDialog()}
    ${renderAccuseDialog()}
  `;

  bindEvents();
}

function renderEntry() {
  return `
    <main class="main-layout">
      <section class="stage-card">
        <div class="entry-grid">
          <section class="entry-card">
            <p class="eyebrow">Create Room</p>
            <h2>Host a Match</h2>
            <label class="control">
              <span>Your name</span>
              <input id="create-name" value="${escapeAttr(state.createName)}" maxlength="24" />
            </label>
            <label class="control">
              <span>Board seed</span>
              <input id="seed-input" value="${escapeAttr(state.seed)}" placeholder="Random if blank" />
            </label>
            <button id="create-room" class="action-button action-button--primary" ${state.busy ? "disabled" : ""}>Create Room</button>
          </section>

          <section class="entry-card">
            <p class="eyebrow">Join Room</p>
            <h2>Enter a Live Session</h2>
            <label class="control">
              <span>Your name</span>
              <input id="join-name" value="${escapeAttr(state.joinName)}" maxlength="24" />
            </label>
            <label class="control">
              <span>Room code</span>
              <input id="join-code" value="${escapeAttr(state.joinCode)}" maxlength="8" />
            </label>
            <button id="join-room" class="action-button" ${state.busy ? "disabled" : ""}>Join Room</button>
          </section>
        </div>
        <p class="notice">${state.notice}</p>
      </section>
    </main>
  `;
}

function renderSession() {
  if (state.server.match) {
    return renderMatch();
  }
  if (state.server.roomStatus === "lobby") {
    return renderLobby();
  }
  return renderMatch();
}

function renderLobby() {
  const isHost = state.server.hostId === state.playerId;
  return `
    <main class="main-layout">
      <section class="stage-card">
        <div class="lobby-head">
          <div>
            <p class="eyebrow">Lobby</p>
            <h2>Room ${state.server.roomCode}</h2>
            <p class="lead slim">${state.notice}</p>
          </div>
          <div class="room-pill">Share code: <strong>${state.server.roomCode}</strong></div>
        </div>
        <div class="lobby-grid">
          <section class="side-card">
            <h3>Players</h3>
            <div class="players-panel">
              ${state.server.lobby.players.map((player) => `
                <article class="investigator ${player.id === state.playerId ? "investigator--active" : ""}">
                  <div class="investigator-token" style="${chessPieceStyle(getSuspect(player.suspectId))}"></div>
                  <div>
                    <strong>${player.name}</strong>
                    <small>${getSuspect(player.suspectId).name}</small>
                  </div>
                </article>
              `).join("")}
            </div>
          </section>
          <section class="side-card">
            <h3>Ready to Begin</h3>
            <p class="lead slim">Minimum 2 players, maximum 6 players. Suspects are assigned in join order for now.</p>
            ${isHost ? `<button id="start-room" class="action-button action-button--primary" ${state.server.lobby.canStart ? "" : "disabled"}>Start Match</button>` : `<p class="notice">Waiting for the host to start the game.</p>`}
          </section>
        </div>
      </section>
    </main>
  `;
}

function renderMatch() {
  const { self, match, pendingDisproof } = state.server;
  const currentPlayer = match.players[match.turnIndex];
  const currentRoom = self && selfPositionIsRoom() ? match.board.rooms[selfPosition().roomId] : null;
  const isMyTurn = match.currentPlayerId === self?.id;

  const diceTotal = (match.diceFaces?.[0] ?? 0) + (match.diceFaces?.[1] ?? 0);
  const hasRolled = match.rollValue !== null;

  return `
    <main class="main-layout">
      ${match.winnerId ? renderVictoryBanner(match) : ""}
      <div class="top-hud">
        <div class="turn-banner turn-banner--full">
          <div class="turn-banner-left">
            <p class="eyebrow">Current Turn</p>
            <h2>${match.winnerId ? renderWinnerTitle() : `${currentPlayer.name} as ${getSuspect(currentPlayer.suspectId).name}`}</h2>
          </div>
          <div class="turn-banner-right">
            <p class="status-text">${state.notice}</p>
            <div class="active-prompt">
              <span class="prompt-chip">${match.winnerId ? state.notice : pendingDisproof?.isForSelf ? "Choose one card to reveal." : pendingDisproof ? `Waiting on ${pendingDisproof.playerName} to choose a disproval card.` : isMyTurn ? "Your browser is the active seat." : `Waiting for ${currentPlayer.name}.`}</span>
            </div>
            <div class="turn-meta">
              <span>Room <strong>${state.server.roomCode}</strong></span>
              <span>Location <strong>${describePosition(self?.position, match.board)}</strong></span>
              ${hasRolled ? `<span>Moves left <strong>${match.movementRemaining}</strong></span>` : ""}
            </div>
          </div>
        </div>
      </div>

      <div class="play-layout">
        <section class="board-panel">
          <div class="board-scroll-container">
            <div class="board-frame">
              <div class="board-grid" id="board">${renderBoard()}</div>
            </div>
          </div>
          <div class="board-legend">
            <span><i class="swatch swatch--hallway"></i>Hallway</span>
            <span><i class="swatch swatch--door"></i>Door</span>
            <span><i class="swatch swatch--reach"></i>Reachable</span>
            <span><i class="swatch swatch--tunnel"></i>Tunnel Room</span>
            <span><i class="swatch swatch--pawn"></i>Chess Pawn</span>
          </div>
        </section>

        <aside class="side-panel">
          <section class="side-card collapsible-card">
            <button class="collapsible-header" data-toggle-panel="investigators">
              <h3>Investigators</h3>
              <span class="collapse-icon">${state.panelOpen.investigators ? "▾" : "▸"}</span>
            </button>
            <div class="collapsible-body ${state.panelOpen.investigators ? "" : "collapsed"}">
              <div class="players-panel">
              ${match.players.map((player) => `
                  <article class="investigator ${player.isCurrentTurn ? "investigator--active" : ""} ${player.eliminated ? "investigator--eliminated" : ""}">
                    <div class="investigator-token" style="${chessPieceStyle(getSuspect(player.suspectId))}"></div>
                    <div>
                      <strong>${player.name}</strong>
                      <small>${getSuspect(player.suspectId).name}</small>
                      <small>${describePosition(player?.position, match.board)}</small>
                    </div>
                  </article>
                `).join("")}
              </div>
            </div>
          </section>
          ${renderNotebookPanel(match, self)}
        </aside>
      </div>

      <section class="side-card desk-card">
        <div class="desk-header">
          <div>
            <p class="eyebrow">Your Desk</p>
            <h3>${self?.name ?? "Connecting..."} as ${self ? getSuspect(self.suspectId).name : "Unknown"}</h3>
          </div>
          <div class="room-pill">${self?.eliminated ? "Eliminated" : isMyTurn ? "Your turn" : "Waiting"}</div>
        </div>

        <div class="player-desk player-desk--active ${self?.eliminated ? "player-desk--eliminated" : ""}">
          <div class="desk-top">
            <div class="desk-id">
              <div class="desk-piece" style="${self ? chessPieceStyle(getSuspect(self.suspectId)) : ""}"></div>
              <div>
                <strong>${self?.name ?? "Connecting..."}</strong>
                <small>${describePosition(self?.position, match.board)}</small>
                ${self?.note ? `<small class="private-note">${self.note}</small>` : ""}
              </div>
            </div>
          </div>

          <div class="desk-actions">
            <button data-action="roll" class="action-button action-button--primary" ${canRoll() ? "" : "disabled"}>🎲 Throw Dice</button>
            <button data-action="suggest" class="action-button" ${canSuggest(currentRoom) ? "" : "disabled"}>💡 Suggest</button>
            <button data-action="accuse" class="action-button" ${canAct() ? "" : "disabled"}>⚡ Accuse</button>
            <button data-action="tunnel" class="action-button" ${canTunnel(currentRoom) ? "" : "disabled"}>🚪 Tunnel</button>
            <button data-action="end-turn" class="action-button action-button--end" ${canEndTurn() ? "" : "disabled"}>End Turn</button>
          </div>

          ${state.isRolling ? `
            <div class="desk-dice-result">
              <div class="die die--desk die--rolling">${pipLayout(5)}</div>
              <div class="dice-result-text">
                <strong>Rolling...</strong>
              </div>
            </div>
          ` : state.showDice && hasRolled ? `
            <div class="desk-dice-result">
              <div class="die die--desk">${pipLayout(match.rollValue)}</div>
              <div class="dice-result-text">
                <strong>Rolled ${match.rollValue}</strong>
                <small>${match.movementRemaining} moves remaining</small>
                <span style="display: block; color: var(--gold); font-size: 0.85rem; margin-top: 4px; line-height: 1.3;">Please go to the map to decide where you are heading.</span>
              </div>
            </div>
          ` : ""}

          <div class="desk-note-row">
            <button data-action="toggle-hand" class="text-button">${state.revealHand ? "Hide Hand" : "Reveal Hand"}</button>
            ${match.lastReveal ? `<span class="private-note">Private reveal: ${match.lastReveal.disproverName} showed ${match.lastReveal.card.name}</span>` : ""}
          </div>

          ${state.revealHand ? renderHand(self?.hand ?? []) : `<div class="hand-hidden">Your private hand is hidden on this device.</div>`}

          ${pendingDisproof?.isForSelf ? renderDisproofChoices(pendingDisproof.options) : ""}
        </div>
      </section>
    </main>
  `;
}

function renderBoard() {
  const match = state.server.match;
  const reachable = match.reachable || [];
  const roomMarkup = Object.values(match.board.rooms).map((room) => {
    const reachableRoom = reachable.find((node) => node.kind === "room" && node.roomId === room.id);
    const occupied = match.players.filter((player) => player.position?.type === "room" && player.position.roomId === room.id);
    return `
      <button
        class="room-block ${reachableRoom ? "room-block--reachable" : ""} ${state.server.self?.position?.type === "room" && state.server.self.position.roomId === room.id ? "room-block--current" : ""} ${room.tunnelTo ? "room-block--tunnel" : ""}"
        style="grid-column:${room.x + 1} / span ${room.w}; grid-row:${room.y + 1} / span ${room.h}; ${roomArtStyle(room)}"
        ${reachableRoom ? `data-node-key="${nodeKey(reachableRoom)}"` : ""}
      >
        <div class="room-overlay"></div>
        <div class="room-content">
          <span class="room-name">${room.name}</span>
          <span class="room-flavor">${room.flavor}</span>
          ${room.tunnelTo ? `<span class="room-badge room-badge--tunnel" style="${tunnelBadgeStyle()}">Tunnel to ${match.board.rooms[room.tunnelTo].name}</span>` : ""}
          ${match.roomWeapons?.[room.id] ? `<span class="room-badge room-badge--weapon">${getWeapon(match.roomWeapons[room.id]).name}</span>` : ""}
        </div>
        <div class="room-pawns">${occupied.map((player) => pawnMarkup(getSuspect(player.suspectId), player.name)).join("")}</div>
      </button>
    `;
  }).join("");

  const tiles = [];
  for (let y = 0; y < match.board.size; y += 1) {
    for (let x = 0; x < match.board.size; x += 1) {
      const tile = match.board.tiles[y][x];
      if (tile.type === "room") {
        continue;
      }
      const reachableTile = reachable.find((node) => node.kind === "tile" && node.x === x && node.y === y);
      const pawns = match.players.filter((player) => player.position?.type === "tile" && player.position.x === x && player.position.y === y);
      tiles.push(`
        <button
          class="tile tile--${tile.type} ${reachableTile ? "tile--reachable" : ""}"
          style="grid-column:${x + 1}; grid-row:${y + 1}; ${tileBoardStyle(tile)}"
          ${reachableTile ? `data-node-key="${nodeKey(reachableTile)}"` : ""}
        >
          ${pawns.length ? `<div class="pawn-stack">${pawns.map((player) => pawnMarkup(getSuspect(player.suspectId), player.name)).join("")}</div>` : ""}
        </button>
      `);
    }
  }

  return roomMarkup + tiles.join("");
}

function renderHand(hand) {
  return `
    <div class="hand-grid">
      ${hand
        .slice()
        .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
        .map((card) => `
          <article class="case-card">
            <div class="case-card-art" style="${cardArtStyle(card)}"></div>
            <div class="case-card-body">
              <strong>${card.name}</strong>
              <small>${capitalize(card.type)}</small>
            </div>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function renderDisproofChoices(options) {
  return `
    <section class="disproof-panel">
      <p class="eyebrow">Disprove Theory</p>
      <strong>Choose exactly one matching card to show.</strong>
      <div class="hand-grid hand-grid--choices">
        ${options
          .map((card) => `
            <button class="case-card case-card--choice" data-action="disprove" data-card-id="${card.id}">
              <div class="case-card-art" style="${cardArtStyle(card)}"></div>
              <div class="case-card-body">
                <strong>${card.name}</strong>
                <small>Reveal this card</small>
              </div>
            </button>
          `)
          .join("")}
      </div>
    </section>
  `;
}

function renderNotebookPanel(match, self) {
  const revealCard = match.lastReveal?.card ?? null;
  const noteCopy = revealCard
    ? `${match.lastReveal.disproverName ?? "Someone"} showed you ${match.lastReveal.card.name}.`
    : self?.note || "Mark suspects, weapons, and rooms as the case unfolds.";

  return `
    <section class="side-card notebook-panel">
      <div class="notebook-head">
        <div>
          <h3>Detective Notes</h3>
          <p class="lead slim">Private notebook for this browser seat.</p>
        </div>
        <div class="room-pill">Notebook</div>
      </div>
      <div class="reveal-banner">
        <strong>Latest clue</strong>
        <span>${noteCopy}</span>
      </div>
      ${revealCard ? `
        <div class="reveal-card">
          ${renderHand([revealCard])}
        </div>
      ` : ""}
      <iframe
        class="notebook-frame"
        title="Detective score sheet"
        sandbox="allow-scripts"
        srcdoc="${escapeAttr(sanitizeNotebookDocument(buildNotebookFrameDocument(match, self)))}"
      ></iframe>
    </section>
  `;
}

function renderSuggestDialog() {
  if (!state.suggestOpen || !state.server?.match) {
    return "";
  }
  const roomName = selfPositionIsRoom() ? state.server.match.board.rooms[selfPosition().roomId].name : "";
  return `
    <dialog open>
      <form method="dialog" class="modal">
        <p class="eyebrow">Suggestion</p>
        <h3>Press the Room Theory</h3>
        <p class="modal-copy">Current room: ${roomName}</p>
        <label class="control">
          <span>Suspect</span>
          <select id="suggest-suspect">${SUSPECTS.map((suspect) => `<option value="${suspect.id}">${suspect.name}</option>`).join("")}</select>
        </label>
        <label class="control">
          <span>Weapon</span>
          <select id="suggest-weapon">${WEAPONS.map((weapon) => `<option value="${weapon.id}">${weapon.name}</option>`).join("")}</select>
        </label>
        <menu class="modal-actions">
          <button data-action="close-suggest" class="action-button">Cancel</button>
          <button data-action="confirm-suggest" class="action-button action-button--primary">Confirm</button>
        </menu>
      </form>
    </dialog>
  `;
}

function renderAccuseDialog() {
  if (!state.accuseOpen || !state.server?.match) {
    return "";
  }
  return `
    <dialog open>
      <form method="dialog" class="modal">
        <p class="eyebrow">Accusation</p>
        <h3>Commit to the Answer</h3>
        <label class="control">
          <span>Suspect</span>
          <select id="accuse-suspect">${SUSPECTS.map((suspect) => `<option value="${suspect.id}">${suspect.name}</option>`).join("")}</select>
        </label>
        <label class="control">
          <span>Weapon</span>
          <select id="accuse-weapon">${WEAPONS.map((weapon) => `<option value="${weapon.id}">${weapon.name}</option>`).join("")}</select>
        </label>
        <label class="control">
          <span>Room</span>
          <select id="accuse-room">${ROOM_BLUEPRINTS.map((room) => `<option value="${room.id}">${room.name}</option>`).join("")}</select>
        </label>
        <menu class="modal-actions">
          <button data-action="close-accuse" class="action-button">Cancel</button>
          <button data-action="confirm-accuse" class="action-button action-button--primary">Accuse</button>
        </menu>
      </form>
    </dialog>
  `;
}

function bindEvents() {
  document.getElementById("create-name")?.addEventListener("input", (event) => {
    state.createName = event.target.value;
  });
  document.getElementById("join-name")?.addEventListener("input", (event) => {
    state.joinName = event.target.value;
  });
  document.getElementById("join-code")?.addEventListener("input", (event) => {
    state.joinCode = String(event.target.value).replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
    event.target.value = state.joinCode;
  });
  document.getElementById("seed-input")?.addEventListener("input", (event) => {
    state.seed = event.target.value;
  });

  document.getElementById("create-room")?.addEventListener("click", async () => {
    state.busy = true;
    render();
    const result = await emitAck("room:create", { name: state.createName.trim() || "Host", seed: state.seed });
    state.busy = false;
    if (result?.ok) {
      state.playerId = result.playerId;
      state.roomCode = result.roomCode;
      state.notebookState = readSavedNotebook(result.roomCode, result.playerId);
      state.notice = `Room ${result.roomCode} created.`;
      persistSession();
      await syncRoomState();
    } else {
      state.notice = result?.error || "Unable to create room.";
    }
    render();
  });

  document.getElementById("join-room")?.addEventListener("click", async () => {
    state.busy = true;
    render();
    const result = await emitAck("room:join", { roomCode: state.joinCode, name: state.joinName.trim() || "Guest" });
    state.busy = false;
    if (result?.ok) {
      state.playerId = result.playerId;
      state.roomCode = result.roomCode;
      state.notebookState = readSavedNotebook(result.roomCode, result.playerId);
      state.notice = `Joined room ${result.roomCode}.`;
      persistSession();
      await syncRoomState();
    } else {
      state.notice = result?.error || "Unable to join room.";
    }
    render();
  });

  document.getElementById("start-room")?.addEventListener("click", async () => {
    try {
      state.clientError = "";
      state.notice = "Starting match...";
      render();
      emitNoAck("room:start", {
        roomCode: state.server.roomCode,
        playerId: state.playerId,
        seed: state.seed,
      });

      let syncedToMatch = false;
      for (let attempt = 0; attempt < 15; attempt += 1) {
        await wait(200);
        await syncRoomState();
        if (state.server?.match) {
          syncedToMatch = true;
          state.notice = state.server.match.statusMessage || "Match started.";
          break;
        }
      }

      if (!syncedToMatch) {
        state.notice = "The room did not transition to an active match. Please try again.";
      }
      render();
    } catch (error) {
      state.clientError = error instanceof Error ? error.message : String(error);
      state.notice = "Start Match failed in the browser client.";
      render();
    }
  });

  document.getElementById("board")?.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-node-key]");
    if (!target || !canAct()) {
      return;
    }
    await emitAck("action:move", {
      roomCode: state.server.roomCode,
      playerId: state.playerId,
      destinationKey: target.dataset.nodeKey,
    });
  });

  app.querySelectorAll("[data-action='toggle-hand']").forEach((button) => {
    button.addEventListener("click", () => {
      state.revealHand = !state.revealHand;
      render();
    });
  });

  app.querySelectorAll("[data-action='roll']").forEach((button) => {
    button.addEventListener("click", async () => {
      state.isRolling = true;
      render();
      const result = await emitAck("action:roll", { roomCode: state.server.roomCode, playerId: state.playerId });
      setTimeout(() => {
        state.isRolling = false;
        if (result?.ok) {
          state.showDice = true;
          render();
          setTimeout(() => { state.showDice = false; render(); }, 4000);
        } else {
          render();
        }
      }, 800);
    });
  });
  app.querySelectorAll("[data-action='suggest']").forEach((button) => {
    button.addEventListener("click", () => {
      state.suggestOpen = true;
      render();
    });
  });
  app.querySelectorAll("[data-action='accuse']").forEach((button) => {
    button.addEventListener("click", () => {
      state.accuseOpen = true;
      render();
    });
  });
  app.querySelectorAll("[data-action='tunnel']").forEach((button) => {
    button.addEventListener("click", () => emitAck("action:tunnel", { roomCode: state.server.roomCode, playerId: state.playerId }));
  });
  app.querySelectorAll("[data-action='end-turn']").forEach((button) => {
    button.addEventListener("click", () => {
      state.showDice = false;
      emitAck("action:endTurn", { roomCode: state.server.roomCode, playerId: state.playerId });
    });
  });
  app.querySelectorAll("[data-action='disprove']").forEach((button) => {
    button.addEventListener("click", () => emitAck("action:disprove", { roomCode: state.server.roomCode, playerId: state.playerId, cardId: button.dataset.cardId }));
  });
  app.querySelectorAll("[data-toggle-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      const panelId = button.dataset.togglePanel;
      state.panelOpen[panelId] = !state.panelOpen[panelId];
      render();
    });
  });
  app.querySelectorAll("[data-action='close-suggest']").forEach((button) => {
    button.addEventListener("click", () => {
      state.suggestOpen = false;
      render();
    });
  });
  app.querySelectorAll("[data-action='close-accuse']").forEach((button) => {
    button.addEventListener("click", () => {
      state.accuseOpen = false;
      render();
    });
  });
  app.querySelectorAll("[data-action='confirm-suggest']").forEach((button) => {
    button.addEventListener("click", async () => {
      const suspectId = document.getElementById("suggest-suspect").value;
      const weaponId = document.getElementById("suggest-weapon").value;
      state.suggestOpen = false;
      render();
      await emitAck("action:suggest", { roomCode: state.server.roomCode, playerId: state.playerId, suspectId, weaponId });
    });
  });
  app.querySelectorAll("[data-action='confirm-accuse']").forEach((button) => {
    button.addEventListener("click", async () => {
      const suspectId = document.getElementById("accuse-suspect").value;
      const weaponId = document.getElementById("accuse-weapon").value;
      const roomId = document.getElementById("accuse-room").value;
      state.accuseOpen = false;
      render();
      await emitAck("action:accuse", { roomCode: state.server.roomCode, playerId: state.playerId, suspectId, weaponId, roomId });
    });
  });
}

function emitAck(event, payload) {
  return new Promise((resolve) => {
    socket.timeout(4000).emit(event, payload, (error, response) => {
      if (error) {
        resolve({ ok: false, error: `Timed out waiting for ${event}.` });
        return;
      }
      if (response?.error) {
        state.notice = response.error;
        render();
      }
      resolve(response);
    });
  });
}

function emitNoAck(event, payload) {
  socket.emit(event, payload);
}

async function syncRoomState() {
  if (!state.playerId || !state.roomCode) {
    return;
  }
  const response = await emitAck("room:sync", {
    roomCode: state.roomCode,
    playerId: state.playerId,
  });
  if (response?.ok && response.state) {
    state.server = response.state;
    state.notice = response.state.match?.statusMessage || state.notice;
    render();
  } else if (response?.error) {
    state.notice = `Sync failed: ${response.error}`;
    render();
  }
}

function canAct() {
  return Boolean(state.server?.match && state.server.match.currentPlayerId === state.playerId && !state.server.self.eliminated && !state.server.pendingDisproof && !state.server.match.winnerId);
}

function canRoll() {
  return canAct() && state.server.match.rollValue === null;
}

function canSuggest(currentRoom) {
  return canAct() && Boolean(currentRoom) && !state.server.match.hasSuggestedThisTurn;
}

function canTunnel(currentRoom) {
  return canAct() && Boolean(currentRoom?.tunnelTo);
}

function canEndTurn() {
  return canAct() && state.server.match.rollValue !== null;
}

function selfPosition() {
  return state.server?.self?.position ?? null;
}

function selfPositionIsRoom() {
  return selfPosition()?.type === "room";
}

function renderWinnerTitle() {
  if (state.server.match.winnerId === "nobody") {
    return "No Detective Solved It";
  }
  const winner = state.server.match.players.find((player) => player.id === state.server.match.winnerId);
  return winner ? `${winner.name} Wins the Victory!` : "Game Over";
}

function renderVictoryBanner(match) {
  if (!match.winnerId) return "";
  const isNobody = match.winnerId === "nobody";
  const winner = match.players.find((p) => p.id === match.winnerId);
  const winnerName = winner?.name ?? "Unknown";
  const suspectName = winner ? getSuspect(winner.suspectId).name : "";

  return `
    <div class="victory-overlay">
      <div class="victory-card">
        <div class="victory-glow"></div>
        <p class="eyebrow victory-eyebrow">${isNobody ? "Case Unsolved" : "Case Closed"}</p>
        <h2 class="victory-title">${isNobody ? "No Detective Solved It" : `${winnerName} Wins the Victory!`}</h2>
        ${!isNobody && suspectName ? `<p class="victory-subtitle">Playing as ${suspectName}</p>` : ""}
        <p class="victory-status">${state.notice}</p>
        ${!isNobody ? `
          <div class="victory-piece" style="${chessPieceStyle(getSuspect(winner.suspectId))}"></div>
        ` : ""}
      </div>
    </div>
  `;
}

function pipLayout(value) {
  const positions = {
    1: ["c"],
    2: ["tl", "br"],
    3: ["tl", "c", "br"],
    4: ["tl", "tr", "bl", "br"],
    5: ["tl", "tr", "c", "bl", "br"],
    6: ["tl", "tr", "ml", "mr", "bl", "br"],
  }[value];

  return `
    <span class="pip-grid">
      ${["tl", "tr", "ml", "c", "mr", "bl", "br"].map((slot) => `<span class="pip ${positions.includes(slot) ? "pip--on" : ""} pip--${slot}"></span>`).join("")}
    </span>
  `;
}

function describePosition(position, board) {
  if (!position || !board) {
    return "Waiting for position...";
  }
  if (position.type === "room") {
    return board.rooms[position.roomId].name;
  }
  const tile = board.tiles[position.y][position.x];
  if (tile.type === "start") {
    return "Start tile";
  }
  if (tile.type === "door") {
    return `Doorway to ${board.rooms[tile.roomId].name}`;
  }
  return `Hallway ${position.x}, ${position.y}`;
}

function roomArtStyle(room) {
  return backgroundGridStyle("/assets/rooms.jpg", room.artCell, 3, 3);
}

function tileBoardStyle(tile) {
  if (tile.type === "door") {
    return doorTileStyle();
  }
  if (tile.type === "start") {
    return "background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(0, 0, 0, 0.06)), #d8c6ae;";
  }
  return "";
}

function doorTileStyle() {
  return `${backgroundGridStyle("/assets/doors-and-tunnels.jpg", { x: 1, y: 0 }, 2, 1)} background-repeat:no-repeat; background-color:#e9dcc6; background-size:200% 100%; border:1px solid rgba(84, 49, 20, 0.3);`;
}

function tunnelBadgeStyle() {
  return `${backgroundGridStyle("/assets/doors-and-tunnels.jpg", { x: 0, y: 0 }, 2, 1)} background-repeat:no-repeat; background-size:200% 100%; background-color:rgba(18, 26, 38, 0.82); padding-left:30px;`;
}

function cardArtStyle(card) {
  if (card.type === "room") {
    return backgroundGridStyle("/assets/rooms.jpg", getRoom(card.id).artCell, 3, 3);
  }
  if (card.type === "weapon") {
    return backgroundGridStyle("/assets/weapons.jpg", getWeapon(card.id).artCell, 3, 2);
  }
  return backgroundGridStyle("/assets/role.jpg", getSuspect(card.id).artCell, 3, 2);
}

function buildNotebookFrameDocument(match, self) {
  const notebookPayload = {
    roomCode: state.roomCode,
    playerId: state.playerId,
    seed: match.seed,
    lastReveal: match.lastReveal?.card?.name ?? "",
    players: match.players.map((player) => ({
      id: player.id,
      name: player.name,
      suspectId: player.suspectId,
    })),
    sections: [
      { id: "suspects", title: "Suspects", items: SUSPECTS.map((suspect) => ({ id: suspect.id, label: suspect.name })) },
      { id: "weapons", title: "Weapons", items: WEAPONS.map((weapon) => ({ id: weapon.id, label: weapon.name })) },
      { id: "rooms", title: "Rooms", items: ROOM_BLUEPRINTS.map((room) => ({ id: room.id, label: room.name })) },
    ],
    notebookState: state.notebookState ?? createEmptyNotebookState(),
    selfName: self?.name ?? "Detective",
  };

  const payloadJson = JSON.stringify(notebookPayload).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      :root {
        color-scheme: light;
        --paper: #f8f3e8;
        --paper-edge: #e6d9c0;
        --line: #b9aa8c;
        --ink: #2b2015;
        --muted: #6a5a45;
        --accent: #8a2f20;
        --accent-soft: rgba(138, 47, 32, 0.1);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(188, 75, 54, 0.08), transparent 22%),
          linear-gradient(180deg, #efe5d4, #f8f3e8);
      }

      .frame {
        min-height: 100vh;
        padding: 14px;
      }

      .toolbar,
      .sheet-wrap {
        border: 1px solid var(--paper-edge);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.72);
        box-shadow: 0 8px 22px rgba(77, 51, 28, 0.12);
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        padding: 10px;
        margin-bottom: 12px;
      }

      .tool-group {
        display: inline-flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      button {
        border: 1px solid #cbbb9f;
        border-radius: 999px;
        background: white;
        color: var(--ink);
        font: inherit;
        cursor: pointer;
        padding: 8px 12px;
      }

      button.active {
        background: linear-gradient(180deg, #923223, #702216);
        color: white;
        border-color: #923223;
      }

      .toolbar-note {
        margin-left: auto;
        font-size: 0.82rem;
        color: var(--muted);
      }

      .sheet-wrap {
        overflow: hidden;
        padding: 12px;
      }

      .sheet-stage {
        position: relative;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--paper-edge);
        background: var(--paper);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      th,
      td {
        border: 1px solid var(--line);
      }

      thead th {
        background: #ddd3c0;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 8px 6px;
      }

      .label-col {
        width: 40%;
      }

      .player-col {
        width: calc(60% / ${Math.max(match.players.length, 1)});
      }

      .section-row th {
        background: #cbc0ac;
        color: var(--ink);
        font-size: 1rem;
        padding: 10px 8px;
      }

      tbody th {
        text-align: left;
        font-size: 0.9rem;
        padding: 9px 10px;
        background: rgba(255, 255, 255, 0.46);
      }

      td {
        position: relative;
        height: 40px;
        text-align: center;
        vertical-align: middle;
        background: rgba(255, 255, 255, 0.54);
      }

      td[data-cell-key] {
        cursor: crosshair;
      }

      .cell-mark {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        min-height: 24px;
        padding: 2px 4px;
        border-radius: 10px;
        font-weight: 700;
      }

      .cell-mark--check {
        color: #1e6a42;
        background: rgba(30, 106, 66, 0.1);
      }

      .cell-mark--cross {
        color: #8a2f20;
        background: rgba(138, 47, 32, 0.1);
      }

      .cell-mark--text {
        font-size: 0.82rem;
        color: var(--ink);
        background: rgba(43, 32, 21, 0.08);
      }

      .cell-inline-input {
        position: absolute;
        inset: 2px;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        border: 2px solid var(--accent);
        border-radius: 8px;
        background: #fffdf6;
        color: var(--ink);
        font: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        padding: 0 4px;
        outline: none;
        z-index: 5;
        box-shadow: 0 0 0 3px rgba(138, 47, 32, 0.15), 0 2px 8px rgba(0,0,0,0.12);
      }

      td.cell-editing {
        background: rgba(138, 47, 32, 0.06);
      }

      canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      canvas.is-drawing {
        pointer-events: auto;
      }

      @media (max-width: 720px) {
        .frame { padding: 10px; }
        th, td { font-size: 0.72rem; }
        td { height: 34px; }
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="toolbar">
        <div class="tool-group">
          <button type="button" data-tool="pen">Write</button>
          <button type="button" data-tool="erase">Rubber</button>
          <button type="button" data-tool="type">Type</button>
          <button type="button" data-tool="check">Check</button>
          <button type="button" data-tool="cross">Cross</button>
          <button type="button" data-tool="clear">Clear Cell</button>
        </div>
        <div class="tool-group">
          <button type="button" data-action="clear-ink">Clear Ink</button>
          <button type="button" data-action="undo" id="undo-btn">Undo</button>
        </div>
        <span class="toolbar-note">Private sheet for ${escapeHtml(self?.name ?? "Detective")}${match.lastReveal?.card ? ` \u2022 ${escapeHtml(match.lastReveal.disproverName ?? "Someone")} showed: ${escapeHtml(match.lastReveal.card.name)}` : ""}</span>
      </div>
      <div class="sheet-wrap">
        <div class="sheet-stage" id="sheet-stage">
          <table id="sheet-table"></table>
          <canvas id="sheet-canvas"></canvas>
        </div>
      </div>
    </div>

    <script>
      const payload = ${payloadJson};
      const table = document.getElementById("sheet-table");
      const canvas = document.getElementById("sheet-canvas");
      const stage = document.getElementById("sheet-stage");
      const ctx = canvas.getContext("2d");
      const state = {
        tool: payload.notebookState?.tool || "check",
        cells: payload.notebookState?.cells || {},
        strokes: payload.notebookState?.strokes || [],
      };
      const undoHistory = [];
      const MAX_UNDO = 50;
      let activeStroke = null;

      function pushUndo() {
        undoHistory.push({
          cells: JSON.parse(JSON.stringify(state.cells)),
          strokes: JSON.parse(JSON.stringify(state.strokes)),
        });
        if (undoHistory.length > MAX_UNDO) {
          undoHistory.shift();
        }
        updateUndoButton();
      }

      function performUndo() {
        if (undoHistory.length === 0) return;
        const snapshot = undoHistory.pop();
        state.cells = snapshot.cells;
        state.strokes = snapshot.strokes;
        renderTable();
        redrawStrokes();
        postUpdate();
        updateUndoButton();
      }

      function updateUndoButton() {
        const btn = document.getElementById('undo-btn');
        if (btn) {
          btn.disabled = undoHistory.length === 0;
          btn.textContent = undoHistory.length > 0 ? 'Undo (' + undoHistory.length + ')' : 'Undo';
        }
      }

      function escapeText(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll("\\"", "&quot;");
      }

      function renderTable() {
        const headers = payload.players.map((player) => \`<th class="player-col">\${escapeText(player.name)}</th>\`).join("");
        const sections = payload.sections.map((section) => {
          const rows = section.items.map((item) => {
            const cells = payload.players.map((player) => {
              const key = cellKey(section.id, item.id, player.id);
              const entry = state.cells[key];
              return \`<td data-cell-key="\${key}">\${renderCell(entry)}</td>\`;
            }).join("");
            return \`<tr><th>\${escapeText(item.label)}</th>\${cells}</tr>\`;
          }).join("");
          return \`<tbody><tr class="section-row"><th colspan="\${payload.players.length + 1}">\${escapeText(section.title)}</th></tr>\${rows}</tbody>\`;
        }).join("");

        table.innerHTML = \`
          <thead>
            <tr>
              <th class="label-col">Evidence</th>
              \${headers}
            </tr>
          </thead>
          \${sections}
        \`;
      }

      function renderCell(entry) {
        if (!entry) return "";
        if (entry.kind === "text") {
          return \`<span class="cell-mark cell-mark--text">\${escapeText(entry.value)}</span>\`;
        }
        if (entry.kind === "check") {
          return '<span class="cell-mark cell-mark--check">✓</span>';
        }
        if (entry.kind === "cross") {
          return '<span class="cell-mark cell-mark--cross">✕</span>';
        }
        return "";
      }

      function cellKey(sectionId, itemId, playerId) {
        return [sectionId, itemId, playerId].join("::");
      }

      function setTool(tool) {
        state.tool = tool;
        document.querySelectorAll("[data-tool]").forEach((button) => {
          button.classList.toggle("active", button.dataset.tool === tool);
        });
        canvas.classList.toggle("is-drawing", tool === "pen" || tool === "erase");
        postUpdate();
      }

      function postUpdate() {
        parent.postMessage({
          type: "clue-notebook:update",
          roomCode: payload.roomCode,
          playerId: payload.playerId,
          seed: payload.seed,
          notebookState: {
            tool: state.tool,
            cells: state.cells,
            strokes: state.strokes,
          },
        }, "*");
      }

      function resizeCanvas() {
        const rect = stage.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(rect.width * ratio);
        canvas.height = Math.floor(rect.height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        redrawStrokes();
      }

      function redrawStrokes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const stroke of state.strokes) {
          drawStroke(stroke);
        }
        if (activeStroke) {
          drawStroke(activeStroke);
        }
      }

      function drawStroke(stroke) {
        if (!stroke.points || stroke.points.length < 2) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (stroke.mode === "erase") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = 16;
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "#4d3324";
          ctx.lineWidth = 2.4;
        }
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let index = 1; index < stroke.points.length; index += 1) {
          ctx.lineTo(stroke.points[index].x, stroke.points[index].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      function pointerPoint(event) {
        const rect = stage.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }

      let activeInlineInput = null;

      function beginInlineEdit(cell, key) {
        if (activeInlineInput) {
          commitInlineEdit();
        }
        const existing = state.cells[key]?.kind === "text" ? state.cells[key].value : "";
        cell.classList.add("cell-editing");
        cell.innerHTML = "";
        const input = document.createElement("input");
        input.type = "text";
        input.className = "cell-inline-input";
        input.value = existing;
        input.maxLength = 10;
        input.placeholder = "...";
        cell.appendChild(input);
        activeInlineInput = { input, cell, key };

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitInlineEdit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelInlineEdit();
          }
        });
        input.addEventListener("blur", () => {
          setTimeout(() => {
            if (activeInlineInput && activeInlineInput.input === input) {
              commitInlineEdit();
            }
          }, 80);
        });

        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }

      function commitInlineEdit() {
        if (!activeInlineInput) return;
        const { input, cell, key } = activeInlineInput;
        activeInlineInput = null;
        const cleaned = input.value.trim().slice(0, 10);
        pushUndo();
        if (cleaned) {
          state.cells[key] = { kind: "text", value: cleaned };
        } else {
          delete state.cells[key];
        }
        cell.classList.remove("cell-editing");
        renderTable();
        postUpdate();
      }

      function cancelInlineEdit() {
        if (!activeInlineInput) return;
        const { cell } = activeInlineInput;
        activeInlineInput = null;
        cell.classList.remove("cell-editing");
        renderTable();
      }

      stage.addEventListener("click", (event) => {
        if (event.target.closest(".cell-inline-input")) {
          return;
        }
        const cell = event.target.closest("td[data-cell-key]");
        if (!cell || state.tool === "pen") {
          return;
        }
        const key = cell.dataset.cellKey;
        if (state.tool === "type") {
          beginInlineEdit(cell, key);
          return;
        }
        pushUndo();
        if (state.tool === "erase" || state.tool === "clear") {
          delete state.cells[key];
        } else if (state.tool === "check") {
          state.cells[key] = { kind: "check" };
        } else if (state.tool === "cross") {
          state.cells[key] = { kind: "cross" };
        }
        renderTable();
        postUpdate();
      });

      canvas.addEventListener("pointerdown", (event) => {
        if (state.tool !== "pen" && state.tool !== "erase") {
          return;
        }
        pushUndo();
        activeStroke = {
          mode: state.tool,
          points: [pointerPoint(event)],
        };
        canvas.setPointerCapture(event.pointerId);
        redrawStrokes();
      });

      canvas.addEventListener("pointermove", (event) => {
        if (!activeStroke) {
          return;
        }
        activeStroke.points.push(pointerPoint(event));
        redrawStrokes();
      });

      function finishStroke() {
        if (activeStroke && activeStroke.points.length > 1) {
          state.strokes.push(activeStroke);
          postUpdate();
        }
        activeStroke = null;
        redrawStrokes();
      }

      canvas.addEventListener("pointerup", finishStroke);
      canvas.addEventListener("pointercancel", finishStroke);

      document.querySelectorAll("[data-tool]").forEach((button) => {
        button.addEventListener("click", () => setTool(button.dataset.tool));
      });

      document.querySelector("[data-action='clear-ink']").addEventListener("click", () => {
        pushUndo();
        state.strokes = [];
        redrawStrokes();
        postUpdate();
      });

      document.querySelector("[data-action='undo']").addEventListener("click", () => {
        performUndo();
      });

      renderTable();
      setTool(state.tool);
      resizeCanvas();
      updateUndoButton();
      window.addEventListener("resize", resizeCanvas);
    </script>
  </body>
</html>`;
}

function sanitizeNotebookDocument(documentHtml) {
  return documentHtml
    .replace(/\.replaceAll\([^)]*&quot;[^)]*\);/, `.replaceAll('"', "&quot;");`)
    .replace(/return '<span class="cell-mark cell-mark--check">[^']*';/, `return '<span class="cell-mark cell-mark--check">&#10003;</span>';`)
    .replace(/return '<span class="cell-mark cell-mark--cross">[^']*';/, `return '<span class="cell-mark cell-mark--cross">&#10005;</span>';`)
    .replace(/\s+[^\x00-\x7F]+\?shown:/, " | shown:");
}

function chessPieceStyle(suspect) {
  return `${backgroundGridStyle("/assets/chess.jpg", suspect.chessCell, 3, 2)} border-radius:50%;`;
}

function pawnMarkup(suspect, title) {
  return `<span class="pawn-piece" title="${escapeAttr(title)}" style="${chessPieceStyle(suspect)}"></span>`;
}

function backgroundGridStyle(url, cell, cols, rows) {
  const x = cols === 1 ? 0 : (cell.x / (cols - 1)) * 100;
  const y = rows === 1 ? 0 : (cell.y / (rows - 1)) * 100;
  return `background-image:url('${url}'); background-size:${cols * 100}% ${rows * 100}%; background-position:${x}% ${y}%;`;
}

function getSuspect(id) {
  return SUSPECTS.find((suspect) => suspect.id === id);
}

function getWeapon(id) {
  return WEAPONS.find((weapon) => weapon.id === id);
}

function getRoom(id) {
  return ROOM_BLUEPRINTS.find((room) => room.id === id);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createEmptyNotebookState() {
  return {
    tool: "check",
    cells: {},
    strokes: [],
  };
}

function getNotebookStorageKey(roomCode = state.roomCode, playerId = state.playerId, seed = state.server?.match?.seed) {
  return `${storageKey}-notebook-${roomCode || "room"}-${playerId || "player"}-${seed || "lobby"}`;
}

function persistNotebook() {
  try {
    window.sessionStorage.setItem(getNotebookStorageKey(), JSON.stringify(state.notebookState ?? createEmptyNotebookState()));
  } catch {}
}

function persistSession() {
  try {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        roomCode: state.roomCode,
        playerId: state.playerId,
      })
    );
  } catch {}
}

function readSavedSession() {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : { roomCode: "", playerId: null };
  } catch {
    return { roomCode: "", playerId: null };
  }
}

function readSavedNotebook(roomCode, playerId, seed) {
  try {
    const raw = window.sessionStorage.getItem(getNotebookStorageKey(roomCode, playerId, seed));
    return raw ? JSON.parse(raw) : createEmptyNotebookState();
  } catch {
    return createEmptyNotebookState();
  }
}

function handleNotebookMessage(event) {
  if (event.data?.type !== "clue-notebook:update") {
    return;
  }
  if (event.data.roomCode !== state.roomCode || event.data.playerId !== state.playerId) {
    return;
  }
  state.notebookState = event.data.notebookState ?? createEmptyNotebookState();
  persistNotebook();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
