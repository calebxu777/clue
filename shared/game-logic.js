import { BOARD_SIZE, ROOM_BLUEPRINTS, START_BLUEPRINTS, SUSPECTS, WEAPONS } from "./game-data.js";

export function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function shuffleInPlace(array, rng) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function isInBounds(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

export function keyForTile(x, y) {
  return `${x},${y}`;
}

export function nodeKey(node) {
  return node.kind === "room" ? `room:${node.roomId}` : `tile:${node.x},${node.y}`;
}

export function orthogonalNeighbors(x, y) {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
}

export function normalizePosition(position) {
  if (position.type === "room") {
    return { kind: "room", roomId: position.roomId };
  }
  return { kind: "tile", x: position.x, y: position.y };
}

export function createBoard(seed) {
  const rng = createRng(seed);
  let attempt = 0;

  while (attempt < 60) {
    attempt += 1;
    const board = {
      size: BOARD_SIZE,
      tiles: Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ({ type: "hallway", roomId: null }))),
      rooms: {},
      starts: {},
      tunnelPairs: [],
    };

    const roomsByGrid = {};
    for (const blueprint of ROOM_BLUEPRINTS) {
      const room = generateRoomFromBlueprint(blueprint, rng);
      roomsByGrid[`${blueprint.row},${blueprint.col}`] = room.id;
      board.rooms[room.id] = room;
      for (let y = room.y; y < room.y + room.h; y += 1) {
        for (let x = room.x; x < room.x + room.w; x += 1) {
          board.tiles[y][x] = { type: "room", roomId: room.id };
        }
      }
    }

    addRoomDoors(board, rng);
    addStartTiles(board, rng);

    const diagonalPairs = [
      [roomsByGrid["0,0"], roomsByGrid["2,2"]],
      [roomsByGrid["0,2"], roomsByGrid["2,0"]],
    ];

    board.tunnelPairs = diagonalPairs;
    diagonalPairs.forEach(([a, b]) => {
      board.rooms[a].tunnelTo = b;
      board.rooms[b].tunnelTo = a;
    });

    if (validateBoard(board)) {
      return board;
    }
  }

  throw new Error("Board generation failed.");
}

function generateRoomFromBlueprint(blueprint, rng) {
  const zoneWidth = blueprint.zone.x2 - blueprint.zone.x1 + 1;
  const zoneHeight = blueprint.zone.y2 - blueprint.zone.y1 + 1;
  const w = randomInt(rng, blueprint.minW, Math.min(blueprint.maxW, zoneWidth));
  const h = randomInt(rng, blueprint.minH, Math.min(blueprint.maxH, zoneHeight));
  const x = randomInt(rng, blueprint.zone.x1, blueprint.zone.x2 - w + 1);
  const y = randomInt(rng, blueprint.zone.y1, blueprint.zone.y2 - h + 1);

  return {
    id: blueprint.id,
    name: blueprint.name,
    x,
    y,
    w,
    h,
    anchor: { x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) },
    doors: [],
    tunnelTo: null,
    row: blueprint.row,
    col: blueprint.col,
    artCell: blueprint.artCell,
    flavor: blueprint.flavor,
  };
}

function addRoomDoors(board, rng) {
  Object.values(board.rooms).forEach((room) => {
    const desiredDoorCount = room.id === "ballroom" ? 4 : room.col === 1 || room.row === 1 ? 2 : 1;
    const candidates = [];
    for (let x = room.x + 1; x < room.x + room.w - 1; x += 1) {
      candidates.push({ x, y: room.y, hx: x, hy: room.y - 1 });
      candidates.push({ x, y: room.y + room.h - 1, hx: x, hy: room.y + room.h });
    }
    for (let y = room.y + 1; y < room.y + room.h - 1; y += 1) {
      candidates.push({ x: room.x, y, hx: room.x - 1, hy: y });
      candidates.push({ x: room.x + room.w - 1, y, hx: room.x + room.w, hy: y });
    }
    shuffleInPlace(candidates, rng);
    for (const candidate of candidates) {
      if (room.doors.length >= desiredDoorCount) {
        break;
      }
      if (!isInBounds(candidate.hx, candidate.hy)) {
        continue;
      }
      if (board.tiles[candidate.hy][candidate.hx].type !== "hallway") {
        continue;
      }
      if (room.doors.some((door) => Math.abs(door.x - candidate.hx) + Math.abs(door.y - candidate.hy) < 3)) {
        continue;
      }
      room.doors.push({ x: candidate.hx, y: candidate.hy, entryX: candidate.x, entryY: candidate.y });
      board.tiles[candidate.hy][candidate.hx] = { type: "door", roomId: room.id };
    }
  });
}

function addStartTiles(board, rng) {
  Object.entries(START_BLUEPRINTS).forEach(([key, coords]) => {
    const offsets = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    shuffleInPlace(offsets, rng);
    for (const offset of offsets) {
      const x = clamp(coords.x + offset.x, 0, BOARD_SIZE - 1);
      const y = clamp(coords.y + offset.y, 0, BOARD_SIZE - 1);
      if (board.tiles[y][x].type === "hallway") {
        board.tiles[y][x] = { type: "start", roomId: null, startKey: key };
        board.starts[key] = { x, y };
        return;
      }
    }
    board.tiles[coords.y][coords.x] = { type: "start", roomId: null, startKey: key };
    board.starts[key] = { x: coords.x, y: coords.y };
  });
}

