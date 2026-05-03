# Clue / Cluedo Web Game Implementation Plan

## Product Goal

Build a web-based multiplayer Clue / Cluedo game for **2 to 6 players** that keeps the feel of the classic board game while adding replay value through a **procedurally generated board layout at the start of each match**.

The generated map must still clearly read as Clue:

- 9 named rooms
- surrounding hallway network on a grid
- secret tunnels between corner rooms
- player start positions around the outer board
- one hidden solution made from suspect + weapon + room
- core turn flow: move, suggest, disprove, accuse

This document is written as the implementation spec for the first version of the game.

## Scope

## In Scope

- Browser-based multiplayer game
- 2 to 6 human players
- Private game room / lobby with join code or URL
- Classic Clue rules
- Generated board per match with classic structure retained
- Turn management and rule enforcement
- Card dealing, suggestion, disproval, accusation
- Simple chat / game log
- Use provided generated images for suspects, rooms, and weapons

## Out of Scope For V1

- AI players
- Voice chat
- Match replay system
- Advanced animations
- Ranked matchmaking
- Mobile app store release

## Core Design Principles

- Preserve the identity of classic Clue more than novelty
- Add variety through layout generation, not through changing the rules
- Keep the game readable at a glance
- Make the rules engine authoritative so clients cannot cheat
- Support desktop first, but remain usable on tablets and large phones

## Game Content

## Suspects

Use the classic six suspects:

- Miss Scarlet
- Colonel Mustard
- Mrs. White
- Reverend Green / Mr. Green
- Mrs. Peacock
- Professor Plum

All six suspect cards exist in every match. Only the chosen player characters are active pawns on the board.

## Weapons

Use six classic weapons:

- Candlestick
- Dagger
- Lead Pipe
- Revolver
- Rope
- Wrench / Spanner

## Rooms

Use nine classic rooms:

- Kitchen
- Ballroom
- Conservatory
- Dining Room
- Billiard Room
- Library
- Lounge
- Hall
- Study

## Player Count

- Minimum: 2 players
- Maximum: 6 players

The full suspect deck is always used for the mystery, regardless of player count.

## Rules Summary

## Setup

1. Create one hidden solution:
   - 1 suspect
   - 1 weapon
   - 1 room
2. Shuffle the remaining cards.
3. Deal the remaining cards as evenly as possible among all active players.
4. Assign each player a suspect pawn.
5. Place each pawn at its defined starting space.
6. Generate the board for this match before the first turn starts.

## Turn Flow

Each turn:

1. Player rolls movement value or uses deterministic movement allowance if dice are removed in digital mode.
2. Player moves through hallway tiles according to movement rules.
3. If the player enters a room, they may make a suggestion.
4. Other players attempt to disprove in clockwise order.
5. The active player may end the turn.
6. At most once per turn, the player may make a final accusation instead of or after movement, depending on the final chosen ruleset.

Recommendation for V1:

- Keep the classic single die or two-die movement feel, but implement as **2d6** to match common Cluedo expectations.
- Allow accusation once per turn from anywhere, matching many digital adaptations.

## Suggestion Rules

When inside a room, the active player may suggest:

- one suspect
- one weapon
- the room they are currently in

Effects:

- The named suspect pawn is moved into the suggested room
- The named weapon is visually associated with that room for the moment or until changed later
- Other players try to disprove in turn order
- Only the suggesting player sees which single card was shown

## Disproval Rules

- Starting with the next player clockwise, each player checks whether they hold any of the three suggested cards
- The first player who can disprove must privately show exactly one matching card
- If nobody can disprove, the suggestion remains fully unchallenged

## Accusation Rules

- A player may accuse suspect + weapon + room
- If correct, they immediately win
- If incorrect, they are eliminated from winning but may still continue to show cards when others make suggestions
- Their pawn no longer takes normal turns

## Win Condition

The first correct accusation wins the match.

## Board Design

## Overall Board Structure

The board should stay faithful to the classic Clue silhouette:

- Rectangular grid board
- Rooms arranged roughly in a 3 x 3 macro layout
- Hallways between rooms
- Several chokepoints and door-based room access
- Four corner rooms
- Secret tunnels between opposite diagonal corner rooms

Recommended board grid:

- Logical grid: around **25 x 25** to **29 x 29**
- Render tiles as square cells
- Use metadata per tile: wall, hallway, doorway, room-interior, blocked, start-space, tunnel

## Fixed Classic Relationships To Preserve

These should remain invariant even when the map is generated:

- Kitchen remains a corner room
- Conservatory remains a corner room
- Lounge remains a corner room
- Study remains a corner room
- Ballroom remains top-center
- Hall remains bottom-center
- Center and side rooms stay in approximately classic positions
- Rooms are connected only through doors, not free edge overlap
- Secret tunnels always connect the two diagonal corner-room pairs in the generated layout

## Procedural Generation Strategy

Do **not** fully randomize the board. Instead, generate within guardrails.

Use a **template-driven procedural system**:

1. Start from a canonical 3 x 3 room placement template.
2. Assign each room a bounded generation zone.
3. Randomly vary within those zones:
   - room footprint width / height
   - exact doorway positions
   - hallway width patterns
   - wall indentations / alcoves
   - obstacle nubs or decorative interior shapes
   - spawn tile offsets near each start area
4. Rebuild hallway graph to ensure all legal spaces remain connected.
5. Validate reachability and rule constraints before finalizing.

This gives variety while ensuring the board still feels like Clue.

## Secret Tunnels

Always preserve:

- secret tunnels must connect the two diagonal corner-room pairs
- in each generated layout, the top-left corner room connects to the bottom-right corner room
- in each generated layout, the top-right corner room connects to the bottom-left corner room

Implementation:

- entering a tunnel-enabled room gives a visible action to use the tunnel on the player’s turn
- using a tunnel moves the pawn directly into the destination room and ends movement
