export const BOARD_SIZE = 25;

export const SUSPECTS = [
  { id: "scarlet", name: "Miss Scarlet", color: "#c63b3b", accent: "#ffcabf", startKey: "scarlet", artCell: { x: 0, y: 0 }, chessCell: { x: 0, y: 0 } },
  { id: "mustard", name: "Colonel Mustard", color: "#d1a62b", accent: "#ffefb3", startKey: "mustard", artCell: { x: 1, y: 0 }, chessCell: { x: 1, y: 0 } },
  { id: "white", name: "Mrs. White", color: "#ebebdf", accent: "#ffffff", startKey: "white", artCell: { x: 2, y: 1 }, chessCell: { x: 2, y: 1 } },
  { id: "green", name: "Mr. Green", color: "#4f925c", accent: "#d5f3d9", startKey: "green", artCell: { x: 1, y: 1 }, chessCell: { x: 1, y: 1 } },
  { id: "peacock", name: "Mrs. Peacock", color: "#396dbf", accent: "#cee3ff", startKey: "peacock", artCell: { x: 2, y: 0 }, chessCell: { x: 2, y: 0 } },
  { id: "plum", name: "Professor Plum", color: "#7a4c8f", accent: "#efd8ff", startKey: "plum", artCell: { x: 0, y: 1 }, chessCell: { x: 0, y: 1 } },
];

export const WEAPONS = [
  { id: "candlestick", name: "Candlestick", artCell: { x: 0, y: 0 } },
  { id: "dagger", name: "Dagger", artCell: { x: 1, y: 0 } },
  { id: "lead-pipe", name: "Lead Pipe", artCell: { x: 2, y: 0 } },
  { id: "revolver", name: "Revolver", artCell: { x: 0, y: 1 } },
  { id: "rope", name: "Rope", artCell: { x: 1, y: 1 } },
  { id: "wrench", name: "Wrench", artCell: { x: 2, y: 1 } },
];

export const ROOM_BLUEPRINTS = [
  { id: "kitchen", name: "Kitchen", zone: { x1: 0, y1: 0, x2: 6, y2: 6 }, minW: 5, maxW: 6, minH: 5, maxH: 6, row: 0, col: 0, artCell: { x: 2, y: 2 }, flavor: "Stone Hearth" },
  { id: "ballroom", name: "Ballroom", zone: { x1: 8, y1: 0, x2: 16, y2: 6 }, minW: 6, maxW: 8, minH: 5, maxH: 6, row: 0, col: 1, artCell: { x: 1, y: 2 }, flavor: "Gilded Floor" },
  { id: "conservatory", name: "Conservatory", zone: { x1: 18, y1: 0, x2: 24, y2: 6 }, minW: 5, maxW: 6, minH: 5, maxH: 6, row: 0, col: 2, artCell: { x: 0, y: 2 }, flavor: "Iron Glass" },
  { id: "dining-room", name: "Dining Room", zone: { x1: 0, y1: 8, x2: 6, y2: 16 }, minW: 5, maxW: 6, minH: 6, maxH: 8, row: 1, col: 0, artCell: { x: 1, y: 1 }, flavor: "Walnut Banquet" },
  { id: "billiard-room", name: "Billiard Room", zone: { x1: 8, y1: 8, x2: 16, y2: 12 }, minW: 5, maxW: 7, minH: 4, maxH: 5, row: 1, col: 1, artCell: { x: 2, y: 1 }, flavor: "Ash Felt" },
  { id: "library", name: "Library", zone: { x1: 18, y1: 8, x2: 24, y2: 16 }, minW: 5, maxW: 6, minH: 6, maxH: 8, row: 1, col: 2, artCell: { x: 0, y: 1 }, flavor: "Mahogany Stacks" },
  { id: "lounge", name: "Lounge", zone: { x1: 0, y1: 18, x2: 6, y2: 24 }, minW: 5, maxW: 6, minH: 5, maxH: 6, row: 2, col: 0, artCell: { x: 2, y: 0 }, flavor: "Velvet Firelight" },
  { id: "hall", name: "Hall", zone: { x1: 8, y1: 18, x2: 16, y2: 24 }, minW: 6, maxW: 8, minH: 5, maxH: 6, row: 2, col: 1, artCell: { x: 1, y: 0 }, flavor: "Stone Stair" },
  { id: "study", name: "Study", zone: { x1: 18, y1: 18, x2: 24, y2: 24 }, minW: 5, maxW: 6, minH: 5, maxH: 6, row: 2, col: 2, artCell: { x: 0, y: 0 }, flavor: "Oak Conspiracy" },
];

export const START_BLUEPRINTS = {
  scarlet: { x: 11, y: 24 },
  mustard: { x: 18, y: 17 },
  white: { x: 8, y: 0 },
  green: { x: 24, y: 11 },
  peacock: { x: 18, y: 0 },
  plum: { x: 0, y: 18 },
};