function validateBoard(board) {
  if (Object.keys(board.rooms).length !== 9) {
    return false;
  }
  for (const suspect of SUSPECTS) {
    if (!board.starts[suspect.startKey]) {
      return false;
    }
  }
  for (const room of Object.values(board.rooms)) {
    if (!room.doors.length) {
      return false;
    }
  }
  const visited = walkBoard(board, board.starts.scarlet);
  for (const start of Object.values(board.starts)) {
    if (!visited.has(keyForTile(start.x, start.y))) {
      return false;
    }
  }
  for (const room of Object.values(board.rooms)) {
    if (!room.doors.some((door) => visited.has(keyForTile(door.x, door.y)))) {
      return false;
    }
  }
  return true;
}

function walkBoard(board, start) {
  const queue = [start];
  const visited = new Set([keyForTile(start.x, start.y)]);
  while (queue.length) {
    const current = queue.shift();
    for (const neighbor of orthogonalNeighbors(current.x, current.y)) {
      if (!isInBounds(neighbor.x, neighbor.y)) {
        continue;
      }
      const tile = board.tiles[neighbor.y][neighbor.x];
      if (!["hallway", "door", "start"].includes(tile.type)) {
        continue;
      }
      const key = keyForTile(neighbor.x, neighbor.y);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      queue.push(neighbor);
    }
  }
  return visited;
}

export function createSolution(seed) {
  const rng = createRng(seed + 71);
  return {
    suspect: SUSPECTS[randomInt(rng, 0, SUSPECTS.length - 1)].id,
    weapon: WEAPONS[randomInt(rng, 0, WEAPONS.length - 1)].id,
    room: ROOM_BLUEPRINTS[randomInt(rng, 0, ROOM_BLUEPRINTS.length - 1)].id,
  };
}

export function buildDeck(solution, seed) {
  const rng = createRng(seed + 913);
  const deck = [
    ...SUSPECTS.filter((item) => item.id !== solution.suspect).map((item) => ({ id: item.id, name: item.name, type: "suspect" })),
    ...WEAPONS.filter((item) => item.id !== solution.weapon).map((item) => ({ id: item.id, name: item.name, type: "weapon" })),
    ...ROOM_BLUEPRINTS.filter((item) => item.id !== solution.room).map((item) => ({ id: item.id, name: item.name, type: "room" })),
  ];
  return shuffleInPlace(deck, rng);
}

export function assignStartingPosition(player, board) {
  const suspect = SUSPECTS.find((item) => item.id === player.suspectId);
  const start = board.starts[suspect.startKey];
  player.position = { type: "tile", x: start.x, y: start.y };
}

export function getReachableDestinations(match, player, maxSteps) {
  const occupiedTiles = new Set(
    match.players
      .filter((candidate) => candidate.id !== player.id)
      .map((candidate) => normalizePosition(candidate.position))
      .filter((node) => node.kind === "tile")
      .map((tile) => keyForTile(tile.x, tile.y))
  );

  const queue = [];
  const seenTiles = new Map();
  const tileDestinations = new Map();
  const roomDestinations = new Map();

  if (player.position.type === "room" && maxSteps >= 1) {
    for (const door of match.board.rooms[player.position.roomId].doors) {
      const key = keyForTile(door.x, door.y);
      if (occupiedTiles.has(key)) {
        continue;
      }
      seenTiles.set(key, 1);
      queue.push({ x: door.x, y: door.y, steps: 1 });
      tileDestinations.set(`tile:${key}`, { kind: "tile", x: door.x, y: door.y, steps: 1 });
    }
  } else {
    const startKey = keyForTile(player.position.x, player.position.y);
    seenTiles.set(startKey, 0);
    queue.push({ x: player.position.x, y: player.position.y, steps: 0 });
  }

  while (queue.length) {
    const current = queue.shift();
    if (current.steps > maxSteps) {
      continue;
    }

    const currentTile = match.board.tiles[current.y][current.x];
    if (currentTile.type === "door" && currentTile.roomId) {
      const roomKey = `room:${currentTile.roomId}`;
      const existingRoom = roomDestinations.get(roomKey);
      if (!existingRoom || current.steps < existingRoom.steps) {
        roomDestinations.set(roomKey, { kind: "room", roomId: currentTile.roomId, steps: current.steps });
      }
    }

    for (const neighbor of orthogonalNeighbors(current.x, current.y)) {
      if (!isInBounds(neighbor.x, neighbor.y)) {
        continue;
      }
      const nextTile = match.board.tiles[neighbor.y][neighbor.x];
      if (!["hallway", "door", "start"].includes(nextTile.type)) {
        continue;
      }
      const nextSteps = current.steps + 1;
      if (nextSteps > maxSteps) {
        continue;
      }
      const key = keyForTile(neighbor.x, neighbor.y);
      if (occupiedTiles.has(key)) {
        continue;
      }
      if (seenTiles.has(key) && seenTiles.get(key) <= nextSteps) {
        continue;
      }
      seenTiles.set(key, nextSteps);
      queue.push({ x: neighbor.x, y: neighbor.y, steps: nextSteps });
      tileDestinations.set(`tile:${key}`, { kind: "tile", x: neighbor.x, y: neighbor.y, steps: nextSteps });
    }
  }

  return [...tileDestinations.values(), ...roomDestinations.values()].filter((destination) => {
    if (destination.kind === "tile") {
      const tile = match.board.tiles[destination.y][destination.x];
      if (occupiedTiles.has(keyForTile(destination.x, destination.y))) {
        return false;
      }
      return ["hallway", "door", "start"].includes(tile.type);
    }
    if (destination.kind === "room") {
      const currentRoomId = player.position.type === "room" ? player.position.roomId : null;
      return destination.roomId !== currentRoomId;
    }
    return false;
  });
}
